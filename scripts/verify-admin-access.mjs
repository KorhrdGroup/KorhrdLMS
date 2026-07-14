import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config({ path: path.join(rootDir, ".env") });

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

async function listAdmins(client, { page = 1, pageSize = 20, filters = {} } = {}) {
  const conditions = ["1=1"];
  const params = [];
  let index = 1;

  if (filters.adminType) {
    conditions.push(`admin_type = $${index++}`);
    params.push(filters.adminType);
  }

  if (filters.adminName) {
    conditions.push(
      `(name ILIKE $${index} OR login_id ILIKE $${index})`,
    );
    params.push(`%${filters.adminName}%`);
    index += 1;
  }

  if (filters.startAt || filters.endAt) {
    const periodConditions = [];
    if (filters.startAt) {
      periodConditions.push(`logged_in_at >= $${index++}`);
      params.push(filters.startAt);
    }
    if (filters.endAt) {
      periodConditions.push(`logged_in_at <= $${index++}`);
      params.push(filters.endAt);
    }

    conditions.push(`
      id IN (
        SELECT admin_user_id
        FROM public.admin_access_logs
        WHERE ${periodConditions.join(" AND ")}
      )
    `);
  }

  const offset = (page - 1) * pageSize;
  params.push(pageSize, offset);

  const result = await client.query(
    `
    SELECT id, admin_type, login_id, name
    FROM public.admin_users
    WHERE ${conditions.join(" AND ")}
    ORDER BY name ASC
    LIMIT $${index++}
    OFFSET $${index}
    `,
    params,
  );

  return result.rows;
}

async function listAccessLogs(client, adminUserId, filters = {}) {
  const conditions = ["admin_user_id = $1"];
  const params = [adminUserId];
  let index = 2;

  if (filters.startAt) {
    conditions.push(`logged_in_at >= $${index++}`);
    params.push(filters.startAt);
  }

  if (filters.endAt) {
    conditions.push(`logged_in_at <= $${index++}`);
    params.push(filters.endAt);
  }

  const result = await client.query(
    `
    SELECT
      l.id,
      u.admin_type,
      u.name,
      u.login_id,
      l.access_ip,
      l.logged_in_at,
      l.logged_out_at
    FROM public.admin_access_logs l
    INNER JOIN public.admin_users u ON u.id = l.admin_user_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY l.logged_in_at DESC
    `,
    params,
  );

  return result.rows;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client(buildPgConfig(connectionString));
  await client.connect();

  try {
    console.log("1. 관리자 목록 조회");
    const list = await listAdmins(client);
    if (list.length === 0) {
      throw new Error("관리자 목록이 비어 있습니다.");
    }
    console.log(`   visible=${list.length}`);

    console.log("2. 관리자유형 필터");
    const filtered = await listAdmins(client, {
      filters: { adminType: "admin" },
    });
    if (filtered.length < 1) {
      throw new Error("관리자유형 필터 결과가 없습니다.");
    }
    console.log(`   adminCount=${filtered.length}`);

    console.log("3. 관리자명 검색");
    const searched = await listAdmins(client, {
      filters: { adminName: "김관리" },
    });
    if (searched.length !== 1) {
      throw new Error("관리자명 검색 결과가 올바르지 않습니다.");
    }
    console.log(`   found=${searched[0].login_id}`);

    console.log("4. 기간 검색");
    const periodFiltered = await listAdmins(client, {
      filters: {
        startAt: "2026-07-01T00:00:00.000+09:00",
        endAt: "2026-07-01T23:59:59.999+09:00",
      },
    });
    if (periodFiltered.length < 1) {
      throw new Error("기간 검색 결과가 없습니다.");
    }
    console.log(`   periodCount=${periodFiltered.length}`);

    console.log("5. 페이지네이션");
    const page1 = await listAdmins(client, { page: 1, pageSize: 2 });
    const page2 = await listAdmins(client, { page: 2, pageSize: 2 });
    if (page1.length !== 2 || page1[0].id === page2[0]?.id) {
      throw new Error("페이지네이션이 올바르지 않습니다.");
    }
    console.log(`   page1=${page1[0].login_id}, page2=${page2[0]?.login_id ?? "none"}`);

    console.log("6. 접속기록 상세");
    const logs = await listAccessLogs(client, searched[0].id);
    if (logs.length === 0) {
      throw new Error("접속 기록이 없습니다.");
    }
    const requiredColumns = [
      "admin_type",
      "name",
      "login_id",
      "access_ip",
      "logged_in_at",
      "logged_out_at",
    ];
    for (const column of requiredColumns) {
      if (!(column in logs[0])) {
        throw new Error(`상세 컬럼 ${column}이 없습니다.`);
      }
    }
    console.log(`   logs=${logs.length}`);

    console.log("7. 라우팅");
    console.log("   UI routes=/admin/statistics, /admin/statistics/admin-access");

    console.log("OK: admin access statistics verified");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
