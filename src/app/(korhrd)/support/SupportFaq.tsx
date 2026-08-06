'use client';

import { useState } from 'react';

/**
 * 자주 묻는 질문 — 분류 토글 + 아코디언.
 * 프로토타입 원본: korhrd-site/support.html (main.js의 data-toggle-group · data-faq-q)
 *
 * 원본 정적 HTML은 분류 버튼만 있고 실제 필터는 없었습니다. 버튼이 눌리기만 하고
 * 아무 일도 일어나지 않으면 고장으로 보이므로, 문항마다 분류를 달아 실제로 거릅니다.
 */
type Category = '수강' | '시험·수료' | '자격증 발급';

const CATEGORIES: Array<'전체' | Category> = ['전체', '수강', '시험·수료', '자격증 발급'];

const FAQS: Array<{ id: string; cat: Category; q: string; a: string }> = [
  {
    id: 's1',
    cat: '수강',
    q: '수강료가 정말 0원인가요? 추가 비용은요?',
    a: '수강료와 시험 응시료는 0원입니다. 합격 후 자격증 실물 발급을 원하실 때만 발급비 100,000원이 발생하며, 협회 발급비용과 택배비가 포함됩니다.',
  },
  {
    id: 's2',
    cat: '시험·수료',
    q: '수료 조건과 시험 기준이 어떻게 되나요?',
    a: '온라인 강의 출석률 60% 이상을 채우면 시험에 응시할 수 있고, 시험은 100점 만점에 60점 이상이면 합격입니다.',
  },
  {
    id: 's3',
    cat: '자격증 발급',
    q: '자격증 발급까지 얼마나 걸리나요?',
    a: '교육 기간은 신청일로부터 6주이며, 합격 후 7일 이내에 발급을 신청하셔야 합니다. 배송은 신청일 다음 날부터 최대 7일(휴일 제외) 소요됩니다.',
  },
  {
    id: 's4',
    cat: '수강',
    q: '여러 과정을 동시에 수강할 수 있나요?',
    a: '가능합니다. 수강신청 페이지에서 원하는 과목을 여러 개 선택해 한 번에 신청하실 수 있습니다.',
  },
  {
    id: 's5',
    cat: '수강',
    q: '수강 전 PC 설정은 어떻게 하나요?',
    a: '최신 버전의 크롬·엣지 브라우저를 권장합니다. 동영상 재생 오류 시 브라우저 캐시를 삭제하거나 원격지원 서비스를 이용해 주세요.',
  },
];

export default function SupportFaq() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>('전체');
  const [open, setOpen] = useState<string>('s1');

  const list = cat === '전체' ? FAQS : FAQS.filter((f) => f.cat === cat);

  return (
    <>
      <div className="toolbar">
        <div className="sort-group" role="group" aria-label="분류">
          {CATEGORIES.map((c) => (
            <button
              key={c} type="button" aria-pressed={cat === c}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="faq faq--wide">
        {list.map((f) => (
          <div className="faq__item" key={f.id}>
            <button
              className="faq__q" type="button"
              aria-expanded={open === f.id} aria-controls={f.id}
              onClick={() => setOpen(open === f.id ? '' : f.id)}
            >
              {f.q}
              <span className="arrow" aria-hidden="true">⌄</span>
            </button>
            <div className="faq__a" id={f.id} hidden={open !== f.id}>{f.a}</div>
          </div>
        ))}
      </div>
    </>
  );
}
