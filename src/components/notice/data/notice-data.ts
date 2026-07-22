export type NoticeSidebarItem = { id: string; label: string; href: string };

export const NOTICE_SIDEBAR_ITEMS: NoticeSidebarItem[] = [
  { id: "notice", label: "공지사항", href: "/notice" },
  { id: "news", label: "교육원소식", href: "/notice/news" },
  { id: "consult", label: "1:1 상담", href: "/support/qna" },
  { id: "faq", label: "자주하는 질문", href: "/notice/faq" },
];

/**
 * Mock notice list data.
 * `no: null` (with `pinned: true`) renders a "필독" badge instead of a row number,
 * mirroring the existing LMS board behaviour for pinned posts.
 *
 * TODO: replace with a `notice` Supabase table query (id, title, body, pinned, created_at)
 * once the CMS/DB layer is connected. The shape below is intentionally 1:1 with that table.
 */
export type NoticeListItem = {
  id: string;
  no: number | null;
  pinned?: boolean;
  title: string;
  date: string;
  body: string;
  /** 첨부파일(있을 때만). 관리자 공지사항에서 업로드한 파일입니다. */
  attachment?: { fileName: string; fileSizeLabel: string; fileUrl: string } | null;
};

export const NOTICE_LIST_ITEMS: NoticeListItem[] = [
  {
    id: "5",
    no: null,
    pinned: true,
    title: "2026 교육나눔지원 수강신청방법",
    date: "2026-03-11",
    body: `안녕하세요, 한평생직업훈련센터입니다.

2026년 교육나눔지원 사업 수강신청 방법을 안내드립니다.

1. 신청 대상: 교육나눔지원 대상자로 선정되신 분
2. 신청 기간: 공고일로부터 선착순 마감 시까지
3. 신청 방법: 홈페이지 [수강신청] 메뉴에서 원하시는 과정 선택 후 신청

문의사항이 있으시면 1:1 상담 또는 카카오톡 실시간상담을 이용해주시기 바랍니다.

감사합니다.`,
  },
  {
    id: "4",
    no: 4,
    title: "한국실습지원센터 실습매칭서비스",
    date: "2022-09-29",
    body: `안녕하세요, 한평생직업훈련센터입니다.

한국실습지원센터와 연계한 실습매칭서비스를 아래와 같이 안내드립니다.

- 대상: 실습이 필요한 자격과정 수강생
- 매칭 지역: 전국 협약기관
- 신청 방법: 학습강의실 내 [실습매칭 신청] 메뉴 이용

자세한 사항은 고객센터로 문의해주시기 바랍니다.

감사합니다.`,
  },
  {
    id: "3",
    no: 3,
    title: "창의학습지도사 신규런칭 이벤트!",
    date: "2022-01-17",
    body: `안녕하세요, 한평생직업훈련센터입니다.

신규 런칭한 창의학습지도사 과정 오픈 기념 이벤트를 진행합니다.

1. 이벤트 기간: 공지일로부터 2주간
2. 혜택: 수강료 할인 및 교재 무료 제공
3. 신청 방법: 수강신청 페이지에서 [창의학습지도사] 과정 선택

많은 관심과 참여 부탁드립니다.

감사합니다.`,
  },
  {
    id: "2",
    no: 2,
    title: "방과후아동지도사 신규런칭 EVENT!",
    date: "2022-01-17",
    body: `안녕하세요, 한평생직업훈련센터입니다.

방과후아동지도사 자격과정 신규 오픈을 기념하여 이벤트를 진행합니다.

1. 이벤트 기간: 공지일로부터 2주간
2. 혜택: 얼리버드 할인 적용
3. 신청 방법: 수강신청 페이지에서 [방과후아동지도사] 과정 선택

많은 참여 부탁드립니다.

감사합니다.`,
  },
  {
    id: "1",
    no: 1,
    title: "수강 및 출석관련공지",
    date: "2022-01-17",
    body: `안녕하세요!
한국직업훈련센터입니다.

교육원 수업은 모두 온라인으로 진행되는 수업으로 6주 동안 출석기간에 자유롭게 수강을 진행해주시면 됩니다.

1. 교육원 수업은 인터넷 익스플로러와 스윙브라우저에서만 수업이 진행됩니다.
- 크롬은 수강은 가능하시지만, 출석체크가 안 되는 점이 있기 때문에 상기 주시기 바라며 만약 익스플로러 관 도시는 본문은 스윙브라우저 진행시간을 통해 수업 가능하시도록 도와드리겠습니다.

1. 교육원 수업은 모바일에서도 수업이 가능합니다.
- 단, 핸드폰 일부기종에 따라 수강은 가능하나 출석체크가 안 되는 경우가 있으니

그럴경우 불편하시더라도 컴퓨터로 수업 진행해주시기 바랍니다.

1. 태블릿과 랩탑 수강은 가능하지만 출석이 체크가 되지 않으니
참고해주시기 바랍니다.

저희 교육원에서는 언제나 학구하이 최고 재빠르게 궁부하실 수 있도록 최선의 노력을 다해 도와드리겠습니다.
궁부하시다가 궁금한 점 생기시면 교육원으로 문의주시기 바랍니다.

감사합니다^^`,
  },
];

export function getNoticeItem(id: string): NoticeListItem | undefined {
  return NOTICE_LIST_ITEMS.find((item) => item.id === id);
}

/**
 * 교육원소식 (center news) board.
 * TODO: replace with a Supabase `notice` table query filtered by
 * `notice_category = 'news'`. Left empty for now — no mock posts yet.
 */
export const CENTER_NEWS_ITEMS: NoticeListItem[] = [];
