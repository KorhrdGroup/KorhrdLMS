'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { updateMyProfileAction } from '@/features/members/actions/member-profile.actions';
import type { MemberProfile } from '@/features/members/services/member-profile.service';
import PostcodeButton from '@/features/korhrd/components/form/PostcodeButton';

/**
 * 회원정보 수정 폼.
 * 프로토타입 원본: korhrd-site/mypage-edit.html — class 이름은 CSS가 걸려 있어 그대로 둡니다.
 *
 * 아이디는 읽기 전용입니다(변경하려면 탈퇴 후 재가입 — 안내 문구와 같은 규칙).
 */
export default function MyPageForm({ profile }: { profile: MemberProfile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [birthDate, setBirthDate] = useState(profile.birthDate);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [postalCode, setPostalCode] = useState(profile.postalCode);
  const [address, setAddress] = useState(profile.address);
  const [addressDetail, setAddressDetail] = useState(profile.addressDetail);

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateMyProfileAction({
        name, birthDate, phone, email, postalCode, address, addressDetail,
      });

      if (result.success) {
        setSaved(true);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="form-card mt-5">
      <form className="form" style={{ maxWidth: 'none' }} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="mp-id">아이디</label>
          <input id="mp-id" type="text" value={profile.loginId} readOnly autoComplete="username" />
          <p style={{ fontSize: '11.5px', color: 'var(--faint)', marginTop: '7px' }}>
            아이디는 변경할 수 없습니다.
          </p>
        </div>

        <div className="field">
          <label htmlFor="mp-name">
            이름 <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(필수)</span> <span className="hint">— 자격증에 표기됩니다</span>
          </label>
          <input
            id="mp-name" type="text" required autoComplete="name"
            value={name} onChange={(event) => setName(event.target.value)}
          />
        </div>

        {/* 회원가입에서는 받지 않습니다. 자격증에 인쇄되는 값이라 여기서 채웁니다. */}
        <div className="field">
          <label htmlFor="mp-birth">
            생년월일 <span className="hint">— 자격증에 표기됩니다</span>
          </label>
          <input
            id="mp-birth" type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)}
            value={birthDate} onChange={(event) => setBirthDate(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="mp-phone">
            휴대폰 번호 <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <input
            id="mp-phone" type="tel" required autoComplete="tel" inputMode="numeric"
            placeholder="010-1234-5678"
            value={phone} onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="mp-email">이메일</label>
          <input
            id="mp-email" type="email" autoComplete="email"
            value={email} onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="mp-zip">
            우편번호 <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="mp-zip" type="text" required inputMode="numeric" style={{ maxWidth: '140px' }}
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
          <label htmlFor="mp-addr">
            주소 <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <input
            id="mp-addr" type="text" required
            value={address} onChange={(event) => setAddress(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="mp-addr2">상세주소</label>
          <input
            id="mp-addr2" type="text"
            value={addressDetail} onChange={(event) => setAddressDetail(event.target.value)}
          />
        </div>

        {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}
        {saved ? <p className="my-card__status my-card__status--pass">변경 내용을 저장했습니다.</p> : null}

        {/* 탈퇴하기는 나의 강의실 마이페이지 탭에만 둡니다 (2026-08-12) */}
        <div className="result-cta mt-4">
          <Link className="btn btn--ghost btn--lg" href="/mylecture?tab=mypage">취소</Link>
          <button className="btn btn--primary btn--lg" type="submit" disabled={isPending}>
            {isPending ? '저장 중…' : '변경 내용 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
