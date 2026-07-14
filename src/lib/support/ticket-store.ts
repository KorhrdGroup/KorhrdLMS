import { MOCK_USER_ID, MOCK_USER_NAME } from "@/lib/mock-auth";

/**
 * Mock client-side store for the 1:1 상담 (support ticket) board.
 *
 * Backed by localStorage so entries survive page navigation while there is
 * no real backend yet. The shape mirrors the planned `support_tickets` table
 * so swapping this module for real Supabase queries later is a drop-in
 * replacement:
 *
 *   support_tickets
 *   - id, user_id, user_name, title, content, status,
 *     admin_reply, replied_at, created_at, updated_at
 */

export type TicketStatus = "pending" | "answered";

export type SupportTicket = {
  id: string;
  seq: number;
  userId: string;
  userName: string;
  title: string;
  content: string;
  status: TicketStatus;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "hanpyeong_mock_support_tickets";

const SEED_TICKETS: SupportTicket[] = [
  {
    id: "seed-1",
    seq: 1,
    userId: MOCK_USER_ID,
    userName: MOCK_USER_NAME,
    title: "결제 확인 부탁드립니다",
    content:
      "안녕하세요, 어제 신청한 과정의 결제가 정상적으로 완료되었는지 확인 부탁드립니다.\n입금 후 수강신청 목록에서는 계속 미확정으로 표시되고 있어 문의드립니다.",
    status: "answered",
    adminReply:
      "안녕하세요, 한평생직업훈련센터입니다.\n확인 결과 정상적으로 입금 및 수강신청이 완료되었습니다. 학습강의실에서 바로 수강 가능하시니 참고 부탁드립니다.\n감사합니다.",
    repliedAt: "2026-06-20",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-20",
  },
];

function readAll(): SupportTicket[] {
  if (typeof window === "undefined") return SEED_TICKETS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TICKETS));
      return SEED_TICKETS;
    }
    return JSON.parse(raw) as SupportTicket[];
  } catch {
    return SEED_TICKETS;
  }
}

function writeAll(tickets: SupportTicket[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

/** Returns tickets for the current mock user, newest first. */
export function getMyTickets(): SupportTicket[] {
  return readAll()
    .filter((ticket) => ticket.userId === MOCK_USER_ID)
    .sort((a, b) => b.seq - a.seq);
}

export function getTicketById(id: string): SupportTicket | undefined {
  return readAll().find((ticket) => ticket.id === id);
}

export function createTicket(input: { title: string; content: string }): SupportTicket {
  const tickets = readAll();
  const today = new Date().toISOString().slice(0, 10);

  const ticket: SupportTicket = {
    id: `t${Date.now()}`,
    seq: tickets.length + 1,
    userId: MOCK_USER_ID,
    userName: MOCK_USER_NAME,
    title: input.title,
    content: input.content,
    status: "pending",
    createdAt: today,
    updatedAt: today,
  };

  writeAll([...tickets, ticket]);
  return ticket;
}

export function getTicketStatusLabel(status: TicketStatus): string {
  return status === "answered" ? "답변완료" : "대기중";
}
