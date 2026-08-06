'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { submitCertificateApplicationAction } from '@/features/certificate-applications/actions/certificate-application.actions';
import { uploadCertificatePhotoFile } from '@/features/certificate-applications/lib/certificate-photo-upload.client';
import type { CertificateApplicationPageData } from '@/features/certificate-applications/types/certificate-application.types';

const won = (n: number) => n.toLocaleString('ko-KR') + '원';

/**
 * 자격증 발급 신청 — 마크업은 korhrd 디자인, 제출은 기존 발급신청 서비스.
 * 수료 조건 충족 여부는 서버가 판단해 eligibleCourses로만 내려줍니다.
 */
export function CertificateApplyForm({
  data,
  initialCourseId,
}: {
  data: CertificateApplicationPageData;
  initialCourseId?: string;
}) {
  const router = useRouter();
  const selectable = data.eligibleCourses.filter((c) => !c.alreadyApplied);

  const [courseId, setCourseId] = useState(
    selectable.find((c) => c.courseId === initialCourseId)?.courseId ?? selectable[0]?.courseId ?? '',
  );
  const [deliveryName, setDeliveryName] = useState(data.profile.name ?? '');
  const [phone, setPhone] = useState(data.profile.phone ?? '');
  const [postalCode, setPostalCode] = useState(data.profile.postalCode ?? '');
  const [address, setAddress] = useState(data.profile.address ?? '');
  const [addressDetail, setAddressDetail] = useState(data.profile.addressDetail ?? '');
  const [memo, setMemo] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = data.eligibleCourses.find((c) => c.courseId === courseId);
  const payable = Math.max(0, data.issuanceCost - (selected?.prepaymentAmount ?? 0));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

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

      const result = await submitCertificateApplicationAction({
        courseId,
        deliveryName,
        phone,
        postalCode,
        address,
        addressDetail,
        memo,
        photoUrl,
        paymentMethod: 'bank_transfer',
      });

      if (result.success) {
        // push 뒤에 refresh()를 부르면 이동이 끝나기 전에 현재 페이지를 다시 불러와
        // 트랜지션이 끝나지 않습니다(버튼이 "신청 중…"에서 멈춥니다).
        // 완료 화면은 서버에서 매번 조회하므로 refresh가 필요 없습니다.
        router.push(`/certificate/complete?id=${result.applicationId}`);
      } else {
        setError(result.message);
      }
    });
  };

  if (data.eligibleCourses.length === 0) {
    return (
      <div className="container">
        <div className="page-head"><h1>자격증 발급 신청</h1></div>
        <div className="guide-box">
          <strong>발급 신청할 수 있는 과정이 없습니다</strong>
          <ul>
            <li>수료 조건(진도율·시험 합격)을 충족한 과정만 신청할 수 있습니다.</li>
            <li>수강중인 과정은 <Link href="/mylecture">나의 강의실</Link>에서 확인하세요.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/mylecture">나의 강의실</Link></li>
          <li aria-current="page">자격증 발급 신청</li>
        </ol>
      </nav>

      <div className="page-head"><h1>자격증 발급 신청</h1></div>

      <div className="form-card">
        <form className="form" style={{ maxWidth: 'none' }} onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="course">발급 과정 <span className="req" aria-hidden="true">*</span></label>
            <select
              id="course" value={courseId} required
              onChange={(event) => setCourseId(event.target.value)}
            >
              {data.eligibleCourses.map((course) => (
                <option key={course.courseId} value={course.courseId} disabled={course.alreadyApplied}>
                  {course.courseTitle}{course.alreadyApplied ? ' (신청 완료)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="deliveryName">받는 분 <span className="req" aria-hidden="true">*</span></label>
            <input
              id="deliveryName" type="text" required value={deliveryName}
              onChange={(event) => setDeliveryName(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="phone">연락처 <span className="req" aria-hidden="true">*</span></label>
            <input
              id="phone" type="tel" required value={phone} placeholder="010-1234-5678"
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="postalCode">우편번호 <span className="req" aria-hidden="true">*</span></label>
            <input
              id="postalCode" type="text" required value={postalCode} inputMode="numeric"
              onChange={(event) => setPostalCode(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="address">주소 <span className="req" aria-hidden="true">*</span></label>
            <input
              id="address" type="text" required value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="addressDetail">상세주소</label>
            <input
              id="addressDetail" type="text" value={addressDetail}
              onChange={(event) => setAddressDetail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="photo">증명사진 <span className="hint">(선택 · 자격증에 인쇄됩니다)</span></label>
            <input
              id="photo" type="file" accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="field">
            <label htmlFor="memo">요청사항</label>
            <textarea
              id="memo" rows={3} value={memo}
              onChange={(event) => setMemo(event.target.value)}
            />
          </div>

          <dl className="exam-info">
            <div><dt>발급비</dt><dd>{won(data.issuanceCost)}</dd></div>
            {selected && selected.prepaymentAmount > 0 ? (
              <div><dt>선납 반영</dt><dd>-{won(selected.prepaymentAmount)}</dd></div>
            ) : null}
            <div><dt>결제하실 금액</dt><dd><b>{won(payable)}</b></dd></div>
          </dl>

          {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}

          <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={isPending || !courseId}>
            {isPending ? '신청 중…' : '자격증 발급 신청하기'}
          </button>
        </form>
      </div>

      <div className="guide-box mt-4">
        <strong>발급 안내</strong>
        <ul>
          <li>발급비는 과정당 {won(data.issuanceCost)}이며 상장형·카드형이 함께 발급됩니다.</li>
          <li>신청 후 협회 심사를 거쳐 배송까지 최대 7일(휴일 제외) 소요됩니다.</li>
          <li>신청 내역은 <Link href="/certificate/status">발급 내역</Link>에서 확인하실 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}
