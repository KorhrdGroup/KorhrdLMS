import { IN_PROGRESS_COURSES } from "@/components/classroom/data/classroom-data";

/**
 * Mock question bank for the 학습강의실 시험 응시 화면.
 *
 * Mirrors the shape a future `exam_questions` table would take:
 *   id, exam_id, text, choices (exam_choices: id, text, is_correct)
 * so swapping this module for a Supabase query later is a drop-in
 * replacement for the exam-taking screen.
 */

export type ExamChoice = {
  id: string;
  text: string;
};

export type ExamQuestion = {
  id: string;
  text: string;
  choices: ExamChoice[];
  correctChoiceId: string;
};

const CAREGIVER_QUESTIONS: ExamQuestion[] = [
  {
    id: "q1",
    text: "간병사가 지켜야 할 직업윤리로 가장 옳지 않은 것은?",
    choices: [
      { id: "a", text: "대상자의 개인정보와 사생활을 보호한다." },
      { id: "b", text: "대상자의 동의 없이 신체를 노출시켜 처치한다." },
      { id: "c", text: "대상자를 인격체로 존중하며 차별하지 않는다." },
      { id: "d", text: "업무 범위를 벗어난 의료행위는 하지 않는다." },
    ],
    correctChoiceId: "b",
  },
  {
    id: "q2",
    text: "감염 예방을 위한 손 씻기에 대한 설명으로 옳은 것은?",
    choices: [
      { id: "a", text: "장갑을 착용하면 손을 씻지 않아도 된다." },
      { id: "b", text: "물 없이 눈에 보이는 오염만 없으면 씻지 않아도 된다." },
      { id: "c", text: "처치 전후, 대상자 접촉 전후에는 반드시 손을 씻는다." },
      { id: "d", text: "하루에 한 번만 씻으면 충분하다." },
    ],
    correctChoiceId: "c",
  },
  {
    id: "q3",
    text: "와상 환자의 욕창 예방을 위한 방법으로 가장 적절한 것은?",
    choices: [
      { id: "a", text: "동일한 자세를 최대한 오래 유지시킨다." },
      { id: "b", text: "2시간마다 체위를 변경해준다." },
      { id: "c", text: "피부에 마찰이 발생하도록 자주 문지른다." },
      { id: "d", text: "침구를 눅눅한 상태로 유지한다." },
    ],
    correctChoiceId: "b",
  },
  {
    id: "q4",
    text: "치매 대상자와 의사소통할 때 바람직한 태도는?",
    choices: [
      { id: "a", text: "짧고 간단한 문장으로 천천히 말한다." },
      { id: "b", text: "여러 가지 정보를 한 번에 전달한다." },
      { id: "c", text: "대상자의 말을 자주 끊고 정정해준다." },
      { id: "d", text: "큰 소리로 빠르게 지시한다." },
    ],
    correctChoiceId: "a",
  },
  {
    id: "q5",
    text: "응급 상황 발생 시 간병사의 대응으로 가장 옳은 것은?",
    choices: [
      { id: "a", text: "직접 진단하고 약물을 투여한다." },
      { id: "b", text: "대상자의 상태를 확인하고 즉시 보호자/의료진에 알린다." },
      { id: "c", text: "상황이 나아질 때까지 지켜보기만 한다." },
      { id: "d", text: "기록 없이 구두로만 인수인계한다." },
    ],
    correctChoiceId: "b",
  },
];

function buildGenericQuestions(courseTitle: string): ExamQuestion[] {
  return Array.from({ length: 5 }, (_, index) => {
    const n = index + 1;
    return {
      id: `q${n}`,
      text: `[Mock 문제 ${n}] ${courseTitle} 교육과정의 핵심 내용과 가장 관련이 깊은 설명은?`,
      choices: [
        { id: "a", text: `${courseTitle} 관련 정답 예시 보기` },
        { id: "b", text: "관련 없는 오답 보기 1" },
        { id: "c", text: "관련 없는 오답 보기 2" },
        { id: "d", text: "관련 없는 오답 보기 3" },
      ],
      correctChoiceId: "a",
    };
  });
}

export function getExamQuestions(slug: string): ExamQuestion[] {
  if (CAREGIVER_QUESTIONS.length && slug === "caregiver") return CAREGIVER_QUESTIONS;

  const course = IN_PROGRESS_COURSES.find((item) => item.slug === slug);
  return buildGenericQuestions(course?.title ?? "이 과정");
}
