import type { CourseDetailData } from "@/components/course-detail/types";
import { CourseDetailInteractions } from "@/features/course-detail/components/course-detail-interactions";
import {
  ASSET,
  ENROLL_EVENT_DEADLINE,
  SHARED_FAQ,
  ministryLogo,
} from "@/features/course-detail/constants";

/**
 * 퍼블리싱 산출물(`course-detail-page/index.html`)의 마크업을 그대로 옮긴 화면입니다.
 * 클래스명·구조를 바꾸지 않아야 `public/course-detail/css/style.css` 가 그대로 적용됩니다.
 *
 * 과정마다 달라지는 6개 블록만 데이터로 채우고, 나머지는 템플릿 고정입니다.
 * (분리 기준: docs/course-detail-template-spec.md)
 */

const REVIEWS = [
  { title: "1개월만에 빠른 취득, 성공했습니다!", who: "김*연", body: "일반 직장인으로 바쁘게 지내면서 자격증 공부까지 병행하는 게 쉽지 않았습니다. 시작하는 것 자체가 부담스럽게 느껴졌어요.", tag: "방과후학교지도사", more: "" },
  { title: "노력의 결실", who: "김*현", body: "퇴직 후 무엇을 해야 할지 막막했는데, 6주 동안 차근차근 따라가니 어느새 합격 통보를 받았습니다.", tag: "생활지원사 1급", more: "외 3개" },
  { title: "모바일로 틈틈이 들었어요", who: "박*준", body: "출퇴근 시간에 휴대폰으로 강의를 들었습니다. PC가 없어도 수강과 시험까지 모두 가능해서 좋았습니다.", tag: "노인심리상담사", more: "외 1개" },
  { title: "60대에도 충분히 가능합니다", who: "이*정", body: "나이가 걸림돌이 될까 걱정했지만 기우였습니다. 지금은 노인복지센터에서 근무하고 있습니다.", tag: "노인돌봄생활지원사", more: "외 2개" },
  { title: "경력단절 8년, 다시 일합니다", who: "최*숙", body: "육아로 오래 쉬어 자신이 없었는데, 부담 없이 시작해 수료했고 지금은 방과후 교실에서 아이들을 만납니다.", tag: "방과후아동지도사", more: "" },
  { title: "이력서에 한 줄 늘었습니다", who: "정*배", body: "이력서에 자격증을 기재하니 면접 기회가 늘었습니다. 실제 취업으로 이어져 정말 만족합니다.", tag: "노인심리상담사", more: "" },
];

const STEPS = [
  { icon: "step-apply.png", title: "무료 수강신청", desc: "원하는 과정을 선택해 수강신청을 해주세요." },
  { icon: "step-learn.png", title: "온라인 강의 수강", desc: "열린 강의를 기간 내에 자유롭게 온라인으로 들어주시면 됩니다." },
  { icon: "step-exam.png", title: "시험 응시", desc: "출석률 60% 이상이라면 언제든지 응시 가능합니다." },
  { icon: "step-cert.png", title: "자격증 취득", desc: "시험 60점 이상 기준을 만족하면 자격증 발급 및 취득 가능!" },
];

const BENEFITS = [
  { icon: "why-fast.png", line1: "수강신청 직후", line2: "빠르게 수강 가능" },
  { icon: "why-device.png", line1: "모바일 · PC", line2: "언제 어디서든 수강가능" },
  { icon: "why-free.png", line1: "장학지원 이벤트로", line2: "수강료 · 응시료 무료!", note: "자격증 발급비 별도*" },
  { icon: "why-cert.png", line1: "이력서 기재 가능한", line2: "정식 등록 자격증" },
];

const TABS = [
  { href: "#who", label: "추천 대상" },
  { href: "#why", label: "수강 이유" },
  { href: "#reviews", label: "합격후기" },
  { href: "#curriculum", label: "커리큘럼" },
  { href: "#faq", label: "FAQ" },
];

/** `.dcurri` 는 2열 그리드를 좌→우로 채웁니다. 왼쪽이 앞 절반이 되도록 교차 배치합니다. */
function interleave<T>(items: T[]): T[] {
  const half = Math.ceil(items.length / 2);
  const out: T[] = [];
  for (let i = 0; i < half; i += 1) {
    out.push(items[i]);
    if (items[i + half]) out.push(items[i + half]);
  }
  return out;
}

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export function CourseDetailView({ course }: { course: CourseDetailData }) {
  const heroLogo = ministryLogo(course.ministry, "white");
  const certLogo = ministryLogo(course.ministry, "black");
  const curriculum = interleave(course.lecturePlan);

  return (
    <>
      <CourseDetailInteractions deadline={ENROLL_EVENT_DEADLINE} />

      <a className="skip-link" href="#main">본문 바로가기</a>

      <header className="header">
        <div className="header__in">
          <a className="logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ASSET("logo.svg")} alt="한평생 직업훈련" width={147} height={18} />
          </a>
          <nav className="gnb" id="gnb" aria-label="주 메뉴">
            <a href="/jobs">취업 길찾기</a>
            <a href="/enrollment" aria-current="page">수강신청</a>
            <a href="/classroom">나의 강의실</a>
            <a href="/certificate">자격증 발급신청</a>
            <a href="/reviews">합격후기</a>
            <a href="/notice">공지사항</a>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* ============================ HERO ============================ */}
        <section className="dhero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dhero__bg" src={course.description.image} alt="" aria-hidden="true" />
          <div className="container dhero__in">
            <p className="dhero__gov">
              {heroLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroLogo} alt={course.ministry} />
              ) : (
                <span>{course.ministry}</span>
              )}
            </p>
            <h1 className="dhero__title">{course.title}</h1>
            <hr className="dhero__rule" />
            <p className="dhero__desc">{course.description.body}</p>
          </div>
        </section>

        {/* ==================== 스펙 · 등록번호 · 수강료 ==================== */}
        <section className="dsec dsec--navy dsec--info" id="info" aria-label="과정 정보">
          <div className="container">
            <div className="dspec-grid">
              <div className="card dspec">
                <div><span className="tag">담당 교수</span><b>{course.info.professor}</b></div>
                <div><span className="tag">교육 기간</span><b>{course.sticky.period}</b></div>
                <div><span className="tag">강의 형태</span><b>{course.info.format}</b></div>
                <div><span className="tag">강의 시간</span><b>{course.info.duration}</b></div>
                <div><span className="tag">수업 방식</span><b>{course.info.method}</b></div>
                <div><span className="tag">자격증 발급비</span><b>{won(course.info.certFee)}</b></div>
                <div><span className="tag">주무부처</span><b>{course.ministry}</b></div>
                <div><span className="tag">합격 기준</span><b>{course.sticky.passCriteria}</b></div>
              </div>

              <div className="card dreg">
                <p className="dreg__no">자격등록번호 {course.license.number}</p>
                <p className="dreg__desc">{course.license.description}</p>
                <a
                  className="btn btn--primary btn--block"
                  href={course.license.inquiryUrl}
                  target="_blank"
                  rel="noopener"
                >
                  {course.license.inquiryLabel} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <div className="card dprice">
              <div>
                <p className="dprice__label">강의 교안 &amp; 기출 문제 무료</p>
                <p className="dprice__main">
                  정식 등록 자격증 수강료+응시료
                  <strong><em>{course.price.toLocaleString("ko-KR")}</em>원</strong>
                  <del>{won(course.originalPrice)}</del>
                </p>
              </div>
              <span className="dprice__badge" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ASSET("gold-badge.png")} alt="" />
              </span>
            </div>
          </div>
        </section>

        {/* ========================= 섹션 바로가기 ========================= */}
        <nav className="dtabs" aria-label="상세 정보 목차">
          <div className="dtabs__in">
            {TABS.map((tab, index) => (
              <a key={tab.href} href={tab.href} data-detail-tab aria-current={index === 0 ? "true" : "false"}>
                {tab.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ================= 추천 대상 · 과정 상세 소개 ================== */}
        <section className="dsec dsec--tint" id="who" aria-labelledby="who-title">
          <div className="container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="dstars" src={ASSET("stars-5.png")} alt="" aria-hidden="true" />
            <h2 className="dsec__title" id="who-title">이런 분들에게 추천합니다</h2>

            {course.targets.length > 0 && (
              <>
                <div className="dwho" data-who-track>
                  {course.targets.map((target, index) => (
                    <div className="dwho__card" key={target}>
                      <span className="dwho__no">{String(index + 1).padStart(2, "0")}</span>
                      <p>{target}</p>
                    </div>
                  ))}
                </div>
                <div className="dwho__dots" role="group" aria-label="추천 대상 페이지" data-who-dots />
              </>
            )}

            <h2 className="dsec__title mt-6">과정 상세 소개</h2>

            <div className="card dintro">
              <p className="dintro__head">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="dintro__ico" src={ASSET("icon-goal.png")} alt="" aria-hidden="true" />
                강좌 목표
              </p>
              <p>{course.goal}</p>
            </div>

            {course.career.bullets.length > 0 && (
              <div className="dintro dintro--blue mt-3">
                <p className="dintro__head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="dintro__ico" src={ASSET("icon-career.png")} alt="" aria-hidden="true" />
                  진로 및 전망
                  <a className="dintro__guide" href="/jobs">취업 길찾기 <span aria-hidden="true">→</span></a>
                </p>
                <ul>
                  {course.career.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ============== 수강해야 하는 이유 · 정식 등록 과정 ============== */}
        <section className="dsec dsec--navy" id="why" aria-labelledby="why-title">
          <div className="container">
            <h2 className="dsec__title dsec__title--on-navy" id="why-title">
              한평생 직업훈련에서 수강해야 하는 이유!
            </h2>

            <div className="dcompare">
              <div className="dcompare__other">
                <p className="dcompare__label">타 교육원 수강 시</p>
                <ul>
                  <li>복잡한 수강신청 과정</li>
                  <li>불편한 수강환경</li>
                  <li>비싼 수강료와 시험 응시료</li>
                  <li>공인되지 않은 자격증</li>
                </ul>
              </div>

              <div className="dcompare__ours">
                <p className="dcompare__brand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ASSET("logo.svg")} alt="한평생 직업훈련" width={180} height={20} />
                </p>
                <ul className="dbenefit">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit.icon} className={benefit.note ? "dbenefit__free" : undefined}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="dbenefit__ico" src={ASSET(benefit.icon)} alt="" aria-hidden="true" />
                      {benefit.line1}<br />{benefit.line2}
                      {benefit.note && <small className="dbenefit__note">{benefit.note}</small>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <h2 className="dsec__title dsec__title--on-navy mt-7">정식 등록 자격증 과정</h2>

            <div className="dcert">
              <div className="dcert__card">
                <p className="dcert__tag">국무총리 산하 관리기관</p>
                <span className="dcert__logo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ASSET("krivet-logo.png")} alt="한국직업능력연구원" />
                </span>
                <p>
                  본 자격증은 한국직업능력연구원(KRIVET)에 정식 등록된 자격증으로, 한국직업능력연구원은
                  직업교육훈련의 활성화 및 국민의 직업능력 향상에 기여하기 위해 설립된 국무총리 산하 국책연구기관입니다.
                </p>
              </div>
              <div className="dcert__card">
                <p className="dcert__tag">주무부처</p>
                <span className="dcert__logo dcert__logo--gov">
                  {certLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={certLogo} alt={course.ministry} />
                  ) : (
                    <b>{course.ministry}</b>
                  )}
                </span>
                <p>본 자격증은 해당 분야를 담당하는 정부 주무부처 기준으로 등록 관리되는 자격 과정입니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================== 합격후기 ========================== */}
        <section className="dsec dsec--reviews" id="reviews" aria-labelledby="review-title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="drev-sparkle" src={ASSET("sparkle.png")} alt="" aria-hidden="true" />
          <div className="container">
            <h2 className="dsec__title dsec__title--on-navy" id="review-title">수강생들의 생생한 합격후기</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="drev-trophy" src={ASSET("trophy.png")} alt="" aria-hidden="true" />
          </div>

          {/* 카드를 두 벌 이어붙여 끊김 없이 반복시킵니다. */}
          <div className="drev-marquee" aria-label="수강생 합격후기">
            <ul className="drev-track">
              {[0, 1].flatMap((pass) =>
                REVIEWS.map((review) => (
                  <li className="drev__card" key={`${pass}-${review.title}`} aria-hidden={pass === 1}>
                    <div className="drev__top">
                      <span className="ph drev__ava" aria-hidden="true" />
                      <div>
                        <p className="drev__tit">{review.title}</p>
                        <p className="drev__who">{review.who} 수강생</p>
                      </div>
                    </div>
                    <p className="drev__body">{review.body}</p>
                    <p className="drev__tags">
                      <span>{review.tag}</span>
                      {review.more && <em>{review.more}</em>}
                    </p>
                  </li>
                )),
              )}
            </ul>
          </div>

          <div className="container">
            <p className="drev__more"><a className="btn btn--white" href="/reviews">합격후기 전체 보기 →</a></p>
          </div>
        </section>

        {/* ============ 취득절차 · 발급예시 · 이력서 ============ */}
        <div className="deep-group">
          <section className="dsec dsec--deep" aria-labelledby="step-title">
            <div className="container">
              <h2 className="dsec__title dsec__title--on-navy" id="step-title">자격증 취득 절차</h2>
              <ol className="dstep">
                {STEPS.map((step) => (
                  <li key={step.title}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="dstep__ico" src={ASSET(step.icon)} alt="" aria-hidden="true" />
                    <b>{step.title}</b><span>{step.desc}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="dsec dsec--deep" aria-labelledby="sample-title">
            <div className="container">
              <h2 className="dsec__title dsec__title--on-navy" id="sample-title">자격증 발급 예시</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dsample__img" src={ASSET("sample-certs.png")} alt="상장형 자격증과 카드형 자격증 견본 예시" />
              <p className="dsample__note">{course.certificateNote}</p>
            </div>
          </section>

          <section className="dsec dsec--deep dresume" aria-labelledby="resume-title">
            <div className="container">
              <h2 className="dsec__title dsec__title--on-navy" id="resume-title">
                이력서에 기재하고 <em>취업 경쟁력 UP</em>
              </h2>
              <div className="dresume__stage">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="dresume__shot" src={ASSET("resume-banner.png")} alt="이력서에 자격증을 기재해 취업 경쟁력을 높인 예시" />
                <span className="dresume__base" aria-hidden="true" />
              </div>
            </div>
          </section>
        </div>

        {/* ==================== 커리큘럼 · 교수 소개 ==================== */}
        <section className="dsec dsec--soft" id="curriculum" aria-labelledby="curriculum-title">
          <div className="container">
            <h2 className="dsec__title" id="curriculum-title">커리큘럼</h2>
            <p className="dsec__sub">이론부터 실무까지 단계별 완성</p>

            {curriculum.length > 0 ? (
              <ol className="dcurri">
                {curriculum.map((item) => (
                  <li key={item.week}>
                    <span className="no">{item.week}강</span>
                    {item.title}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="dsec__sub">커리큘럼 준비 중입니다.</p>
            )}

            <h2 className="dsec__title mt-7">교수 소개</h2>
            <div className="card dprof">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="dprof__img" src={course.professor.photo} alt={course.professor.name} />
              <div>
                <p className="dprof__name">{course.professor.name}</p>
                <ul className="dprof__list">
                  {[...course.professor.intro, ...course.professor.education].map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FAQ · 자격관리기관 ==================== */}
        <section className="dsec" id="faq" aria-labelledby="faq-title">
          <div className="container">
            <h2 className="dsec__title" id="faq-title">FAQ</h2>
            <div className="faq faq--wide">
              {SHARED_FAQ.map((item, index) => (
                <div className="faq__item" key={item.question}>
                  <button
                    className="faq__q"
                    type="button"
                    data-faq-q
                    aria-expanded={index === 0 ? "true" : "false"}
                    aria-controls={`d-faq-${index + 1}`}
                  >
                    {item.question}
                    <span className="arrow" aria-hidden="true">⌄</span>
                  </button>
                  <div className="faq__a" id={`d-faq-${index + 1}`} hidden={index !== 0}>
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="dsec__title mt-7">자격관리기관 정보</h2>
            <table className="dtable">
              <caption className="sr-only">자격관리기관 정보</caption>
              <tbody>
                <tr><th scope="row">자격관리기관</th><td>{course.organization.name}</td></tr>
                <tr><th scope="row">대표</th><td>{course.organization.ceo}</td></tr>
                <tr><th scope="row">연락처</th><td>{course.organization.contact}</td></tr>
                <tr><th scope="row">주소</th><td>{course.organization.address}</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ======================= 하단 고정 CTA ======================= */}
      <div className="detail-cta">
        <div className="detail-cta__top">
          <p className="detail-cta__label">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="detail-cta__alarm" src={ASSET("alarm-clock.png")} alt="" aria-hidden="true" />
            무료수강 이벤트
          </p>
          <a className="btn btn--cta" href={`/enrollment?course=${course.slug}`}>{course.ctaLabel}</a>
        </div>
        <div className="detail-cta__bottom">
          <p className="timer" data-countdown={ENROLL_EVENT_DEADLINE}>
            <span className="timer__unit" data-cd-d /><u className="timer__sep">일</u>
            <span className="timer__unit" data-cd-h /><u className="timer__sep">:</u>
            <span className="timer__unit" data-cd-m /><u className="timer__sep">:</u>
            <span className="timer__unit" data-cd-s />
          </p>
          <span className="detail-cta__left">남았습니다!</span>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div>
              <p className="footer__links">
                <a href="/about">교육원 소개</a>
                <a href="/process">취득 절차</a>
                <a href="/support">고객센터</a>
                <a href="/terms">이용약관</a>
                <a href="/privacy">개인정보처리방침</a>
              </p>
              <address>
                (주)한평생그룹 &nbsp; 대표 : 양병웅 &nbsp; 사업자등록번호 : 227-88-03196<br />
                주소 : 서울시 도봉구 창동 마들로13길 61 씨드큐브 905호 &nbsp; 개인정보책임자 : 양병웅<br />
                통신판매업신고 : 제24-도봉-0983호 &nbsp; 원격평생교육시설신고 (제 원격20-6호)<br />
                자격취득 발급계좌 : 신한은행 140-015-773620 (주)한평생그룹
              </address>
            </div>
            <div className="footer__side">
              <a className="footer__box" href="https://www.pqi.or.kr" target="_blank" rel="noopener">
                <span><strong>한국직업능력개발원</strong>민간자격관리운영센터에서 등록조회</span>
                <span aria-hidden="true">›</span>
              </a>
              <div className="footer__box">
                <span>패밀리 사이트 바로가기</span>
                <span aria-hidden="true">⌄</span>
              </div>
            </div>
          </div>
          <p className="footer__legal">
            본 교육원의 자격증은 한국직업능력연구원에 등록된 민간자격으로, 국가공인 자격증이 아닙니다.<br />
            Copyright © 2026 한평생 직업훈련. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
