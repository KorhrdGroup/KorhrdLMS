'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useHydrated } from '@/features/korhrd/lib/useHydrated';
import { createSupportQnaAction } from '@/features/support-qna/actions/support-qna.actions';
import type { SupportQnaItem } from '@/features/support-qna/services/support-qna.service';

/**
 * 1:1 문의 폼 + 나의 문의 내역.
 * 프로토타입 원본: korhrd-site/support.html #form
 *
 * 원본의 이름·연락처 칸과 개인정보 동의는 뺐습니다 (2026-08-13, 디자인 요청) —
 * 로그인해야 쓰는 폼이라 이름은 계정에서 오고, 새로 수집하는 개인정보가 없어
 * 별도 동의도 필요 없습니다. 저장은 기존 support-qna 서비스(board_posts)를
 * 쓰며, 제목은 "[문의유형] 문의 제목"으로 저장합니다 — 아래 문의 내역과
 * 어드민 목록이 같은 문자열을 그대로 보여줍니다.
 */
const TYPES = ['수강 관련', '시험·수료 관련', '자격증 발급 관련', '결제·환불 관련', '기타'];

export function QnaBoard({
  items,
  isLoggedIn,
}: {
  items: SupportQnaItem[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [qtype, setQtype] = useState(TYPES[0]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [open, setOpen] = useState<string | null>(null);
  const hydrated = useHydrated();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setDone(false);

    startTransition(async () => {
      const result = await createSupportQnaAction({
        title: `[${qtype}] ${subject.trim()}`,
        content: body.trim(),
      });

      if (result.success) {
        setSubject('');
        setBody('');
        setDone(true);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    /* 고객센터 안쪽 칸에 들어갑니다 — 예전에는 화면 폭을 다 쓰는 띠(.section)에
       제 컨테이너까지 두르고 있었는데, 이제 레이아웃이 그 자리를 잡아 줍니다
       (2026-08-12, 사이드바 구조로 바뀌면서). */
    <section id="form" aria-labelledby="form-title">
      <div>
        <div className="section-head">
          <h2 id="form-title">1:1 문의하기</h2>
          <p>답변은 아래 문의 내역에서 확인하실 수 있습니다.</p>
        </div>

        <div>
          {isLoggedIn ? (
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form" style={{ maxWidth: 'none' }}>
                {/* 유형·제목을 한 줄에 — 좁은 화면에서는 세로로 쌓입니다 (overrides.css .qna-grid) */}
                <div className="qna-grid">
                  <div className="field">
                    <label htmlFor="qtype">
                      문의 유형 <span className="req" aria-hidden="true">*</span>
                      <span className="sr-only">(필수)</span>
                    </label>
                    <select
                      id="qtype" required value={qtype}
                      onChange={(event) => setQtype(event.target.value)}
                    >
                      {TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="qsubject">
                      문의 제목 <span className="req" aria-hidden="true">*</span>
                      <span className="sr-only">(필수)</span>
                    </label>
                    <input
                      id="qsubject" type="text" required maxLength={60}
                      placeholder="문의 제목을 입력해 주세요"
                      value={subject} onChange={(event) => setSubject(event.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="qbody">
                    문의 내용 <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(필수)</span>
                  </label>
                  <textarea
                    id="qbody" rows={5} required placeholder="문의하실 내용을 입력해 주세요"
                    value={body} onChange={(event) => setBody(event.target.value)}
                  />
                </div>

                {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}
                {done ? (
                  <p className="my-card__status my-card__status--pass">
                    문의가 접수되었습니다. 아래 내역에서 답변을 확인하실 수 있습니다.
                  </p>
                ) : null}

                <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={isPending}>
                  {isPending ? '접수 중…' : '문의 접수하기'}
                </button>
              </div>
            </form>
          ) : (
            <div className="guide-box">
              <strong>로그인 후 이용하실 수 있습니다</strong>
              <ul>
                <li>답변을 안내드리기 위해 로그인이 필요합니다.</li>
                <li>급하신 경우 전화(02-2135-9249)나 카카오톡 상담을 이용해 주세요.</li>
              </ul>
            </div>
          )}

          {isLoggedIn ? (
            <>
              <h2 className="rv-title">나의 문의 내역 <span>{items.length}</span></h2>

              {items.length === 0 ? (
                <div className="guide-box">
                  <strong>문의 내역이 없습니다</strong>
                  <ul><li>위 양식으로 문의를 남기시면 이곳에서 답변을 확인하실 수 있습니다.</li></ul>
                </div>
              ) : (
                /* qna-list — 자주 묻는 질문(.faq--wide 공유)과 달리 펼침 영역을
                   흰 바탕 + 구분선으로 그립니다 (overrides.css) */
                <div className="faq faq--wide qna-list">
                  {items.map((item) => (
                    <div className="faq__item" key={item.id}>
                      <button
                        className="faq__q" type="button"
                        aria-expanded={open === item.id}
                        aria-controls={`qna-${item.id}`}
                        onClick={() => setOpen(open === item.id ? null : item.id)}
                      >
                        {/* 접수는 파랑(학습중과 같은 톤) — 배지 너비는 overrides.css 가
                            답변완료와 같게 맞춥니다. 제목은 남는 폭을 다 갖고 왼쪽 정렬. */}
                        <span className={`badge badge--${item.status === 'answered' ? 'pass' : 'learning'}`}>
                          {item.status === 'answered' ? '답변완료' : '접수'}
                        </span>
                        <span className="qna-item-title">{item.title}</span>
                        <span className="arrow" aria-hidden="true">⌄</span>
                      </button>
                      {/* 여백은 .faq__a-pad 가 담당합니다(.faq__a 는 여닫기용 grid).
                          hidden 은 첫 그림에서만 — display:none 이라 두면 여닫이가 뚝 끊깁니다 */}
                      <div
                        className="faq__a"
                        id={`qna-${item.id}`}
                        hidden={hydrated ? undefined : open !== item.id}
                      >
                        <div className="faq__a-inner">
                          <div className="faq__a-pad">
                            <p style={{ whiteSpace: 'pre-line' }}>{item.content}</p>
                            <p className="my-card__date">문의일 {item.createdAt.slice(0, 10)}</p>
                            {item.adminReply ? (
                              <>
                                <hr />
                                <p style={{ whiteSpace: 'pre-line' }}><b>답변</b><br />{item.adminReply}</p>
                                {item.repliedAt ? (
                                  <p className="my-card__date">답변일 {item.repliedAt.slice(0, 10)}</p>
                                ) : null}
                              </>
                            ) : (
                              <p className="my-card__status my-card__status--info">답변을 준비 중입니다.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
