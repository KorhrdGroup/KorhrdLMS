import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const migrationsDir = path.join(rootDir, "supabase", "migrations");

dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config({ path: path.join(rootDir, ".env") });

function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return null;
  }
}

function buildPgConfig(connectionString) {
  const parsed = new URL(connectionString);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "") || "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

const PLACEHOLDER_PATTERN = /\[YOUR-PASSWORD\]/i;

function isPlaceholderPassword(password) {
  return !password || PLACEHOLDER_PATTERN.test(password);
}

function getConnectionStrings() {
  const urls = [];

  for (const key of ["DIRECT_URL", "DATABASE_URL"]) {
    const value = process.env[key]?.trim();
    if (value) {
      urls.push({ key, value });
    }
  }

  return urls;
}

function assertValidCredentials() {
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const urls = getConnectionStrings();

  if (password && !isPlaceholderPassword(password)) {
    return;
  }

  const hasValidUrl = urls.some(({ value }) => {
    try {
      const config = buildPgConfig(value);
      return !isPlaceholderPassword(config.password);
    } catch {
      return false;
    }
  });

  if (hasValidUrl || process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    return;
  }

  throw new Error(
    [
      "Database credentials are missing or still use [YOUR-PASSWORD].",
      "Add one of the following to .env.local:",
      "  - DIRECT_URL (Session pooler, port 5432 — recommended for migrations)",
      "  - DATABASE_URL",
      "  - SUPABASE_DB_PASSWORD",
      "  - SUPABASE_ACCESS_TOKEN (Supabase personal access token)",
      "",
      "Supabase Dashboard → Settings → Database → Connection string",
    ].join("\n"),
  );
}

function getDatabaseConfigCandidates() {
  const candidates = [];
  const projectRef = getProjectRef();

  for (const { value: raw } of getConnectionStrings()) {
    try {
      const parsed = buildPgConfig(raw);
      if (isPlaceholderPassword(parsed.password)) {
        continue;
      }

      candidates.push(parsed);

      if (parsed.hostname.includes("pooler.supabase.com") && parsed.port === 6543) {
        candidates.push({
          ...parsed,
          port: 5432,
        });
      }

      if (projectRef) {
        candidates.push({
          host: `db.${projectRef}.supabase.co`,
          port: 5432,
          user: "postgres",
          password: parsed.password,
          database: "postgres",
          ssl: { rejectUnauthorized: false },
        });
      }
    } catch {
      // ignore malformed URL
    }
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (password && !isPlaceholderPassword(password) && projectRef) {
    candidates.push({
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      user: "postgres",
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
    });
  }

  return candidates.filter(
    (config, index, list) =>
      list.findIndex(
        (item) =>
          item.host === config.host &&
          item.port === config.port &&
          item.user === config.user,
      ) === index,
  );
}

async function runWithPg(sql) {
  const candidates = getDatabaseConfigCandidates();

  if (candidates.length === 0) {
    throw new Error(
      "DATABASE_URL or SUPABASE_DB_PASSWORD is required in .env.local to run migrations.",
    );
  }

  let lastError = null;

  for (const config of candidates) {
    const client = new pg.Client(config);

    try {
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log(`Connected via ${config.user}@${config.host}:${config.port}`);
      return;
    } catch (error) {
      lastError = error;
      try {
        await client.end();
      } catch {
        // ignore
      }
    }
  }

  throw lastError ?? new Error("Failed to connect to the database.");
}

async function runWithManagementApi(sql) {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const projectRef = getProjectRef();

  if (!accessToken || !projectRef) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN and NEXT_PUBLIC_SUPABASE_URL are required for Management API migrations.",
    );
  }

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Management API migration failed (${response.status}): ${body}`);
  }
}

async function runMigrationFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  console.log(`Running ${path.basename(filePath)}...`);

  assertValidCredentials();

  const candidates = getDatabaseConfigCandidates();
  if (candidates.length > 0) {
    try {
      await runWithPg(sql);
      return;
    } catch (error) {
      if (!process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
        throw error;
      }
      console.warn(`Direct connection failed: ${error.message}`);
      console.warn("Retrying via Supabase Management API...");
    }
  }

  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) {
    await runWithManagementApi(sql);
    return;
  }

  throw new Error(
    "Add DIRECT_URL, DATABASE_URL, SUPABASE_DB_PASSWORD, or SUPABASE_ACCESS_TOKEN to .env.local",
  );
}

async function main() {
  const only = process.argv[2];
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .filter((file) => !only || file === only)
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  for (const file of files) {
    await runMigrationFile(path.join(migrationsDir, file));
  }

  console.log("Migrations completed successfully.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
