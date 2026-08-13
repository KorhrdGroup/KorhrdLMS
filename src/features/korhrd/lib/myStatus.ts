import type { Enrollment } from './types';

/**
 * 나의 강의실 카드의 배지·안내 문구를 수강 상태에서 계산합니다.
 *
 * 프로토타입 mylecture.html 상단 주석의 18가지 경우를 그대로 옮긴 것입니다.
 * 문구를 바꿔야 하면 데이터가 아니라 이 파일만 고치세요.
 *
 * 톤   ready 파랑 · pass 초록 · fail 빨강 · done 남색 · info 검정
 * 규칙 출석 60% 이상이면 시험 응시 가능 / 합격 후 7일 이내 발급 신청 / 연장 최대 5회
 */
export const PASS_LINE = 60; // 출석·점수 합격선(%)
export const MAX_EXTEND = 5;

export type StatusTone = 'ready' | 'pass' | 'fail' | 'done' | 'info';
export type BadgeTone = 'pass' | 'fail' | 'learning' | 'expired' | 'done';

export interface CardStatus {
  badge: { tone: BadgeTone; label: string };
  tone: StatusTone;
  /** 안내 문구. 빈 문자열이면 문구 줄을 그리지 않습니다 */
  message: string;
  canExam: boolean;
  canIssue: boolean;
  canExtend: boolean;
}

const md = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${Number(m)}월 ${Number(d)}일`;
};

export function cardStatus(e: Enrollment, extendCount = 0): CardStatus {
  const extendable = extendCount < MAX_EXTEND;

  /* ---------- 수강종료 ---------- */
  if (e.status === 'issued') {
    return {
      badge: { tone: 'done', label: '자격증 발급 완료' },
      tone: 'done',
      message: '자격증 배송이 완료되었습니다.',
      canExam: false, canIssue: false, canExtend: false, // 수령 완료 과정은 연장 대상이 아닙니다
    };
  }

  if (e.status === 'expired') {
    const badge = { tone: 'expired' as const, label: '기간 만료' };
    if (!extendable) {
      return {
        badge, tone: 'info',
        message: `연장 가능한 횟수(${MAX_EXTEND}회)를 모두 사용하셨습니다. 추가 연장이 필요하면 고객센터로 연락해주세요.`,
        canExam: false, canIssue: false, canExtend: false,
      };
    }
    /* 만료 시점의 상태에 따라 연장 후 무엇이 가능한지 안내가 달라집니다 */
    if (e.score !== undefined && e.score >= PASS_LINE) {
      return {
        badge, tone: 'info',
        message: '수강기간이 만료되었습니다. 기간 연장 시 자격증 발급 신청이 가능합니다.',
        canExam: false, canIssue: false, canExtend: true,
      };
    }
    if (e.score !== undefined) {
      return {
        badge, tone: 'info',
        message: '기간을 연장하면 시험 재응시가 가능합니다.',
        canExam: false, canIssue: false, canExtend: true,
      };
    }
    return {
      badge, tone: 'info',
      message:
        e.progress >= PASS_LINE
          ? '수강기간이 만료되었습니다. 기간 연장 시 시험 응시가 가능합니다.'
          : '수강기간이 만료되었습니다. 기간 연장 시 이어서 수강이 가능합니다.',
      canExam: false, canIssue: false, canExtend: true,
    };
  }

  /* ---------- 수강중 ---------- */
  if (e.status === 'pass') {
    return {
      badge: { tone: 'pass', label: `합격 · ${e.score}점` },
      tone: 'pass',
      message: e.issueDeadline
        ? `합격을 축하드립니다! ${md(e.issueDeadline)}까지 자격증 발급을 신청하세요.`
        : '합격을 축하드립니다! 자격증 발급을 신청하세요.',
      canExam: false, canIssue: true, canExtend: false,
    };
  }

  if (e.status === 'fail') {
    return {
      badge: { tone: 'fail', label: `불합격 · ${e.score}점` },
      tone: 'fail',
      message: '시험 응시하기를 눌러 성적을 확인하고 합격에 도전해보세요!',
      canExam: true, canIssue: false, canExtend: false,
    };
  }

  /* learning · ready — 진도율로 갈립니다 */
  const badge = { tone: 'learning' as const, label: '학습중' };
  if (e.progress >= 100) {
    return {
      badge, tone: 'ready',
      message: '출석 조건을 100% 달성했습니다. 시험 응시가 가능합니다.',
      canExam: true, canIssue: false, canExtend: false,
    };
  }
  if (e.progress >= PASS_LINE) {
    return {
      badge, tone: 'ready',
      message: `출석 조건 ${PASS_LINE}% 이상을 달성했습니다. 시험 응시가 가능합니다.`,
      canExam: true, canIssue: false, canExtend: false,
    };
  }
  if (e.progress === 0) {
    return {
      badge, tone: 'info',
      message: '학습을 시작해보세요!',
      canExam: false, canIssue: false, canExtend: false,
    };
  }
  /* 남은 진도를 강의 수로 환산해 안내합니다 (1강 = 5%) */
  const left = PASS_LINE - e.progress;
  return {
    badge, tone: 'info',
    message: `${left}%(약 ${Math.ceil(left / 5)}강) 더 수강하면 시험 응시가 가능합니다.`,
    canExam: false, canIssue: false, canExtend: false,
  };
}
