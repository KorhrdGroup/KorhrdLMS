'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toggleReviewHelpfulAction } from '@/features/korhrd/actions/course-review.actions';
import HelpfulButton from '@/features/korhrd/components/review/HelpfulButton';

/**
 * 후기 상세의 "도움됐어요".
 * 프로토타입 원본: korhrd-site/review-detail.html — 목록과 같은 토글 버튼입니다.
 * 눌린 값은 서버에 저장하고, 화면은 먼저 바꿔 반응이 늦어 보이지 않게 합니다.
 */
export default function ReviewHelpful({
  reviewId, count, active,
}: {
  reviewId: string;
  count: number;
  active: boolean;
}) {
  const [state, setState] = useState({ count, active });
  const [, startTransition] = useTransition();
  const router = useRouter();

  const toggle = () => {
    const next = { active: !state.active, count: state.count + (state.active ? -1 : 1) };
    setState(next);
    startTransition(async () => {
      const result = await toggleReviewHelpfulAction(reviewId);
      // 저장이 거절되면(비로그인) 원래대로 되돌리고 로그인으로 보냅니다. 성공하면 서버 값으로 맞춥니다.
      if (!result.success) {
        setState({ count, active });
        router.push(`/login?redirect=/reviews/${reviewId}`);
        return;
      }
      setState({ count: result.helpful, active: result.helpfulByMe });
    });
  };

  return (
    <p style={{ marginTop: 20, textAlign: 'right' }}>
      <HelpfulButton
        className="review-row__help"
        count={state.count}
        active={state.active}
        onToggle={toggle}
      />
    </p>
  );
}
