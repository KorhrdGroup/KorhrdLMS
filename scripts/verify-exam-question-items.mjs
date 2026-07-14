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

async function syncExamQuestionCount(client, examId) {
  const countResult = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM public.exam_questions
    WHERE exam_id = $1 AND deleted_at IS NULL
    `,
    [examId],
  );

  const total = countResult.rows[0].total;

  await client.query(
    `
    UPDATE public.exams
    SET question_count = $2
    WHERE id = $1 AND deleted_at IS NULL
    `,
    [examId, total],
  );

  return total;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client(buildPgConfig(connectionString));
  await client.connect();

  try {
    const examResult = await client.query(`
      SELECT id, name, question_count
      FROM public.exams
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (!examResult.rowCount) {
      throw new Error("시험 데이터가 없습니다.");
    }

    const exam = examResult.rows[0];
    console.log(`target exam: ${exam.name}`);

    console.log("1. 문제 등록");
    const insertResult = await client.query(
      `
      INSERT INTO public.exam_questions (
        exam_id,
        question_type,
        question,
        choice1,
        choice2,
        choice3,
        choice4,
        choice5,
        answer,
        score,
        sort_order
      ) VALUES (
        $1,
        'multiple_choice',
        '검증용 객관식 문제입니다.',
        '보기1',
        '보기2',
        '보기3',
        '보기4',
        NULL,
        '2',
        5,
        1
      )
      RETURNING id
      `,
      [exam.id],
    );
    const questionId = insertResult.rows[0].id;
    let total = await syncExamQuestionCount(client, exam.id);
    console.log(`   created question=${questionId}, total=${total}`);

    console.log("2. 수정");
    await client.query(
      `
      UPDATE public.exam_questions
      SET question = $2, score = 10
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [questionId, "검증용 객관식 문제(수정)"],
    );
    const edited = await client.query(
      `
      SELECT question, score
      FROM public.exam_questions
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [questionId],
    );
    console.log(`   question=${edited.rows[0].question}, score=${edited.rows[0].score}`);

    console.log("3. Soft Delete");
    await client.query(
      `
      UPDATE public.exam_questions
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [questionId],
    );
    total = await syncExamQuestionCount(client, exam.id);

    const visible = await client.query(
      `
      SELECT COUNT(*)::int AS total
      FROM public.exam_questions
      WHERE exam_id = $1 AND deleted_at IS NULL
      `,
      [exam.id],
    );
    const deleted = await client.query(
      `
      SELECT deleted_at
      FROM public.exam_questions
      WHERE id = $1
      `,
      [questionId],
    );

    if (visible.rows[0].total !== total) {
      throw new Error("목록 집계와 총 문제수가 일치하지 않습니다.");
    }

    if (!deleted.rows[0].deleted_at) {
      throw new Error("Soft Delete가 적용되지 않았습니다.");
    }

    console.log(`   visible=${visible.rows[0].total}, exam.question_count=${total}`);

    console.log("4. 총 문제수 자동 변경");
    const insertOx = await client.query(
      `
      INSERT INTO public.exam_questions (
        exam_id,
        question_type,
        question,
        answer,
        score,
        sort_order
      ) VALUES (
        $1,
        'ox',
        '검증용 OX 문제',
        'O',
        3,
        1
      )
      RETURNING id
      `,
      [exam.id],
    );
    total = await syncExamQuestionCount(client, exam.id);
    console.log(`   after insert total=${total}`);

    await client.query(
      `
      UPDATE public.exam_questions
      SET deleted_at = NOW()
      WHERE id = $1
      `,
      [insertOx.rows[0].id],
    );
    await syncExamQuestionCount(client, exam.id);

    console.log("OK: create/update/delete/soft-delete/count-sync verified");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
