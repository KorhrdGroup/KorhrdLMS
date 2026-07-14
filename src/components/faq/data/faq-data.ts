export type FaqCategory = { id: string; label: string };

export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "member", label: "회원정보" },
  { id: "enrollment", label: "수강신청" },
  { id: "payment", label: "결제방법" },
  { id: "support", label: "학습지원" },
  { id: "certificate", label: "자격증" },
  { id: "etc", label: "기타" },
  { id: "trouble", label: "학습장애해결" },
];

export function getFaqCategoryLabel(categoryId: string): string {
  return FAQ_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId;
}

/**
 * Mock FAQ data.
 * TODO: replace with a `faq` Supabase table query (id, category, question,
 * answer, created_at) once the CMS/DB layer is connected. The shape below is
 * intentionally 1:1 with that table.
 */
export type FaqListItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export const FAQ_LIST_ITEMS: FaqListItem[] = [
  {
    id: "1",
    category: "member",
    question: "아이디를 잊어버렸어요. 어떻게 찾을 수 있나요?",
    answer:
      "로그인 화면의 [ID/PW 찾기] 메뉴에서 이름과 휴대폰번호를 입력하시면 가입하신 아이디를 확인하실 수 있습니다.",
  },
  {
    id: "2",
    category: "member",
    question: "비밀번호를 변경하고 싶어요.",
    answer:
      "로그인 화면의 [ID/PW 찾기] 메뉴에서 비밀번호 재설정을 진행하실 수 있습니다. 본인 확인 후 새 비밀번호로 변경 가능합니다.",
  },
  {
    id: "3",
    category: "enrollment",
    question: "수강신청은 어떻게 하나요?",
    answer:
      "상단 [수강신청] 메뉴에서 원하시는 과정을 선택한 뒤 [과목 선택하기] 버튼을 눌러 신청 목록에 담고, 하단 Floating Bar의 [선택과목 수강신청] 버튼을 눌러 신청을 완료하시면 됩니다.",
  },
  {
    id: "4",
    category: "enrollment",
    question: "신청한 과목을 취소할 수 있나요?",
    answer:
      "결제 전이라면 수강신청 목록에서 언제든 선택을 해제하실 수 있습니다. 결제가 완료된 이후 취소를 원하시는 경우 1:1 상담 또는 고객센터로 문의해주시기 바랍니다.",
  },
  {
    id: "5",
    category: "payment",
    question: "가상계좌는 언제까지 유효한가요?",
    answer:
      "가상계좌는 발급일로부터 3일간 유효합니다. 기간 내 미입금 시 자동으로 신청이 취소되니 기한 내 입금을 완료해주시기 바랍니다.",
  },
  {
    id: "6",
    category: "payment",
    question: "발급신청 후 결제를 타인 명의로 할 경우는 어떻게 해야 하나요?",
    answer:
      "발급 신청자와 입금자명 확인 후 1:1 상담 안내에 남겨주시거나 교육원으로 연락 부탁드립니다.\n(가상계좌는 확정 이후에는 자신만의 고유 계좌이기 때문에 입금자명이 달라도 상관없습니다.)",
  },
  {
    id: "7",
    category: "support",
    question: "동영상 강의를 듣기 위한 컴퓨터 사양은 어떻게 되나요?",
    answer:
      "인터넷 익스플로러, 크롬, 엣지 등 최신 웹 브라우저와 안정적인 인터넷 환경이면 수강 가능합니다. 모바일에서도 수강 가능하나 기종에 따라 출석체크가 원활하지 않을 수 있습니다.",
  },
  {
    id: "8",
    category: "support",
    question: "사운드가 안 들려요. 어떻게 해야 하나요?",
    answer:
      "PC/스피커 음소거 여부를 먼저 확인해주시고, 브라우저 새로고침 후에도 동일한 문제가 발생하면 다른 브라우저로 접속해보시기 바랍니다.",
  },
  {
    id: "9",
    category: "certificate",
    question: "신청한 자격증 또는 수료증은 언제쯤 받아 볼 수 있나요?",
    answer:
      "자격증은 신청일로부터 통상 2~3주 이내 순차 발송됩니다. 자세한 발송 일정은 [자격증발급신청] 메뉴에서 확인하실 수 있습니다.",
  },
  {
    id: "10",
    category: "certificate",
    question: "취득한 자격증은 갱신이 필요한가요?",
    answer: "본 협회에서 발급하는 민간자격증은 별도의 갱신 절차 없이 계속 사용 가능합니다.",
  },
  {
    id: "11",
    category: "certificate",
    question: "시험응시는 어디서 해야 하나요?",
    answer: "학습강의실 내 [온라인 시험] 메뉴에서 응시 가능하며, 수강 진도율 충족 후 응시하실 수 있습니다.",
  },
  {
    id: "12",
    category: "etc",
    question: "교육원 운영시간은 어떻게 되나요?",
    answer: "평일 오전 10시부터 오후 6시까지 운영하며, 점심시간은 12시부터 14시까지입니다. 금·토·일·공휴일은 휴무입니다.",
  },
  {
    id: "13",
    category: "etc",
    question: "문의사항은 어디로 연락하면 되나요?",
    answer: "카카오톡 실시간상담 또는 1:1 상담 게시판을 이용해주시면 순차적으로 답변드리겠습니다.",
  },
  {
    id: "14",
    category: "trouble",
    question: "학습자료실에서 다운로드 받은 자료들이 열리지 않아요.",
    answer:
      "자료 다운로드 후 압축 해제 프로그램(알집, 반디집 등)으로 압축을 풀어 실행해주시기 바랍니다. 그래도 열리지 않는 경우 자료 재다운로드를 시도해주세요.",
  },
  {
    id: "15",
    category: "trouble",
    question: "동영상 강의를 듣다가 중간에 자꾸 끊길 경우 어떻게 하나요?",
    answer:
      "인터넷 연결 상태를 확인해주시고, 브라우저 캐시 삭제 후 재접속을 시도해주세요. 문제가 계속되면 원격지원 서비스를 이용하시면 빠르게 도와드리겠습니다.",
  },
];
