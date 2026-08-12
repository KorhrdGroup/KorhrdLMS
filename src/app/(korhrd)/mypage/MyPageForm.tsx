'use client';

import Link from 'next/link';
import BirthDateSelect from '@/features/korhrd/components/form/BirthDateSelect';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  updateMyProfileAction,
  withdrawMyAccountAction,
} from '@/features/members/actions/member-profile.actions';
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

  const handleWithdraw = () => {
    if (!window.confirm('정말 탈퇴하시겠어요?\n탈퇴하면 다시 로그인할 수 없습니다.')) return;
    startTransition(async () => {
      // 성공하면 액션이 홈으로 리다이렉트합니다 — 돌아오는 건 실패했을 때뿐입니다.
      const result = await withdrawMyAccountAction();
      if (result && !result.success) setError(result.message);
    });
  };

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
          {/* 자격증 발급신청과 같은 칸을 씁니다 — 같은 값을 받는 자리입니다 */}
          <BirthDateSelect id="mp-birth" value={birthDate} onChange={setBirthDate} />
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

        <div className="result-cta mt-4" style={{ alignItems: 'center' }}>
          <Link className="btn btn--ghost btn--lg" href="/mylecture?tab=mypage">취소</Link>
          <button className="btn btn--primary btn--lg" type="submit" disabled={isPending}>
            {isPending ? '저장 중…' : '변경 내용 저장'}
          </button>
          {/* 탈퇴는 버튼처럼 크게 두지 않습니다 — 은색 글씨 링크로 오른쪽에 둡니다 */}
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={isPending}
            style={{
              background: 'none', border: 0, padding: 0, cursor: 'pointer',
              font: 'inherit', fontSize: '13px', color: 'var(--faint, #9CA3AF)',
              textDecoration: 'underline',
            }}
          >
            탈퇴하기
          </button>
        </div>
      </form>
    </div>
  );
}
