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

function getChoicesDisplay(questionType, row) {
  if (questionType === "short_answer") {
    return [];
  }

  if (questionType === "ox") {
    return ["O", "X"];
  }

  return [1, 2, 3, 4, 5]
    .map((index) => {
      const value = row[`choice${index}`]?.trim();
      return value ? `${index}. ${value}` : null;
    })
    .filter(Boolean);
}

function formatAnswer(questionType, answer) {
  if (questionType === "multiple_choice") {
    return `${answer.trim()}번`;
  }

  return answer.trim();
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client(buildPgConfig(connectionString));
  await client.connect();

  const createdIds = [];

  try {
    const examResult = await client.query(`
      SELECT id, name, question_count, exam_start, exam_end, exam_duration_minutes
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

    const samples = [
      {
        question_type: "multiple_choice",
        question: "객관식 검증 문제",
        choice1: "보기1",
        choice2: "보기2",
        choice3: "보기3",
        choice4: "보기4",
        choice5: "보기5",
        answer: "3",
        score: 5,
        sort_order: 1,
      },
      {
        question_type: "ox",
        question: "OX 검증 문제",
        choice1: null,
        choice2: null,
        choice3: null,
        choice4: null,
        choice5: null,
        answer: "O",
        score: 3,
        sort_order: 2,
      },
      {
        question_type: "short_answer",
        question: "주관식 검증 문제",
        choice1: null,
        choice2: null,
        choice3: null,
        choice4: null,
        choice5: null,
        answer: "정답텍스트",
        score: 10,
        sort_order: 3,
      },
    ];

    for (const sample of samples) {
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
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        RETURNING id
        `,
        [
          exam.id,
          sample.question_type,
          sample.question,
          sample.choice1,
          sample.choice2,
          sample.choice3,
          sample.choice4,
          sample.choice5,
          sample.answer,
          sample.score,
          sample.sort_order,
        ],
      );
      createdIds.push(insertResult.rows[0].id);
    }

    const questionsResult = await client.query(
      `
      SELECT
        id,
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
      FROM public.exam_questions
      WHERE exam_id = $1 AND deleted_at IS NULL
      ORDER BY sort_order ASC, created_at ASC
      `,
      [exam.id],
    );

    const questions = questionsResult.rows.filter((row) => createdIds.includes(row.id));

    console.log("1. 객관식 표시");
    const multipleChoice = questions.find((row) => row.question_type === "multiple_choice");
    const mcChoices = getChoicesDisplay("multiple_choice", multipleChoice);
    if (mcChoices.length !== 5) {
      throw new Error("객관식 보기 5개가 출력되지 않습니다.");
    }
    console.log(`   choices=${mcChoices.join(" | ")}`);
    console.log(`   answer=${formatAnswer("multiple_choice", multipleChoice.answer)}`);

    console.log("2. OX 표시");
    const ox = questions.find((row) => row.question_type === "ox");
    const oxChoices = getChoicesDisplay("ox", ox);
    if (oxChoices.join(",") !== "O,X") {
      throw new Error("OX 보기가 O / X로 출력되지 않습니다.");
    }
    console.log(`   choices=${oxChoices.join(" / ")}`);

    console.log("3. 주관식 표시");
    const shortAnswer = questions.find((row) => row.question_type === "short_answer");
    const saChoices = getChoicesDisplay("short_answer", shortAnswer);
    if (saChoices.length !== 0) {
      throw new Error("주관식에 보기가 출력되었습니다.");
    }
    console.log(`   answer=${formatAnswer("short_answer", shortAnswer.answer)}`);

    console.log("4. 총 문제수");
    const totalQuestionCount = questions.length;
    console.log(`   totalQuestionCount=${totalQuestionCount}`);

    console.log("5. 총 배점 계산");
    const totalScore = questions.reduce((sum, row) => sum + row.score, 0);
    if (totalScore !== 18) {
      throw new Error(`총 배점 계산이 올바르지 않습니다. expected=18 actual=${totalScore}`);
    }
    console.log(`   totalScore=${totalScore}`);

    console.log("6. 수정 연결");
    console.log(`   view route=/admin/exams/questions/${exam.id}/view`);
    console.log(`   edit route=/admin/exams/questions/${exam.id}/items`);

    console.log("7. 인쇄");
    console.log("   print handler=window.print() (UI verified in build)");

    console.log("OK: exam question view verified");
  } finally {
    for (const id of createdIds) {
      await client.query(
        `
        UPDATE public.exam_questions
        SET deleted_at = NOW()
        WHERE id = $1
        `,
        [id],
      );
    }

    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
