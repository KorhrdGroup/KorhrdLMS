import Link from 'next/link';
import { getMyLectureData } from '@/features/korhrd/lib/my-lecture-data';
import { listCourseReviews } from '@/features/korhrd/services/course-review.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';
import { JOB_GROUPS } from '@/features/korhrd/data/jobs';
import { LIVE_FEED } from '@/features/korhrd/data/liveFeed';
import TrustStrip from '@/features/korhrd/components/home/TrustStrip';
import BannerCarousel from '@/features/korhrd/components/home/BannerCarousel';
import LoginBox from '@/features/korhrd/components/home/LoginBox';
import GoalPicker from '@/features/korhrd/components/home/GoalPicker';
import LiveTicker from '@/features/korhrd/components/home/LiveTicker';
import GovMarquee from '@/features/korhrd/components/home/GovMarquee';
import Carousel from '@/features/korhrd/components/ui/Carousel';
import JobGroupCard from '@/features/korhrd/components/job/JobGroupCard';
import styles from './page.module.css';

/**
 * 메인.
 * 프로토타입 원본: korhrd-site/index.html
 *
 * 하단 고정 탭바는 이 화면에서만 뜹니다 — app/layout.tsx 의 TabBar 를 참고하세요.
 */
const STEPS = [
  { ico: '/step/1-apply.svg', title: '무료수강신청', dur: '약 3분', desc: '원하는 과정들을 선택해 0원으로 신청합니다.' },
  { ico: '/step/2-learn.svg', title: '온라인 강의 수강', dur: '6주 이내', desc: 'PC·모바일로 약 20시간 강의를 수강합니다.' },
  { ico: '/step/3-exam.svg', title: '온라인 시험 응시', dur: '60분', desc: '강의 수강 후 시험에 응시할 수 있습니다.' },
  { ico: '/step/4-cert.svg', title: '자격증 발급 신청', dur: '배송 최대 7일', desc: '상장형·카드형 자격증으로 발급 가능합니다.' },
];

const NOTICES = [
  '2026 교육나눔지원 수강신청방법',
  '한국실습지원센터 실습매칭서비스',
  '창의학습지도사 신규런칭 이벤트!',
  '방과후아동지도사 신규런칭 EVENT!',
  '수강 및 출석관련공지',
];

const FAQS = [
  { q: '수강료가 정말 0원인가요? 추가 비용은요?', href: '/process#p-faq-4' },
  { q: '수료 조건과 시험 기준이 어떻게 되나요?', href: '/process#p-faq-5' },
  { q: '자격증 발급까지 얼마나 걸리나요?', href: '/process#p-faq-6' },
  { q: '자격증은 이력서에 기재 가능한가요?', href: '/process#p-faq-2' },
];

const NATCERTS = [
  { img: '/natcert/social-worker.jpg', name: '사회복지사' },
  { img: '/natcert/childcare.jpg', name: '보육교사' },
  { img: '/natcert/lifelong.jpg', name: '평생교육사' },
  { img: '/natcert/korean.jpg', name: '한국어 교원' },
];

export default async function HomePage() {
  const homeReviews = (await listCourseReviews()).slice(0, 3);

  /* 로그인 상태면 히어로 오른쪽 박스에 실제 수강중인 강의를 최대 3개 보여줍니다 */
  const member = await getMockableStudentMember();
  let learning: { course: string; endDate: string; courseCode: string }[] = [];
  if (member) {
    const data = await getMyLectureData(member.id);
    learning = data.active.slice(0, 3).map((e) => ({
      course: e.course,
      endDate: e.endDate,
      courseCode: data.courseCodeByName[e.course] ?? '',
    }));
  }

  return (
    <>
      <h1 className="sr-only">한평생 직업훈련 — 정식 등록 민간자격 온라인 교육기관</h1>

      <TrustStrip />

      {/* 흰 배경 띠 — 배너·로그인 박스가 회색 바탕에 잠기지 않도록 화면 폭 전체를 흰색으로 깝니다 */}
      <div className="hero-band">
        <section className="hero container" aria-label="주요 안내">
          <div className="hero__grid">
            <BannerCarousel />
            <LoginBox learning={learning} />
          </div>
        </section>
      </div>

      {/* ==================== 취업 길찾기 진입 (직업군) ==================== */}
      <section className="section" aria-labelledby="jobguide-title">
        <div className="container">
          <div className="section-head section-head--row content">
            <div>
              <h2 id="jobguide-title">어떤 일을 하고 싶으세요?</h2>
              <p>취업으로 바로 이어지는 분야를 찾아 맞춤 정보를 안내해 드립니다.</p>
            </div>
            <Link className="section-head__more" href="/jobs">더보기 →</Link>
          </div>
          <div className="content">
            <Carousel className="job-groups job-groups--carousel">
              {JOB_GROUPS.map((g) => (
                <JobGroupCard key={g.key} group={g} href={`/jobs?g=${g.key}`} />
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      {/* ======================= 목적 · 연령 선택 ======================= */}
      <section className="section section--white" aria-labelledby="goal-title">
        <div className="container">
          <div className="section-head content">
            <h2 id="goal-title">어떤 목적으로 자격증을 찾으세요?</h2>
            <p>목적과 연령을 고르면 맞는 과정을 바로 추천해 드립니다.</p>
          </div>
          <GoalPicker />
        </div>
      </section>

      {/* ===================== 실시간 활동 · 상담 ====================== */}
      <section className="section section--alt" aria-label="실시간 수강 현황 및 상담 안내">
        <div className="container">
          <div className="content live-grid">
            <div className="live-box">
              <p className="live-box__title">수강생들의 한 걸음 <br />더 성장한 순간</p>
              <LiveTicker rows={LIVE_FEED} />
            </div>

            <div className="tel-box">
              <p className="tel-box__q">궁금한 점이 있으신가요?</p>
              <p className="tel-box__t">전화 상담 문의</p>
              <p className="tel-box__n"><a href="tel:0221359249">02-2135-9249</a></p>
              <p className="tel-box__h">
                운영시간 평일 10:00~18:00<br />
                점심시간 12:00~14:00 · 금/토/일/공휴일 휴무
              </p>
            </div>

            {/* 실시간 카카오톡 상담 배너 (Figma card_cs) */}
            <a className="kakao-box" href="https://pf.kakao.com/_NHfxfb" target="_blank" rel="noopener">
              <span className="kakao-box__txt">
                <span className="kakao-box__q">통화가 어려우신가요?</span>
                <span className="kakao-box__t">실시간 카카오톡 상담</span>
              </span>
              <span className="kakao-box__ico" aria-hidden="true"><img src="/kakao-bubble.png" alt="" /></span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================== 신뢰 밴드 =========================== */}
      <section className="section section--navy" aria-labelledby="trust-title">
        <div className="container">
          <div className="section-head content">
            <h2 id="trust-title">숫자와 등록번호로 확인하는 한평생 직업훈련</h2>
            <p>무료 과정일수록, 검증 가능한 근거로 말씀드립니다.</p>
          </div>

          <div className="content">
            {/* TODO: 아래 수치는 운영 데이터로 교체하세요 */}
            <ul className="stat-grid">
              <li className="stat"><b>128,400<small>+</small></b><span>누적 수강생</span></li>
              <li className="stat"><b>96,200<small>건</small></b><span>자격증 발급</span></li>
              <li className="stat"><b>4.8<small>/5.0</small></b><span>평균 수강 만족도</span></li>
              <li className="stat"><b>70<small>개+</small></b><span>정식 등록 자격 과정</span></li>
            </ul>
            <GovMarquee />
          </div>
        </div>
      </section>

      {/* ========================== 취득 절차 =========================== */}
      <section className="section section--white" aria-labelledby="process-title">
        <div className="container">
          <div className="section-head section-head--row content">
            <div>
              <h2 id="process-title">자격증 취득, 4단계면 됩니다</h2>
              <p>신청부터 발급까지 전 과정 온라인 · 교육기간 6주</p>
            </div>
            <Link className="section-head__more" href="/process">더보기 →</Link>
          </div>

          {/* 좁은 화면에서는 세로로 쌓지 않고 가로 스와이프합니다 (styles/responsive.css) */}
          <ol className="content step-grid">
            {STEPS.map((s) => (
              <li className="step" key={s.title}>
                <img className="step__ico" src={s.ico} alt="" aria-hidden="true" />
                <div className="step__head">
                  <h3>{s.title}</h3>
                  <span className="step__dur">{s.dur}</span>
                </div>
                <p>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =========================== 합격 후기 ========================== */}
      <section className="section section--soft" aria-labelledby="review-title">
        <div className="container">
          <div className="section-head section-head--row content">
            <div>
              <h2 id="review-title">합격한 수강생들의 이야기</h2>
              <p>자격증 실물 사진과 함께 등록된 후기만 보여드립니다.</p>
            </div>
            <Link className="section-head__more" href="/reviews">더보기 →</Link>
          </div>

          {/* 과정 상세의 후기 카드(.drev__card)와 같은 구조 — 사진(1:1) + 제목·이름 / 본문 / 과정 태그 */}
          <div className="content review-grid">
            {homeReviews.map((r) => (
              <article className="review" key={r.id}>
                <div className="review__top">
                  <span className="ph review__ava" aria-hidden="true">자격증<small>사진</small></span>
                  <div>
                    <h3>{r.title}</h3>
                    <p className="review__who">{r.author} 수강생</p>
                  </div>
                </div>
                <p className={`review__text ${styles.clamp}`}>{r.body}</p>
                <p className="review__tags">
                  <span>{r.course}</span>
                  {r.alsoCourses.map((c) => <span key={c}>{c}</span>)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= 공지사항 · FAQ ========================= */}
      <section className="section section--white" aria-label="공지사항 및 자주 묻는 질문">
        <div className="container">
          <div className="content two-col">
            <div>
              <div className="list-head">
                <h2>공지사항</h2>
                <Link className="section-head__more" href="/notice">더보기 →</Link>
              </div>
              <ul className="notice-list">
                {NOTICES.map((n, i) => (
                  <li key={n}>
                    <Link href={`/notice/${i + 1}`}>{n}<span className="date">2026-03-16</span></Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="list-head">
                <h2>자주 묻는 질문</h2>
                <Link className="section-head__more" href="/process">더보기 →</Link>
              </div>

              {/* 메인에서는 펼치지 않고 취득절차 페이지의 해당 항목으로 보냅니다 */}
              <div className="faq faq--wide">
                {FAQS.map((f) => (
                  <div className="faq__item" key={f.href}>
                    <Link className="faq__q faq__q--link" href={f.href}>
                      {f.q}
                      <span className="arrow" aria-hidden="true">›</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== 국가자격증 안내 ========================
           Figma section (334:9450) — 사진 카드 4개 + 전체 폭 버튼.
           국가자격증은 관계사(hpsedu.co.kr)에서 다루므로 외부 링크입니다. */}
      <section className="section" aria-labelledby="natcert-title">
        <div className="container">
          <div className="section-head content">
            <h2 id="natcert-title">국가자격증은 여기서!</h2>
          </div>

          <div className="content natcert-grid">
            {NATCERTS.map((c) => (
              <a className="natcert-card" href="https://www.hpsedu.co.kr/" target="_blank" rel="noopener" key={c.name}>
                <img src={c.img} alt="" aria-hidden="true" loading="lazy" />
                <strong>{c.name}</strong>
              </a>
            ))}
          </div>

          <a className="content btn btn--primary btn--block natcert-more"
             href="https://www.hpsedu.co.kr/" target="_blank" rel="noopener">
            국가자격증 알아보기 <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>
  );
}
