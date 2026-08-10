'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { submitCertificateApplicationAction } from '@/features/certificate-applications/actions/certificate-application.actions';
import { uploadCertificatePhotoFile } from '@/features/certificate-applications/lib/certificate-photo-upload.client';
import type { CertificateApplicationPageData } from '@/features/certificate-applications/types/certificate-application.types';
import PostcodeButton from '@/features/korhrd/components/form/PostcodeButton';
import { todayInKst } from '@/lib/shared/kst-date';

const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

/** 신청 기한까지 남은 날짜에 따라 색을 달리합니다(원본과 같은 규칙: 임박 빨강 / 여유 주황). */
function deadlineColor(deadline: string | null) {
  if (!deadline) return 'var(--muted)';
  const days = Math.ceil(
    (new Date(`${deadline}T00:00:00`).getTime() - new Date(`${todayInKst()}T00:00:00`).getTime()) /
      86_400_000,
  );
  return days <= 2 ? 'var(--red)' : 'var(--amber)';
}

/** "2026-04-27" → 앞 두 자리를 .yy 로 감싸 좁은 화면에서 숨길 수 있게 합니다 */
function DateWithCentury({ date }: { date: string }) {
  return (
    <time dateTime={date}>
      <span className="yy">{date.slice(0, 2)}</span>
      {date.slice(2)}
    </time>
  );
}

/**
 * 자격증 발급 신청.
 * 프로토타입 원본: korhrd-site/certificate.html — 구조·클래스를 그대로 씁니다.
 *
 * 디자인대로 **여러 자격증을 한 번에** 신청할 수 있습니다. 서버 액션은 한 건씩
 * 받으므로 선택한 과정 수만큼 순서대로 보내고, 하나라도 실패하면 거기서 멈추고
 * 알립니다(앞서 접수된 건은 그대로 남습니다 — 발급 현황에서 확인할 수 있습니다).
 */
export function CertificateApplyForm({
  data,
  initialCourseId,
}: {
  data: CertificateApplicationPageData;
  initialCourseId?: string;
}) {
  const router = useRouter();
  const selectable = data.eligibleCourses.filter((course) => !course.alreadyApplied);

  const [checked, setChecked] = useState<string[]>(() => {
    const preset = selectable.find((course) => course.courseId === initialCourseId);
    return preset ? [preset.courseId] : selectable.slice(0, 1).map((course) => course.courseId);
  });

  const [deliveryName, setDeliveryName] = useState(data.profile.name ?? '');
  // 자격증에 인쇄되는 값입니다. 회원가입에서 받지 않아 비어 있을 수 있어 여기서 받습니다.
  const [birthDate, setBirthDate] = useState(data.profile.birthDate ?? '');
  const [phone, setPhone] = useState(data.profile.phone ?? '');
  const [postalCode, setPostalCode] = useState(data.profile.postalCode ?? '');
  const [address, setAddress] = useState(data.profile.address ?? '');
  const [addressDetail, setAddressDetail] = useState(data.profile.addressDetail ?? '');
  const [memo, setMemo] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (courseId: string) =>
    setChecked((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );

  /* 선택한 건들의 발급비 합계 — 선납이 있으면 그만큼 빠집니다 */
  const selectedCourses = data.eligibleCourses.filter((course) => checked.includes(course.courseId));
  const prepaidTotal = selectedCourses.reduce((sum, course) => sum + course.prepaymentAmount, 0);
  const total = Math.max(0, data.issuanceCost * selectedCourses.length - prepaidTotal);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (checked.length === 0) {
      setError('발급할 자격증을 한 개 이상 선택해주세요.');
      return;
    }

    startTransition(async () => {
      let photoUrl = '';
      if (photo) {
        try {
          photoUrl = await uploadCertificatePhotoFile(photo);
        } catch {
          setError('증명사진 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
          return;
        }
      }

      let firstApplicationId = '';
      for (const courseId of checked) {
        const result = await submitCertificateApplicationAction({
          courseId,
          deliveryName,
          birthDate,
          phone,
          postalCode,
          address,
          addressDetail,
          memo,
          photoUrl,
          paymentMethod,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }
        if (!firstApplicationId) firstApplicationId = result.applicationId;
      }

      // push 뒤에 refresh()를 부르면 이동이 끝나기 전에 현재 페이지를 다시 불러와
      // 트랜지션이 끝나지 않습니다(버튼이 "신청 중…"에서 멈춥니다).
      router.push(`/certificate/complete?id=${firstApplicationId}`);
    });
  };

  if (selectable.length === 0) {
    return (
      <div className="container">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li aria-current="page">자격증 발급신청</li>
          </ol>
        </nav>

        <div className="page-head"><h1>자격증 발급신청</h1></div>

        <div className="layout-side mt-5">
          <aside>
            <nav className="filter-group" aria-label="발급 메뉴">
              <Link className="side-nav__item" href="/certificate" aria-current="page">발급 신청</Link>
              <Link className="side-nav__item" href="/certificate/status">발급 신청 현황</Link>
            </nav>
          </aside>

          <div>
            <div className="guide-box">
              <strong>발급 신청할 수 있는 과정이 없습니다</strong>
              <ul>
                <li>수료 조건(진도율·시험 합격)을 충족한 과정만 신청할 수 있습니다.</li>
                <li>수강중인 과정은 <Link href="/mylecture">나의 강의실</Link>에서 확인하세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">자격증 발급신청</li>
        </ol>
      </nav>

      <div className="page-head"><h1>자격증 발급신청</h1></div>

      <div className="layout-side mt-5">
        <aside>
          <nav className="filter-group" aria-label="발급 메뉴">
            <Link className="side-nav__item" href="/certificate" aria-current="page">발급 신청</Link>
            <Link className="side-nav__item" href="/certificate/status">발급 신청 현황</Link>
          </nav>
        </aside>

        <div>
          {/* ========================== 발급 안내 배너 ========================= */}
          <section className="issue-banner">
            <div className="issue-banner__txt">
              <p className="issue-banner__label">한국직업능력개발원 정식등록 민간자격증</p>
              <h2>자격증 발급 <em>상장형 · 카드형 동시 발급</em></h2>
              <p>
                발급비 {won(data.issuanceCost)}에 협회 자격증 발급비용과 택배비가 모두 포함됩니다.
                자격증 취득 후 갱신이 필요 없는 평생자격증입니다.
              </p>
            </div>
            {/* 전달본 assets/상장형.png · 카드형.png 를 옮긴 것입니다.
                파일명은 ASCII로 바꿨습니다 — 한글 파일명은 URL 인코딩에서 자주 깨집니다 */}
            <div className="issue-banner__certs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cert-award.png" alt="상장형 자격증 견본" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cert-card.png" alt="카드형 자격증 견본" loading="lazy" />
            </div>
          </section>

          {/* ============================ 필독사항 =========================== */}
          <div className="card card--note mt-4">
            <h2 className="card__title" style={{ marginBottom: '12px' }}>발급 전 필독사항</h2>
            <ul className="guide-box" style={{ marginTop: 0, padding: 0, background: 'none' }}>
              <li style={{ gridColumn: 'auto' }}>배송 기간 : 매주 화요일 협회로 명단이 전달되며, 배송 완료는 전달일로부터 1~2일 소요됩니다</li>
              <li style={{ gridColumn: 'auto' }}>발급 금액 : {won(data.issuanceCost)} (협회 자격증 발급비용 · 택배비 포함 / 집체교육 진행 시 200,000원)</li>
              <li style={{ gridColumn: 'auto' }}>본 교육원의 자격증은 한국직업능력개발원에 등록된 자격과정으로, 지정기관 등록의 제공인력(교강사) 자격요건으로도 사용 가능합니다</li>
              <li style={{ gridColumn: 'auto' }}>자격증 발급은 한국직업능력개발원 정식 자격등록번호를 부여하여 한국직업능력교육협회 명의로 발급됩니다</li>
              <li style={{ gridColumn: 'auto' }}>증명사진을 첨부하셔야 카드형 자격증에 사진이 첨부됩니다. 미첨부시 사진 없이 자격증만 발급됩니다</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ========================== 자격증 선택 ========================== */}
            <div className="card mt-4">
              <h2 className="card__title" style={{ marginBottom: '6px' }}>발급할 자격증 선택</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '14px' }}>
                합격하신 과정만 표시됩니다. 2개 이상 신청하실 경우 각각 선택해 주세요.
              </p>

              <table className="issue-table">
                <caption className="sr-only">발급 가능한 자격증 목록</caption>
                <thead>
                  <tr>
                    <th scope="col">선택</th>
                    <th scope="col">자격증명</th>
                    <th className="col-pass" scope="col">합격일</th>
                    <th scope="col">신청 기한</th>
                    <th scope="col">발급비</th>
                  </tr>
                </thead>
                <tbody>
                  {data.eligibleCourses.map((course) => (
                    <tr key={course.courseId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked.includes(course.courseId)}
                          disabled={course.alreadyApplied}
                          onChange={() => toggle(course.courseId)}
                          aria-label={`${course.courseTitle} 선택`}
                        />
                      </td>
                      <td>
                        <b>{course.courseTitle}</b>
                        {course.alreadyApplied ? (
                          <span className="hint"> · 신청 완료</span>
                        ) : null}
                      </td>
                      <td className="col-pass">
                        {course.passedAt ? <time dateTime={course.passedAt}>{course.passedAt}</time> : '—'}
                      </td>
                      <td className="due" style={{ color: deadlineColor(course.applyDeadline), fontWeight: 700 }}>
                        {course.applyDeadline ? (
                          <>
                            <DateWithCentury date={course.applyDeadline} />까지
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="tabular fee" data-short="10만원">{won(data.issuanceCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="notice mt-4">
                <span>
                  <b>합격 후 7일이 지나면 해당 과목이 초기화되어 발급 신청이 불가합니다.</b>
                  기한 내에 신청해 주세요.
                </span>
              </p>
            </div>

            {/* ========================== 증명사진 ========================== */}
            <div className="card mt-3">
              <h2 className="card__title">증명사진 첨부</h2>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: '80px', flexShrink: 0, textAlign: 'center' }}>
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview} alt="증명사진 미리보기"
                      style={{ width: '80px', height: '107px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                  ) : (
                    <span className="ph ph--cert" aria-hidden="true">사진<small>3 × 4cm</small></span>
                  )}
                </div>
                <div className="field" style={{ flex: 1, minWidth: '220px' }}>
                  <label htmlFor="photo">증명사진 파일 <span className="hint">(선택 · JPG/PNG, 5MB 이하)</span></label>
                  <input
                    id="photo" type="file" accept="image/png,image/jpeg"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setPhoto(file);
                      if (photoPreview) URL.revokeObjectURL(photoPreview);
                      setPhotoPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  <p style={{ fontSize: '11.5px', color: 'var(--faint)', marginTop: '7px' }}>
                    미첨부시 사진 없이 자격증만 발급됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* =========================== 배송정보 ========================== */}
            <div className="card mt-3">
              <h2 className="card__title">배송정보</h2>
              <div className="form" style={{ maxWidth: 'none' }}>
                <div className="field">
                  <label htmlFor="rname">받는 분 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                  <input
                    id="rname" type="text" required autoComplete="name"
                    value={deliveryName} onChange={(event) => setDeliveryName(event.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="rbirth">
                    생년월일 <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(필수)</span>
                    <span className="hint">— 자격증에 표기됩니다</span>
                  </label>
                  <input
                    id="rbirth" type="date" required autoComplete="bday"
                    max={new Date().toISOString().slice(0, 10)}
                    value={birthDate} onChange={(event) => setBirthDate(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="zip">우편번호 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="zip" type="text" required inputMode="numeric" placeholder="00000"
                      style={{ maxWidth: '140px' }}
                      value={postalCode} onChange={(event) => setPostalCode(event.target.value)}
                    />
                    <PostcodeButton
                      onSelect={({ postalCode: zip, address: addr }) => {
                        setPostalCode(zip);
                        setAddress(addr);
                      }}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="addr1">주소 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                  <input
                    id="addr1" type="text" required autoComplete="address-line1" placeholder="기본 주소"
                    value={address} onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="addr2">상세 주소</label>
                  <input
                    id="addr2" type="text" autoComplete="address-line2" placeholder="동·호수 등"
                    value={addressDetail} onChange={(event) => setAddressDetail(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="rphone">연락처 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                  <input
                    id="rphone" type="tel" required autoComplete="tel" inputMode="numeric"
                    placeholder="010-1234-5678"
                    value={phone} onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="memo">배송 메모</label>
                  <textarea
                    id="memo" rows={2} placeholder="부재 시 문 앞에 놓아주세요"
                    value={memo} onChange={(event) => setMemo(event.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* =========================== 결제정보 ========================== */}
            <div className="card mt-3">
              <h2 className="card__title">결제정보</h2>

              <div className="fee-summary">
                <p className="fee-summary__row">
                  자격증 발급비 <b>{won(data.issuanceCost)}</b> × <span>{selectedCourses.length}</span>건
                </p>
                {prepaidTotal > 0 ? (
                  <p className="fee-summary__row">선납 반영 <b>-{won(prepaidTotal)}</b></p>
                ) : null}
                <p className="fee-summary__total">최종 결제금액 <b>{won(total)}</b></p>
              </div>

              <div className="form mt-4" style={{ maxWidth: 'none' }}>
                <div className="field">
                  <label htmlFor="pay">결제 방법 <span className="req" aria-hidden="true">*</span><span className="sr-only">(필수)</span></label>
                  <select
                    id="pay" required value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as 'card' | 'bank_transfer')}
                  >
                    <option value="card">카드 결제</option>
                    <option value="bank_transfer">무통장 입금</option>
                  </select>
                </div>
              </div>

              <p className="notice mt-3">
                <span>
                  무통장 입금 시 <b>신한은행 140-015-773620 (주)한평생그룹</b> 계좌로 입금해 주세요.
                  반드시 <b>수강자 본인 이름</b>으로 입금하셔야 하며,
                  입금자명과 수강자명이 다를 경우 확인 전화를 드립니다.
                  입금자명 옆에 생년월일을 함께 기재해 주시면 처리가 빠릅니다. (예: 홍길동0320)
                </span>
              </p>
            </div>

            <p className="agree mt-3" style={{ maxWidth: 'none' }}>
              <input
                id="agree" type="checkbox" required
                checked={agree} onChange={(event) => setAgree(event.target.checked)}
              />
              <label htmlFor="agree">
                <b>[필수] 배송지 정보 수집 및 자격증 발급 진행에 동의합니다</b><br />
                배송지 주소와 연락처를 반드시 확인해 주세요. 잘못된 정보로 반송될 경우
                재배송 비용은 착불로 배송됩니다.
              </label>
            </p>

            {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}

            <p className="text-center mt-4">
              <button
                className="btn btn--primary btn--lg" type="submit"
                style={{ minWidth: '280px' }}
                disabled={isPending || checked.length === 0}
              >
                {isPending ? '신청 중…' : '자격증 발급 신청하기'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
