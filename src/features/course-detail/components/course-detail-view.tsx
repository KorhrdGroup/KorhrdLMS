import Image, { getImageProps } from "next/image";

import type { CourseDetailData } from "@/components/course-detail/types";
import { CourseDetailInteractions } from "@/features/course-detail/components/course-detail-interactions";
import Header from "@/features/korhrd/components/layout/Header";
import {
  ASSET,
  ENROLL_EVENT_DEADLINE,
  HERO_IMAGE_FALLBACK,
  SHARED_FAQ,
  ministryLogo,
} from "@/features/course-detail/constants";
import EnrollNowButton from "@/features/korhrd/components/course/EnrollNowButton";
import { findJobByCourseName } from "@/features/korhrd/data/jobs";
import { REVIEW_CERT } from "@/features/korhrd/components/review/ReviewRow";

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

/** 금색 월계관 배지 위에 얹히는 "2026년 장학지원" 문구(원본 벡터). */
const SCHOLARSHIP_BADGE_PATH =
  "M1.3847 18.392L1.3627 18.326C2.5287 16.984 3.4747 15.796 6.0707 12.452L6.8187 11.484C8.0947 9.856 9.8987 7.436 9.8987 5.258C9.8987 3.784 9.0627 3.10201 7.6327 3.10201C6.0487 3.10201 5.2127 3.916 5.1467 5.434H1.6707C1.9347 1.958 4.1127 0 7.7427 0C11.0207 0 13.4627 1.584 13.4627 5.258C13.4627 7.194 12.7807 8.51401 11.6587 10.296C10.6027 11.968 9.3047 13.816 7.9187 15.51H13.8587V18.392H1.3847ZM15.2514 6.908C15.2514 2.354 17.4954 0.0440025 22.0714 0.0440025C26.6254 0.0440025 28.8474 2.354 28.8474 6.908V11.924C28.8474 16.456 26.5814 18.744 22.0714 18.744C17.5394 18.744 15.2514 16.456 15.2514 11.924V6.908ZM18.7934 11.594C18.7934 14.058 19.3214 15.796 22.0714 15.796C24.8214 15.796 25.3054 14.036 25.3054 11.594V7.28201C25.3054 4.81801 24.8434 3.058 22.0714 3.058C19.2994 3.058 18.7934 4.79601 18.7934 7.28201V11.594ZM30.0019 18.392L29.9799 18.326C31.1459 16.984 32.0919 15.796 34.6879 12.452L35.4359 11.484C36.7119 9.856 38.5159 7.436 38.5159 5.258C38.5159 3.784 37.6799 3.10201 36.2499 3.10201C34.6659 3.10201 33.8299 3.916 33.7639 5.434H30.2879C30.5519 1.958 32.7299 0 36.3599 0C39.6379 0 42.0802 1.584 42.0802 5.258C42.0802 7.194 41.3982 8.51401 40.2759 10.296C39.2199 11.968 37.9219 13.816 36.5359 15.51H42.4762V18.392H30.0019ZM56.8262 12.584C56.8262 16.588 54.3622 18.7 50.3582 18.7C46.4642 18.7 44.0442 16.698 44.0442 12.694C44.0442 11.374 44.3082 9.9 44.8362 8.734L48.5102 0.616005H52.3162L49.0602 7.128C49.5662 6.842 50.3582 6.688 51.1502 6.688C54.3622 6.688 56.8262 9.196 56.8262 12.584ZM50.1822 15.708C52.1842 15.708 53.2622 14.696 53.2622 12.694C53.2622 10.868 52.3602 9.702 50.4022 9.702C48.5102 9.702 47.5422 10.802 47.5422 12.584C47.5422 14.674 48.1802 15.708 50.1822 15.708ZM66.9072 1.1H71.7912V0.0220032H75.3552V12.914H71.7912V7.942H66.9072V5.038H71.7912V4.004H66.9072V1.1ZM69.4592 11.308H58.5472V0.0440025H62.1112V8.492H69.4592V11.308ZM63.4092 15.862H75.6412V18.898H59.8452V12.276H63.4092V15.862ZM19.228 32.248H16.742V35.79H13.178V26.022H16.742V29.212H19.228V32.248ZM11.484 28.948H9.394L11.506 35.526H8.272C7.634 33.7 6.93 31.874 6.424 30.004C6.27 31.17 4.488 34.426 3.938 35.592H0L2.992 28.948H0.242001V26.044H11.484V28.948ZM9.174 45.008C7.942 45.008 6.688 45.008 5.456 44.942C2.992 44.832 1.474 43.182 1.474 40.718C1.474 38.144 2.904 36.626 5.5 36.538C6.82 36.494 8.118 36.494 9.438 36.494C10.758 36.494 12.056 36.494 13.376 36.538C15.994 36.604 17.402 38.122 17.402 40.718C17.402 43.16 15.884 44.832 13.42 44.942C12.012 45.008 10.582 45.008 9.174 45.008ZM9.438 41.906C10.582 41.906 11.726 41.928 12.87 41.862C13.662 41.818 14.08 41.554 14.08 40.718C14.08 39.882 13.662 39.596 12.87 39.552C11.726 39.486 10.582 39.508 9.438 39.508C8.294 39.508 7.15 39.486 6.006 39.552C5.214 39.596 4.796 39.882 4.796 40.718C4.796 41.554 5.214 41.818 6.006 41.862C7.15 41.928 8.294 41.906 9.438 41.906ZM31.5126 29.872H19.8306V27.078H23.5266L23.8566 25.516H28.4546L28.1686 27.078H31.5126V29.872ZM38.9706 32.93H36.5506V37.22H32.9866V26.044H36.5506V29.894H38.9706V32.93ZM25.4846 37.176C24.7586 37.176 24.0106 37.154 23.2626 37.132C21.3266 37.044 20.0946 35.746 20.0946 33.81C20.0946 30.268 23.0646 30.51 25.6826 30.51C28.3006 30.51 31.2706 30.246 31.2706 33.81C31.2706 35.724 30.0386 37.044 28.1026 37.132C27.2446 37.176 26.3646 37.176 25.4846 37.176ZM25.6826 34.602C26.3206 34.602 27.7066 34.756 27.7066 33.81C27.7066 32.864 26.3206 32.996 25.6826 32.996C25.0446 32.996 23.6586 32.864 23.6586 33.81C23.6586 34.756 25.0446 34.602 25.6826 34.602ZM33.0526 41.202H20.9966V38.166H36.6166V45.008H33.0526V41.202ZM56.9752 44.414H53.4112V26.022H56.9752V44.414ZM48.4612 29.102L51.6292 44.194H48.3292C47.4052 39.772 46.4592 35.328 45.6892 30.884C45.3592 33.348 44.8752 35.812 44.3692 38.232L43.1592 44.194H39.4412L42.7632 29.102H39.7272V26.066H51.3652V29.102H48.4612ZM60.0422 29.806C60.0422 26.88 61.8682 25.89 64.5302 25.89H66.6422C68.6002 25.89 70.5582 26.528 71.0422 28.64H73.4402V26.022H77.0042V39.794H73.4402V31.83H70.7342C69.9862 33.326 68.2042 33.722 66.6642 33.722H64.5302C61.8462 33.722 60.0422 32.732 60.0422 29.806ZM63.5402 29.806C63.5402 30.818 64.3542 30.972 65.2122 30.972H65.9822C66.8402 30.972 67.6322 30.84 67.6322 29.806C67.6322 28.75 66.8402 28.64 65.9602 28.64H65.2122C64.3542 28.64 63.5402 28.794 63.5402 29.806ZM64.4422 39.926V41.862H77.2242V44.898H60.8782V38.87H63.8482V37.418H59.5142V34.47H72.2302V37.418H67.8522V39.926H64.4422Z";

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

/**
 * 모바일·데스크탑 시안이 아예 다른 이미지(구도가 다른 별도 export)를 <picture> 로 묶습니다.
 *
 * next/image 의 <Image> 는 한 장을 크기만 바꿔 내보내므로, 세로/가로처럼 구도가
 * 다른 시안에는 쓸 수 없습니다. getImageProps 로 각각의 srcSet 을 받아 화면 폭에
 * 따라 고르게 합니다(next/image 문서의 Art Direction 방식).
 *
 * 기준 폭 561px — 스타일시트의 모바일 분기(max-width:560px)와 같은 자리입니다.
 */
function artDirected(opts: {
  alt: string;
  desktop: { src: string; width: number; height: number; sizes: string };
  mobile: { src: string; width: number; height: number; sizes: string };
}) {
  const { props: desktopProps } = getImageProps({ alt: opts.alt, ...opts.desktop });
  const { props: mobileProps } = getImageProps({ alt: opts.alt, ...opts.mobile });
  return {
    desktop: desktopProps.srcSet,
    desktopSizes: opts.desktop.sizes,
    /* 기본(=모바일) 한 장. <source> 가 맞지 않는 폭에서 이 img 가 쓰입니다 */
    imgProps: mobileProps,
  };
}

const CERT_SAMPLE = artDirected({
  alt: "상장형 자격증과 카드형 자격증 견본 예시",
  desktop: { src: ASSET("sample-certs.png"), width: 3600, height: 2028, sizes: "(max-width: 960px) 100vw, 920px" },
  mobile: { src: ASSET("sample-certs-mobile.png"), width: 515, height: 1313, sizes: "100vw" },
});

/* 2026-08-18 시안 교체 — 자격증 줄이 빠진 투명 배너 한 장(모바일 별도 시안 없음).
   자격증 줄은 이미지에 굽지 않고 마크업(.dresume__cert)으로 얹습니다 —
   과정마다 실제 자격증명·주무부처가 들어갑니다 (Figma 1025:2136). */
const RESUME_BANNER = {
  src: ASSET("resume-banner-v2.png"),
  width: 2331,
  height: 1250,
  sizes: "(max-width: 1160px) 100vw, 1120px",
};

/** 배너 자격증 줄의 발급 연월 — 항상 이번 달을 보여줍니다 (시안의 '2026.01' 자리) */
const CERT_DATE = (() => {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;
})();

export function CourseDetailView({ course }: { course: CourseDetailData }) {
  const heroLogo = ministryLogo(course.ministry, "white");
  const certLogo = ministryLogo(course.ministry, "black");
  const curriculum = interleave(course.lecturePlan);
  // 취업 길찾기(직업 39개)에 이 과정과 연결된 직업이 있는지. 없으면 버튼을 숨깁니다.
  const linkedJob = findJobByCourseName(course.title);

  // 루트 레이아웃이 body에 Noto Sans KR(font-sans)을 깔지만, 이 페이지는 퍼블리싱
  // 산출물과 동일하게 보여야 하므로 style.css의 Pretendard 스택을 래퍼로 강제합니다.
  const MOCKUP_FONT_STACK =
    '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, ' +
    '"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "맑은 고딕", sans-serif';

  return (
    <div style={{ fontFamily: MOCKUP_FONT_STACK }}>
      <CourseDetailInteractions deadline={ENROLL_EVENT_DEADLINE} />

      <a className="skip-link" href="#main">본문 바로가기</a>

      {/* 다른 화면과 같은 헤더를 그대로 씁니다 — 이 번들에도 .header/.gnb/
          .header__util/.search-trigger/.search-overlay 클래스가 모두 있어
          그대로 입혀집니다. 직접 만들었던 헤더에는 햄버거·검색·로그인이
          빠져 있었고 스크롤 고정도 되지 않았습니다.
          이 번들에만 없던 규칙은 css/overrides.css 에서 맞춥니다. */}
      <Header />

      <main id="main">
        {/* ============================ HERO ============================ */}
        <section className="dhero">
          {/* 히어로 배경은 과정 썸네일(원본 3~5MB)을 그대로 씁니다. next/image 로
              화면 폭에 맞게 줄여 내보냅니다. 여기서는 fill 이 맞습니다 —
              .dhero__bg 가 이미 position:absolute·inset:0·object-fit:cover 이고
              .dhero 가 position:relative 라 fill 이 그 규칙과 그대로 맞물립니다. */}
          <Image
            /* image 는 선택 필드라 비어 있으면 서비스와 같은 기본 이미지를 씁니다 */
            className="dhero__bg" src={course.description.image ?? HERO_IMAGE_FALLBACK} alt="" aria-hidden
            fill sizes="100vw" priority
          />
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
              {/* 월계관은 .dprice__badge의 CSS 배경, 그 위 "2026년 장학지원" 문구는 원본 벡터 */}
              <span className="dprice__badge" aria-hidden="true">
                <svg className="dprice__badge-text" viewBox="0 0 77.2242 45.008" xmlns="http://www.w3.org/2000/svg">
                  <path d={SCHOLARSHIP_BADGE_PATH} fill="#D78900" />
                </svg>
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
                    // 원본 데이터에 같은 문구가 두 번 들어간 과정이 있어 순서를 키에 함께 씁니다.
                    <div className="dwho__card" key={`${index}-${target}`}>
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
                  {/* 취업 길찾기에 연결된 직업이 있는 과정에만 버튼을 답니다.
                      없는 과정에서 누르면 관계없는 화면으로 가게 됩니다. */}
                  {linkedJob ? (
                    <a
                      className="dintro__guide"
                      href={`/jobs/${encodeURIComponent(linkedJob.name)}`}
                    >
                      취업 길찾기 <span aria-hidden="true">→</span>
                    </a>
                  ) : null}
                </p>
                <ul>
                  {course.career.bullets.map((bullet, index) => (
                    <li key={`${index}-${bullet}`}>{bullet}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ============== 수강해야 하는 이유 · 정식 등록 과정 ============== */}
        <section className="dsec dsec--navy" id="why" aria-labelledby="why-title">
          <div className="container">
            <h2 className="dsec__title dsec__title--on-navy" id="why-title">
              한평생 직업훈련에서<br className="br-mo" /> 수강해야 하는 이유!
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
                      {/* 자격증 예시 이미지 — 합격후기 목록과 같은 파일 (2026-08-10, 디자인 요청) */}
                      <Image
                        className="ph drev__ava" src={REVIEW_CERT} alt=""
                        width={72} height={72}
                        style={{ objectFit: "contain", background: "#fff" }}
                      />
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
              {/* 모바일은 자격증 두 장을 세로로 쌓은 별도 시안을 씁니다 — 가로 시안을
                  좁은 화면에 그대로 넣으면 글씨가 읽히지 않을 만큼 작아집니다.
                  (데스크탑 3600×2028 · 모바일 515×1313) */}
              {/* display:block — contents 로 두면 박스가 없어져 제목 아래 간격
                  (.dsec__title + * 의 margin-top)이 먹지 않습니다 */}
              <picture style={{ display: "block" }}>
                <source media="(min-width: 561px)" srcSet={CERT_SAMPLE.desktop} sizes={CERT_SAMPLE.desktopSizes} />
                <img {...CERT_SAMPLE.imgProps} className="dsample__img" alt="상장형 자격증과 카드형 자격증 견본 예시" />
              </picture>
              <p className="dsample__note">{course.certificateNote}</p>
            </div>
          </section>

          <section className="dsec dsec--deep dresume" aria-labelledby="resume-title">
            <div className="container">
              <h2 className="dsec__title dsec__title--on-navy" id="resume-title">
                이력서에 기재하고 <em>취업 경쟁력 UP</em>
              </h2>
              <div className="dresume__stage">
                <Image
                  {...RESUME_BANNER}
                  className="dresume__shot"
                  alt="이력서에 자격증을 기재해 취업 경쟁력을 높인 예시"
                />
                {/* 이력서의 빈 '자격증' 칸에 얹는 실제 자격증 줄 (Figma 1025:2136) —
                    이미지에 굽지 않아 과정마다 제 이름·주무부처가 들어갑니다 */}
                <div className="dresume__cert">
                  <span className="dresume__cert-date">{CERT_DATE}</span>
                  <span className="dresume__cert-name">
                    {course.title} <small>{course.ministry}</small>
                  </span>
                  <span className="dresume__cert-issuer">발행기관: 한평생 직업훈련</span>
                </div>
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
              {/* .dprof__img 가 150x150 고정이라 그 크기를 그대로 넘깁니다 */}
              <Image
                className="dprof__img" src={course.professor.photo} alt={course.professor.name}
                width={150} height={150}
              />
              <div>
                <p className="dprof__name">{course.professor.name}</p>
                <ul className="dprof__list">
                  {[...course.professor.intro, ...course.professor.education].map((line, index) => (
                    <li key={`${index}-${line}`}>{line}</li>
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
                {/* <wbr>: 칸이 좁아 줄을 나눠야 할 때만 '자격 / 관리기관'으로 끊깁니다
                    (표 헤더에 word-break:keep-all 이 걸려 있어 다른 자리에서는 끊기지 않습니다) */}
                <tr><th scope="row">자격<wbr />관리기관</th><td>{course.organization.name}</td></tr>
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
          {/* 신청할 과정이 이 화면 하나로 정해져 있으므로 목록으로 보내지 않고
              여기서 바로 신청하고 완료 모달을 띄웁니다 (course.slug = 과정코드) */}
          <EnrollNowButton className="btn btn--cta" code={course.slug}>{course.ctaLabel}</EnrollNowButton>
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
    </div>
  );
}
