'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    id: 'p-faq-4',
    q: '수강료가 정말 0원인가요? 추가 비용은요?',
    a: '수강료와 시험 응시료는 0원입니다. 합격 후 자격증 실물 발급을 원하실 때만 발급비 100,000원이 발생하며, 이 금액에는 협회 자격증 발급비용과 택배비가 포함됩니다.',
  },
  {
    id: 'p-faq-5',
    q: '수료 조건과 시험 기준이 어떻게 되나요?',
    a: '온라인 강의 출석률 60% 이상을 채우면 시험에 응시할 수 있고, 출석 40% + 시험 60%를 합산한 총점이 60점 이상이면 합격입니다.',
  },
  {
    id: 'p-faq-6',
    q: '자격증 발급까지 얼마나 걸리나요?',
    a: '교육 기간은 신청일로부터 6주이며, 합격 후 7일 이내에 발급을 신청하셔야 합니다. 배송은 신청일 다음 날부터 최대 7일(휴일 제외) 소요됩니다.',
  },
  {
    id: 'p-faq-1',
    q: '시험에 불합격하면 어떻게 되나요?',
    a: '교육 기간(6주) 내에서 재응시하실 수 있습니다. 다만 합격 후 7일이 지나면 해당 과목이 초기화되어 발급 신청이 불가하므로, 합격하신 뒤에는 기한 내에 발급을 신청해 주세요.',
  },
  {
    id: 'p-faq-2',
    q: '발급받은 자격증은 어디에 활용할 수 있나요?',
    a: '자격증 취득 후 이력서 및 활용 기관에 정식으로 기재하실 수 있습니다. 다만 본 자격증은 한국직업능력연구원에 등록된 민간자격으로 국가공인 자격증이 아니므로, 채용 기관의 요구 조건을 미리 확인하시기 바랍니다.',
  },
  {
    id: 'p-faq-3',
    q: '여러 과정을 동시에 수강할 수 있나요?',
    a: '가능합니다. 수강신청 페이지에서 원하는 과목을 여러 개 선택해 한 번에 신청하실 수 있습니다. 수강료는 과정 수와 관계없이 0원이며, 자격증 발급을 원하시는 과정에 대해서만 과정당 100,000원의 발급비가 발생합니다.',
  },
];

export default function ProcessFaq() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="faq faq--wide">
      {FAQ_ITEMS.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div className="faq__item" key={item.id}>
            <button
              className="faq__q"
              type="button"
              aria-expanded={isOpen}
              aria-controls={item.id}
              onClick={() => toggle(item.id)}
            >
              {item.q}
              <span className="arrow" aria-hidden="true">⌄</span>
            </button>
            <div className="faq__a" id={item.id} hidden={!isOpen}>
              <div className="faq__a-inner">
                <div className="faq__a-pad">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
