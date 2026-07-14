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

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client(buildPgConfig(connectionString));
  await client.connect();

  try {
    const result = await client.query(`
      SELECT
        cp.id,
        cp.payment_number,
        cp.product_name,
        cp.payment_date,
        cp.payment_method,
        cp.amount,
        cp.deposit_bank,
        cp.depositor_name,
        cp.virtual_account_number,
        cp.class_start_date,
        cp.class_end_date,
        cp.shipping_address,
        cp.approved_at,
        cp.status,
        cp.memo,
        m.login_id,
        m.name,
        m.phone,
        c.name AS course_name
      FROM public.course_payments cp
      INNER JOIN public.members m ON m.id = cp.member_id
      INNER JOIN public.courses c ON c.id = cp.course_id
      WHERE cp.deleted_at IS NULL
        AND m.deleted_at IS NULL
        AND c.deleted_at IS NULL
      ORDER BY cp.payment_date DESC
      LIMIT 1
    `);

    if (!result.rowCount) {
      throw new Error("결제 데이터가 없습니다.");
    }

    const row = result.rows[0];
    const requiredFields = [
      "payment_number",
      "product_name",
      "login_id",
      "name",
      "payment_date",
      "payment_method",
      "amount",
      "status",
    ];

    for (const field of requiredFields) {
      if (row[field] == null || row[field] === "") {
        throw new Error(`상세조회 필수값 누락: ${field}`);
      }
    }

    const allowedStatuses = ["pending", "approved", "canceled", "deposit_expired"];
    if (!allowedStatuses.includes(row.status)) {
      throw new Error(`허용되지 않은 결제상태: ${row.status}`);
    }

    console.log(`detail target=${row.id}`);
    console.log(`status=${row.status}, payment_number=${row.payment_number}`);
    console.log(`member=${row.name}(${row.login_id}), product=${row.product_name}`);
    console.log("OK: subject payment detail fields verified");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
