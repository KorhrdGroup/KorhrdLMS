"use client";

import { useEffect, useState } from "react";

import { useHydrated } from "@/features/korhrd/lib/useHydrated";

/**
 * 자주 묻는 질문 — 분류 토글 + 아코디언.
 * 프로토타입 원본: korhrd-site/support.html (main.js의 data-toggle-group · data-faq-q)
 *
 * 원본 정적 HTML은 분류 버튼만 있고 실제 필터는 없었습니다. 버튼이 눌리기만 하고
 * 아무 일도 일어나지 않으면 고장으로 보이므로, 문항마다 분류를 달아 실제로 거릅니다.
 */
type Category = "수강" | "시험·수료" | "자격증 발급";

const CATEGORIES: Array<"전체" | Category> = [
  "전체",
  "수강",
  "시험·수료",
  "자격증 발급",
];

const FAQS: Array<{ id: string; cat: Category; q: string; a: string }> = [
  {
    id: "s1",
    cat: "수강",
    q: "수강료가 정말 0원인가요? 추가 비용은요?",
    a: "수강료와 시험 응시료는 0원입니다. 합격 후 자격증 실물 발급을 원하실 때만 발급비 100,000원이 발생하며, 협회 발급비용과 택배비가 포함됩니다.",
  },
  {
    id: "s2",
    cat: "시험·수료",
    q: "수료 조건과 시험 기준이 어떻게 되나요?",
    a: "온라인 강의 출석률 60% 이상을 채우면 시험에 응시할 수 있습니다. 합격은 출석 점수(최대 40점)와 시험 점수(최대 60점)를 합쳐 총점 60점 이상입니다 — 강의를 다 들으면 출석 40점이 그대로 채워집니다.",
  },
  {
    id: "s3",
    cat: "자격증 발급",
    q: "자격증 발급까지 얼마나 걸리나요?",
    a: "교육 기간은 신청일로부터 4주이며, 합격 후 14일 이내에 발급을 신청하셔야 합니다. 배송은 신청일 다음 날부터 영업일 기준 최대 14일(휴일 제외) 소요됩니다.",
  },
  {
    id: "s4",
    cat: "수강",
    q: "여러 과정을 동시에 수강할 수 있나요?",
    a: "가능합니다. 수강신청 페이지에서 원하는 과목을 여러 개 선택해 한 번에 신청하실 수 있습니다.",
  },
  {
    id: "s5",
    cat: "수강",
    q: "수강 전 PC 설정은 어떻게 하나요?",
    a: "최신 버전의 크롬·엣지 브라우저를 권장합니다. 동영상 재생 오류 시 브라우저 캐시를 삭제하거나 원격지원 서비스를 이용해 주세요.",
  },
  /* 취득 절차 화면을 이 화면으로 합치면서 옮겨온 두 문항입니다
     (2026-08-12, 디자인 요청). 나머지 넷은 여기 있던 것과 같은 질문이라 합쳤습니다. */
  {
    id: "s6",
    cat: "시험·수료",
    q: "시험에 불합격하면 어떻게 되나요?",
    a: "교육 기간(6주) 내에서 재응시하실 수 있습니다. 다만 합격 후 7일이 지나면 해당 과목이 초기화되어 발급 신청이 불가하므로, 합격하신 뒤에는 기한 내에 발급을 신청해 주세요.",
  },
  {
    id: "s7",
    cat: "자격증 발급",
    q: "발급받은 자격증은 어디에 활용할 수 있나요?",
    a: "자격증 취득 후 이력서 및 활용 기관에 정식으로 기재하실 수 있습니다. 다만 본 자격증은 한국직업능력연구원에 등록된 민간자격으로 국가공인 자격증이 아니므로, 채용 기관의 요구 조건을 미리 확인하시기 바랍니다.",
  },
];

export default function SupportFaq() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("전체");
  const [open, setOpen] = useState<string>("s1");
  const hydrated = useHydrated();

  /* 다른 화면에서 특정 문항으로 걸어 들어올 수 있게 합니다 — 메인 '자주 묻는 질문'
     이 /support#s3 처럼 문항을 지목합니다. 주소의 # 가 가리키는 문항을 펼치고
     그 자리로 옮깁니다 (2026-08-12, 취득 절차 화면을 합치면서). */
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !FAQS.some((f) => f.id === id)) return;
    setOpen(id);
    /* 분류가 걸려 있으면 그 문항이 목록에 없을 수 있어 전체로 되돌립니다 */
    setCat("전체");
    /* 두 번 기다립니다 — 첫 프레임에 문항이 펼쳐지고, 그 뒤라야 자리가 정해집니다.
       브라우저가 먼저 # 로 뛰어 놓은 자리(접힌 상태 기준)를 덮어씁니다. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById(`faq-${id}`)
          ?.scrollIntoView({ block: "center" });
      });
    });
  }, []);

  const list = cat === "전체" ? FAQS : FAQS.filter((f) => f.cat === cat);

  return (
    <>
      <div className="toolbar">
        <div className="sort-group" role="group" aria-label="분류">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="faq faq--wide">
        {list.map((f) => (
          <div className="faq__item" key={f.id} id={`faq-${f.id}`}>
            <button
              className="faq__q"
              type="button"
              aria-expanded={open === f.id}
              aria-controls={f.id}
              onClick={() => setOpen(open === f.id ? "" : f.id)}
            >
              {f.q}
              <span className="arrow" aria-hidden="true">
                ⌄
              </span>
            </button>
            {/* 여백은 .faq__a-pad 가 담당합니다(.faq__a 는 여닫기용 grid).
                hidden 은 첫 그림에서만 — display:none 이라 두면 여닫이가 뚝 끊깁니다 */}
            <div
              className="faq__a"
              id={f.id}
              hidden={hydrated ? undefined : open !== f.id}
            >
              <div className="faq__a-inner">
                <div className="faq__a-pad">{f.a}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
