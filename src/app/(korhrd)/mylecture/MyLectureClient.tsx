'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { withdrawMyAccountAction } from '@/features/members/actions/member-profile.actions';
import { EXTEND_COUNT } from '@/features/korhrd/data/enrollments';
import type { CourseReviewItem, ReviewableCourse } from '@/features/korhrd/services/course-review.service';
import MyCard from '@/features/korhrd/components/mylecture/MyCard';
import type { Enrollment } from '@/features/korhrd/lib/types';
import styles from './page.module.css';

/**
 * 나의 강의실.
 * 프로토타입 원본: korhrd-site/mylecture.html + main.js initMyLecture()
 *
 * 탭 4개는 라우트가 아니라 ?tab= 로 구분합니다.
 * (헤더의 "○○ 님" 링크가 /mylecture?tab=mypage 로 바로 들어옵니다)
 */
type Tab = 'active' | 'ended' | 'review' | 'mypage';

export type MyLectureMember = {
  id: string;
  name: string;
  /** "1975-03-20". 자격증에 표기되며 없을 수 있습니다 */
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  joinedAt: string;
};

export default function MyLectureClient({
  initialTab,
  active: ACTIVE,
  ended: ENDED,
  pending,
  courseCodeByName,
  member: MEMBER,
  reviewable,
  myReviews,
}: {
  initialTab?: string;
  active: Enrollment[];
  ended: Enrollment[];
  pending: { courseTitle: string; appliedAt: string }[];
  courseCodeByName: Record<string, string>;
  member: MyLectureMember;
  /** 후기를 쓸 수 있는 과정(합격한 과정) */
  reviewable: ReviewableCourse[];
  /** 내가 쓴 후기 */
  myReviews: CourseReviewItem[];
}) {
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || 'active');
  const [extend, setExtend] = useState<Record<string, number>>(EXTEND_COUNT);
  const [isWithdrawing, startWithdraw] = useTransition();

  const handleWithdraw = () => {
    if (!window.confirm('정말 탈퇴하시겠어요?\n탈퇴하면 다시 로그인할 수 없습니다.')) return;
    startWithdraw(async () => {
      // 성공하면 액션이 홈으로 리다이렉트합니다 — 돌아오는 건 실패했을 때뿐입니다.
      const result = await withdrawMyAccountAction();
      if (result && !result.success) window.alert(result.message);
    });
  };

  const TABS: [Tab, string, number | null][] = [
    ['active', '수강중인 과목', ACTIVE.length],
    ['ended', '수강종료 과목', ENDED.length],
    ['review', '나의 합격후기', myReviews.length],
    ['mypage', '마이페이지', null],
  ];

  /* 후기 작성 링크 — 합격한 과정을 전부 넘기면 작성 화면에서 대표 과정을 고릅니다 */
  const writeHref = '/reviews/write';

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">나의 강의실</li>
        </ol>
      </nav>

      <div className="page-head"><h1>나의 강의실</h1></div>

      <div className="layout-side mt-5">
        <aside>
          <div className="filter-group" role="tablist" aria-label="나의 강의실 메뉴">
            {TABS.map(([key, label, count]) => (
              <button
                key={key} className="side-nav__item" type="button" role="tab"
                aria-selected={tab === key} aria-controls={`tab-${key}`}
                onClick={() => setTab(key)}
              >
                {label} {count !== null && <span className="num">{count}</span>}
              </button>
            ))}
          </div>
        </aside>

        <div>
          {/* ================= 수강중인 과목 ================= */}
          <section id="tab-active" role="tabpanel" aria-label="수강중인 과목" hidden={tab !== 'active'}>
            {/* 신청했지만 아직 관리자 승인 전인 과정 — 승인되면 아래 목록으로 내려옵니다 */}
            {pending.length > 0 && (
              <div className="guide-box" style={{ marginBottom: 16 }}>
                <strong>승인 대기중인 신청 {pending.length}건</strong>
                <ul>
                  {pending.map((p) => (
                    <li key={p.courseTitle}>
                      {p.courseTitle} — {p.appliedAt} 신청 · 관리자 승인 후 학습을 시작할 수 있습니다
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ACTIVE.length === 0 && pending.length === 0 && (
              <div className="guide-box" style={{ marginBottom: 16 }}>
                <strong>수강중인 과목이 없습니다</strong>
                <ul><li><Link href="/courses">수강신청</Link>에서 과정을 선택해 무료로 신청하실 수 있습니다.</li></ul>
              </div>
            )}

            {ACTIVE.map((e) => <MyCard key={e.course} enrollment={e} courseCode={courseCodeByName[e.course]} />)}

            <div className="guide-box">
              <strong>학습자 유의사항</strong>
              <ul>
                <li>시험 응시는 출석률 60% 이상 조건 만족 시 가능합니다</li>
                <li>시험 합격 후 7일 이내 자격증 발급 신청이 가능합니다</li>
                <li>자격증 배송은 신청일 다음 날부터 최대 7일(휴일 제외) 소요됩니다</li>
                <li>자격증 취득 후 이력서 및 활용 기관에 정식으로 기재 가능합니다</li>
                <li>합격 후 7일 경과 시 해당 과목이 초기화되어 발급 신청이 불가합니다</li>
                <li>발급비는 과정당 100,000원이며 상장형·카드형이 함께 발급됩니다</li>
              </ul>
            </div>
          </section>

          {/* ================= 수강종료 과목 ================= */}
          <section id="tab-ended" role="tabpanel" aria-label="수강종료 과목" hidden={tab !== 'ended'}>
            {ENDED.map((e) => (
              <MyCard
                key={e.course} enrollment={e} courseCode={courseCodeByName[e.course]}
                extendCount={extend[e.course] ?? 0}
                onExtend={(course) => setExtend((prev) => ({ ...prev, [course]: (prev[course] ?? 0) + 1 }))}
              />
            ))}

            <div className="guide-box">
              <strong>수강종료 안내</strong>
              <ul>
                <li>수강 기간은 과정당 <b>최대 5회</b>까지 연장하실 수 있습니다</li>
                <li>1회 연장 시 수강 기간이 <b>30일</b> 연장됩니다</li>
                <li>자격증을 수령 완료한 과정은 연장 대상에서 제외됩니다</li>
                <li>기간을 연장하면 미수료·불합격 과정도 이어서 학습하거나 재응시할 수 있습니다</li>
              </ul>
            </div>
          </section>

          {/* ================= 나의 합격후기 ================= */}
          <section id="tab-review" role="tabpanel" aria-label="나의 합격후기" hidden={tab !== 'review'}>
            {/* ① 정보 블록 — 합격한 과정을 모두 모아 보여줍니다 (수강중/수강종료 구분 없음) */}
            <section className="rv-panel">
              <div className="rv-panel__head">
                <div>
                  <h2>후기를 쓸 수 있는 과정</h2>
                  <p>여러 과정을 함께 들으셨다면 한 건에 묶어 작성할 수 있습니다.</p>
                </div>
                <span className="rv-panel__count">{reviewable.length}</span>
              </div>

              <ul className="rv-list">
                {reviewable.map((c) => (
                  <li key={c.courseId}>
                    <span className="rv-list__name">{c.courseTitle}</span>
                    <span className="rv-list__date">
                      {c.alreadyWritten ? '후기 작성 완료' : '후기 작성 가능'}
                    </span>
                  </li>
                ))}
                {reviewable.length === 0 && (
                  <li><span className="rv-list__name">합격한 과정이 아직 없습니다.</span></li>
                )}
              </ul>
            </section>

            {/* ② 액션은 블록 바깥에 — 위는 정보, 아래는 실행 */}
            <p className="rv-cta">
              <Link className="btn btn--primary btn--lg" href={writeHref}>후기 작성하기</Link>
            </p>

            {/* ③ 작성한 후기 */}
            <h2 className="rv-title">작성한 후기 <span>{myReviews.length}</span></h2>

            {myReviews.map((r) => (
              <article className="rv-item" key={r.id}>
                <span className="ph ph--cert-sq" aria-hidden="true">자격증 사진<small>1 : 1</small></span>
                <div className="rv-item__body">
                  <div className="rv-item__top">
                    <h3><Link href={`/reviews/${r.id}`}>{r.title}</Link></h3>
                    <span className="badge badge--pass">등록 완료</span>
                  </div>
                  <p className="rv-item__tags">
                    <span>{r.course}</span>
                    {r.alsoCourses.map((c) => <span key={c}>{c}</span>)}
                  </p>
                  <p className="rv-item__meta">
                    작성일 <time dateTime={r.date}>{r.date}</time> · 도움됐어요 <b>{r.helpful}</b>
                  </p>
                </div>
                <div className="rv-item__actions">
                  <Link className="btn btn--ghost" href={`/reviews/${r.id}`}>후기 보기</Link>
                  <Link className="btn btn--primary" href={`/reviews/write?id=${r.id}`}>수정하기</Link>
                </div>
              </article>
            ))}

            <div className="guide-box">
              <strong>합격후기 안내</strong>
              <ul>
                <li>시험에 합격한 과정에 대해서만 후기를 작성하실 수 있습니다</li>
                <li>여러 과정을 함께 들으셨다면 후기 1건에 묶어 작성할 수 있습니다 (대표 과정 1개 선택)</li>
                <li>자격증 실물 사진을 함께 올리면 합격후기 목록에 노출됩니다</li>
                <li>욕설·광고 등 운영 정책에 어긋나는 후기는 사전 고지 없이 삭제됩니다</li>
              </ul>
            </div>
          </section>

          {/* ================= 마이페이지 ================= */}
          <section id="tab-mypage" role="tabpanel" aria-label="마이페이지" hidden={tab !== 'mypage'}>
            <div className={`card ${styles.member}`}>
              <h2 className="card__title">회원정보</h2>
              <table className="info-table">
                <tbody>
                  <tr><th scope="row">아이디</th><td>{MEMBER.id}</td></tr>
                  <tr><th scope="row">이름</th><td>{MEMBER.name}</td></tr>
                  {/* 회원가입에서 받지 않아 비어 있을 수 있습니다. 자격증에 표기되는 값이라
                      비어 있으면 채우도록 안내합니다. */}
                  <tr>
                    <th scope="row">생년월일</th>
                    <td className="tabular">
                      {MEMBER.birthDate || <span className="hint">미등록 — 정보 수정에서 입력해주세요</span>}
                    </td>
                  </tr>
                  <tr><th scope="row">휴대폰</th><td className="tabular">{MEMBER.phone}</td></tr>
                  <tr><th scope="row">이메일</th><td>{MEMBER.email}</td></tr>
                  <tr><th scope="row">주소</th><td>{MEMBER.address}</td></tr>
                  <tr><th scope="row">가입일</th><td><time dateTime={MEMBER.joinedAt}>{MEMBER.joinedAt}</time></td></tr>
                </tbody>
              </table>
              <div className="issue-actions mt-4">
                <Link className="btn btn--primary" href="/mypage">정보 수정</Link>
                <Link className="btn btn--ghost" href="/mypage/password">비밀번호 변경</Link>
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                >
                  탈퇴하기
                </button>
              </div>
            </div>

            <div className="guide-box">
              <strong>회원정보 안내</strong>
              <ul>
                <li>자격증은 등록된 주소로 배송되니 변경 시 미리 수정해 주세요</li>
                <li>휴대폰 번호는 시험 일정·합격 안내 문자 수신에 사용됩니다</li>
                <li>아이디는 변경할 수 없으며 탈퇴 후 재가입이 필요합니다</li>
                <li>회원 탈퇴는 위 탈퇴하기 버튼으로 진행하실 수 있습니다</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
