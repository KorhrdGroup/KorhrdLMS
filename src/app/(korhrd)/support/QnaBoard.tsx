'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { createSupportQnaAction } from '@/features/support-qna/actions/support-qna.actions';
import type { SupportQnaItem } from '@/features/support-qna/services/support-qna.service';

/**
 * 고객센터 1:1 문의 — 마크업은 korhrd 디자인(support.html), 저장은 기존 support-qna 서비스.
 * 목록은 본인 글만 보이며, 관리자가 답변하면 답변이 함께 펼쳐집니다.
 */
export function QnaBoard({
  items,
  isLoggedIn,
}: {
  items: SupportQnaItem[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setDone(false);
    startTransition(async () => {
      const result = await createSupportQnaAction({ title, content });
      if (result.success) {
        setTitle('');
        setContent('');
        setDone(true);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">고객센터</li>
        </ol>
      </nav>

      <div className="page-head">
        <h1>고객센터</h1>
        <p>궁금한 점을 남겨주시면 확인 후 답변드립니다.</p>
      </div>

      <div className="content">
        <dl className="exam-info">
          <div><dt>전화 상담</dt><dd>02-2135-9249</dd></div>
          <div><dt>운영시간</dt><dd>평일 10:00~18:00 (점심 12:00~14:00)</dd></div>
          <div><dt>휴무</dt><dd>금·토·일·공휴일</dd></div>
        </dl>

        <h2 className="rv-title">1:1 문의하기</h2>

        {isLoggedIn ? (
          <div className="form-card">
            <form className="form" style={{ maxWidth: 'none' }} onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="qna-title">
                  제목 <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(필수)</span>
                </label>
                <input
                  id="qna-title" type="text" required value={title} maxLength={100}
                  placeholder="문의 제목을 입력하세요"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="qna-content">
                  내용 <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(필수)</span>
                </label>
                <textarea
                  id="qna-content" rows={7} required value={content}
                  placeholder="문의 내용을 자세히 적어주시면 빠르게 도와드릴 수 있습니다."
                  onChange={(event) => setContent(event.target.value)}
                />
              </div>

              {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}
              {done ? <p className="my-card__status my-card__status--pass">문의가 접수되었습니다.</p> : null}

              <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={isPending}>
                {isPending ? '접수 중…' : '문의 남기기'}
              </button>
            </form>
          </div>
        ) : (
          <div className="guide-box">
            <strong>로그인 후 이용하실 수 있습니다</strong>
            <ul>
              <li>답변을 안내드리기 위해 로그인이 필요합니다.</li>
              <li><Link href="/login?redirect=/support">로그인하러 가기</Link></li>
            </ul>
          </div>
        )}

        <h2 className="rv-title">나의 문의 내역 <span>{items.length}</span></h2>

        {items.length === 0 ? (
          <div className="guide-box">
            <strong>문의 내역이 없습니다</strong>
            <ul><li>위 양식으로 문의를 남기시면 이곳에서 답변을 확인하실 수 있습니다.</li></ul>
          </div>
        ) : (
          <div className="faq faq--wide">
            {items.map((item) => (
              <div className="faq__item" key={item.id}>
                <button
                  className="faq__q" type="button"
                  aria-expanded={open === item.id}
                  aria-controls={`qna-${item.id}`}
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                >
                  <span className={`badge badge--${item.status === 'answered' ? 'pass' : 'info'}`}>
                    {item.status === 'answered' ? '답변완료' : '접수'}
                  </span>
                  {' '}{item.title}
                  <span className="arrow" aria-hidden="true">⌄</span>
                </button>
                <div className="faq__a" id={`qna-${item.id}`} hidden={open !== item.id}>
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
                    <p className="my-card__status my-card__status--info">
                      답변을 준비 중입니다.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
