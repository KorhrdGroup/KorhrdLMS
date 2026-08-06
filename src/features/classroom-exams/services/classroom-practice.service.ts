import { resolveClassroomAccess } from "@/features/classroom-lectures/services/classroom-lecture.service";
import { createClient } from "@/lib/supabase/server";
import type { ExamQuestionRow } from "@/features/classroom-exams/repositories/classroom-exam.repository";

/**
 * 강의실 "기출문제 풀이".
 *
 * 성적에 반영되는 시험(`getClassroomExamTaking`)과 달리 채점·제출이 없고,
 * 학생이 직접 정답을 열어보며 공부하는 용도입니다. 그래서 **정답을 함께 내려줍니다.**
 * (실제 시험은 정답을 절대 클라이언트로 보내지 않습니다 — 그 규칙은 그대로 둡니다)
 *
 * 문제는 별도 테이블을 만들지 않고 기존 `exams` 를 씁니다.
 * 구분은 `exam_type = 'practice'` — 이 값이면 응시 대상 시험 목록에 섞이지 않고
 * 기출문제로만 노출됩니다.
 */
export type PracticeChoice = { id: string; text: string };

export type PracticeQuestion = {
  id: string;
  order: number;
  question: string;
  choices: PracticeChoice[];
  /** 정답 보기 버튼을 눌렀을 때 보여줄 값 */
  answer: string;
  score: number;
};

export type PracticeSet = {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  questions: PracticeQuestion[];
};

function toChoices(row: ExamQuestionRow): PracticeChoice[] {
  if (row.question_type === "ox") {
    return [
      { id: "1", text: "O" },
      { id: "2", text: "X" },
    ];
  }
  if (row.question_type === "short_answer") {
    return [];
  }

  const raw: Array<[string, string | null]> = [
    ["1", row.choice1],
    ["2", row.choice2],
    ["3", row.choice3],
    ["4", row.choice4],
    ["5", row.choice5],
  ];
  return raw.filter(([, text]) => Boolean(text)).map(([id, text]) => ({ id, text: text! }));
}

/** 과정의 기출문제 묶음 목록(제목만). 강의실에서 고르게 합니다. */
export async function listPracticeSets(memberId: string, courseCode: string) {
  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);
  if (!access) return null;

  const { data, error } = await supabase
    .from("exams")
    .select("id, name, question_count")
    .eq("course_id", access.course.id)
    .eq("exam_type", "practice")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return {
    courseCode: access.course.code,
    courseTitle: access.course.name,
    sets: ((data ?? []) as { id: string; name: string; question_count: number }[]).map((row) => ({
      id: row.id,
      title: row.name,
      questionCount: row.question_count,
    })),
  };
}

/** 기출문제 한 묶음의 문제·정답. 수강 중인 과정만 열립니다. */
export async function getPracticeSet(
  memberId: string,
  courseCode: string,
  practiceId: string,
): Promise<PracticeSet | null> {
  if (!memberId.trim() || !courseCode.trim() || !practiceId.trim()) return null;

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);
  if (!access) return null;

  const { data: examRow, error: examError } = await supabase
    .from("exams")
    .select("id, name")
    .eq("id", practiceId)
    .eq("course_id", access.course.id)
    .eq("exam_type", "practice")
    .is("deleted_at", null)
    .maybeSingle();

  if (examError) throw new Error(examError.message);
  if (!examRow) return null;

  const { data: questionRows, error: questionError } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("exam_id", practiceId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (questionError) throw new Error(questionError.message);

  const rows = (questionRows ?? []) as ExamQuestionRow[];

  return {
    id: examRow.id as string,
    title: examRow.name as string,
    courseCode: access.course.code,
    courseTitle: access.course.name,
    questions: rows.map((row, index) => ({
      id: row.id,
      order: index + 1,
      question: row.question,
      choices: toChoices(row),
      answer: row.answer,
      score: row.score,
    })),
  };
}
