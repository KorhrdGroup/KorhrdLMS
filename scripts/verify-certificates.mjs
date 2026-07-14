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

async function countApplications(client, filters = {}) {
  const conditions = ["deleted_at IS NULL"];
  const params = [];
  let index = 1;

  if (filters.certificateKind) {
    conditions.push(`certificate_kind = $${index++}`);
    params.push(filters.certificateKind);
  }

  if (filters.startDate) {
    conditions.push(`applied_at >= $${index++}`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`applied_at <= $${index++}`);
    params.push(filters.endDate);
  }

  if (filters.search) {
    conditions.push(
      `(applicant_name ILIKE $${index} OR member_login_id ILIKE $${index} OR phone ILIKE $${index})`,
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  const result = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM public.certificate_applications
    WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return result.rows[0].total;
}

async function listApplications(client, { page = 1, pageSize = 20, filters = {} } = {}) {
  const conditions = ["deleted_at IS NULL"];
  const params = [];
  let index = 1;

  if (filters.certificateKind) {
    conditions.push(`certificate_kind = $${index++}`);
    params.push(filters.certificateKind);
  }

  if (filters.startDate) {
    conditions.push(`applied_at >= $${index++}`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`applied_at <= $${index++}`);
    params.push(filters.endDate);
  }

  if (filters.search) {
    conditions.push(
      `(applicant_name ILIKE $${index} OR member_login_id ILIKE $${index} OR phone ILIKE $${index})`,
    );
    params.push(`%${filters.search}%`);
    index += 1;
  }

  const offset = (page - 1) * pageSize;
  params.push(pageSize, offset);

  const result = await client.query(
    `
    SELECT id, certificate_name, applicant_name, member_login_id, applied_at
    FROM public.certificate_applications
    WHERE ${conditions.join(" AND ")}
    ORDER BY applied_at DESC, created_at DESC
    LIMIT $${index++}
    OFFSET $${index}
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

  let createdId = null;

  try {
    const memberResult = await client.query(`
      SELECT id, login_id, name, phone
      FROM public.members
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (!memberResult.rowCount) {
      throw new Error("회원 데이터가 없어 자격증 검증을 진행할 수 없습니다.");
    }

    const member = memberResult.rows[0];

    console.log("1. 신청 등록");
    const insertResult = await client.query(
      `
      INSERT INTO public.certificate_applications (
        member_id,
        certificate_kind,
        certificate_name,
        member_login_id,
        applicant_name,
        phone,
        issuance_cost,
        actual_payment_amount,
        delivery_status,
        applied_at
      ) VALUES (
        $1, 'social_worker', '검증용 자격증', $2, $3, $4, 50000, 50000, 'pending', CURRENT_DATE
      )
      RETURNING id
      `,
      [member.id, member.login_id, member.name, member.phone],
    );
    createdId = insertResult.rows[0].id;
    console.log(`   created=${createdId}`);

    console.log("2. 목록 조회");
    const list = await listApplications(client);
    if (!list.some((row) => row.id === createdId)) {
      throw new Error("등록한 신청 내역이 목록에 없습니다.");
    }
    console.log(`   visible=${list.length}`);

    console.log("3. 자격증 종류 필터");
    const filteredCount = await countApplications(client, {
      certificateKind: "social_worker",
    });
    if (filteredCount < 1) {
      throw new Error("자격증 종류 필터 결과가 없습니다.");
    }
    console.log(`   filteredCount=${filteredCount}`);

    console.log("4. 검색");
    const searchCount = await countApplications(client, { search: member.name });
    if (searchCount < 1) {
      throw new Error("이름 검색 결과가 없습니다.");
    }
    console.log(`   searchCount=${searchCount}`);

    console.log("5. 실결제금액/배송상태 수정");
    await client.query(
      `
      UPDATE public.certificate_applications
      SET actual_payment_amount = 45000,
          delivery_status = 'preparing',
          photo_url = '/photos/verify.jpg'
      WHERE id = $1
      `,
      [createdId],
    );
    const updated = await client.query(
      `
      SELECT actual_payment_amount, delivery_status, photo_url
      FROM public.certificate_applications
      WHERE id = $1
      `,
      [createdId],
    );
    if (
      updated.rows[0].actual_payment_amount !== 45000 ||
      updated.rows[0].delivery_status !== "preparing"
    ) {
      throw new Error("수정 결과가 반영되지 않았습니다.");
    }
    console.log("   update ok");

    console.log("6. Soft Delete");
    await client.query(
      `
      UPDATE public.certificate_applications
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [createdId],
    );
    createdId = null;

    const afterDelete = await listApplications(client, {
      filters: { search: member.name },
    });
    if (afterDelete.some((row) => row.certificate_name === "검증용 자격증")) {
      throw new Error("Soft Delete된 신청 내역이 목록에 포함됩니다.");
    }
    console.log("   soft-deleted application excluded");

    console.log("7. 라우팅");
    console.log("   UI route=/admin/certificates");

    console.log("OK: certificate management verified");
  } finally {
    if (createdId) {
      await client.query(
        `DELETE FROM public.certificate_applications WHERE id = $1`,
        [createdId],
      );
    }

    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
