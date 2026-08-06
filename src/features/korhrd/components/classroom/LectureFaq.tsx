'use client';

import { useState } from 'react';

/**
 * 강의실 하단 "자주 묻는 질문".
 * 프로토타입 원본: korhrd-site/lecture.html 의 .lec-qna — 문항·문구를 그대로 옮겼습니다.
 */
const FAQS = [
  {
    q: '시험은 언제 볼 수 있나요?',
    a: (
      <>
        전체 출석률이 60% 이상 충족되면 목차 상단에 <b>시험보기</b> 버튼이 생성됩니다.
        [나의 강의실 → 해당 과목 시험보기 → 응시하기]에서 시험에 응시하실 수 있습니다.
      </>
    ),
  },
  {
    q: '출석 체크는 어떻게 이루어지나요?',
    a: (
      <>
        강의 시작 후 5~10분 이내에 출석 체크가 이루어집니다. 출석 체크 전까지 강의를 멈추거나
        넘기면 출석이 인정되지 않을 수 있으니 유의해 주세요.
      </>
    ),
  },
  {
    q: '다음 강의는 자동으로 재생되나요?',
    a: (
      <>
        부정행위 방지를 위해 다음 강의는 자동 재생되지 않습니다. 우측 강의목차에서 다음 강의를
        직접 선택해 주세요.
      </>
    ),
  },
  {
    q: '교안 파일과 기출문제는 어디에 있나요?',
    a: (
      <>
        교안 파일과 예상 기출문제는 강의 화면 우측 상단 <b>학습자료</b>에서 확인하실 수 있습니다.
        기출문제는 내려받지 않고 강의실 안에서 바로 풀어볼 수 있습니다.
      </>
    ),
  },
  {
    q: '동영상 재생이 안 될 때는 어떻게 하나요?',
    a: (
      <>
        우측 <b>교육원 필수 프로그램</b>에서 크롬 브라우저를 설치하신 뒤 접속하시면 원활하게
        수강하실 수 있습니다.
      </>
    ),
  },
  {
    q: '자격증은 언제 받아볼 수 있나요?',
    a: (
      <>
        시험 합격 후 자격증 발급을 신청하시면, 신청일로부터 7일 이내 협회 심사를 거쳐 상장형·카드형
        자격증이 함께 배송됩니다.
      </>
    ),
  },
];

export default function LectureFaq() {
  const [open, setOpen] = useState(0);

  return (
    <div className="lec-qna">
      <h3>자주 묻는 질문</h3>
      <div className="faq faq--wide">
        {FAQS.map((item, index) => (
          <div className="faq__item" key={item.q}>
            <button
              className="faq__q"
              type="button"
              aria-expanded={open === index}
              aria-controls={`lec-faq-${index}`}
              onClick={() => setOpen(open === index ? -1 : index)}
            >
              {item.q}
              <span className="arrow" aria-hidden="true">⌄</span>
            </button>
            <div className="faq__a" id={`lec-faq-${index}`} hidden={open !== index}>
              {item.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
