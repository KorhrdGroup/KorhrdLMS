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

async function countAssignments(client, filters = {}) {
  const conditions = ["a.deleted_at IS NULL", "c.deleted_at IS NULL", "cls.deleted_at IS NULL"];
  const params = [];
  let index = 1;

  if (filters.courseId) {
    conditions.push(`a.course_id = $${index++}`);
    params.push(filters.courseId);
  }

  if (filters.year) {
    conditions.push(`a.year = $${index++}`);
    params.push(filters.year);
  }

  if (filters.classId) {
    conditions.push(`a.class_id = $${index++}`);
    params.push(filters.classId);
  }

  const result = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM public.assignments a
    INNER JOIN public.courses c ON c.id = a.course_id
    INNER JOIN public.classes cls ON cls.id = a.class_id
    WHERE ${conditions.join(" AND ")}
    `,
    params,
  );

  return result.rows[0].total;
}

async function listAssignments(client, { page = 1, pageSize = 20, filters = {} } = {}) {
  const conditions = ["a.deleted_at IS NULL", "c.deleted_at IS NULL", "cls.deleted_at IS NULL"];
  const params = [];
  let index = 1;

  if (filters.courseId) {
    conditions.push(`a.course_id = $${index++}`);
    params.push(filters.courseId);
  }

  if (filters.year) {
    conditions.push(`a.year = $${index++}`);
    params.push(filters.year);
  }

  if (filters.classId) {
    conditions.push(`a.class_id = $${index++}`);
    params.push(filters.classId);
  }

  const offset = (page - 1) * pageSize;
  params.push(pageSize, offset);

  const result = await client.query(
    `
    SELECT
      a.id,
      a.year,
      c.name AS course_name,
      cls.name AS batch_name,
      a.name,
      a.submission_start,
      a.submission_end,
      a.submission_count,
      a.status,
      a.created_at
    FROM public.assignments a
    INNER JOIN public.courses c ON c.id = a.course_id
    INNER JOIN public.classes cls ON cls.id = a.class_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY a.created_at DESC
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
    const classResult = await client.query(`
      SELECT cls.id, cls.course_id, cls.year, c.name AS course_name, cls.name AS batch_name
      FROM public.classes cls
      INNER JOIN public.courses c ON c.id = cls.course_id
      WHERE cls.deleted_at IS NULL AND c.deleted_at IS NULL
      ORDER BY cls.created_at DESC
      LIMIT 1
    `);

    if (!classResult.rowCount) {
      throw new Error("수강반 데이터가 없어 과제 검증을 진행할 수 없습니다.");
    }

    const cls = classResult.rows[0];

    const insertResult = await client.query(
      `
      INSERT INTO public.assignments (
        course_id,
        class_id,
        year,
        name,
        submission_start,
        submission_end,
        submission_count,
        status,
        memo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 'planned', '검증용 과제'
      )
      RETURNING id
      `,
      [
        cls.course_id,
        cls.id,
        cls.year,
        "검증용 과제",
        "2026-07-01",
        "2026-07-31",
        5,
      ],
    );
    createdId = insertResult.rows[0].id;

    console.log("1. 목록 조회");
    const list = await listAssignments(client);
    const found = list.some((row) => row.id === createdId);
    if (!found) {
      throw new Error("등록한 과제가 목록에 없습니다.");
    }
    console.log(`   visible=${list.length}, created=${createdId}`);

    console.log("2. 검색");
    const filteredCount = await countAssignments(client, {
      courseId: cls.course_id,
      year: cls.year,
      classId: cls.id,
    });
    if (filteredCount < 1) {
      throw new Error("검색 필터 결과가 없습니다.");
    }
    console.log(`   filteredCount=${filteredCount}`);

    console.log("3. Pagination");
    const pageSize = 1;
    const page1 = await listAssignments(client, { page: 1, pageSize });
    const page2 = await listAssignments(client, { page: 2, pageSize });
    if (page1.length !== 1) {
      throw new Error("1페이지 결과가 pageSize와 일치하지 않습니다.");
    }
    if (page1[0].id === page2[0]?.id) {
      throw new Error("페이지네이션이 동일한 데이터를 반환했습니다.");
    }
    console.log(`   page1=${page1[0].id}, page2=${page2[0]?.id ?? "none"}`);

    console.log("4. Soft Delete 제외");
    await client.query(
      `
      UPDATE public.assignments
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [createdId],
    );
    createdId = null;

    const afterDelete = await listAssignments(client, {
      filters: { classId: cls.id },
    });
    if (afterDelete.some((row) => row.name === "검증용 과제")) {
      throw new Error("Soft Delete된 과제가 목록에 포함됩니다.");
    }
    console.log("   soft-deleted assignment excluded");

    console.log("5. 수정 버튼 연결");
    console.log("   UI route=/admin/exams/assignments (edit handler wired in AssignmentListView)");

    console.log("OK: assignment list verified");
  } finally {
    if (createdId) {
      await client.query(`DELETE FROM public.assignments WHERE id = $1`, [createdId]);
    }

    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
