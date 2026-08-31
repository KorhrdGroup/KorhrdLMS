/**
 * 개인정보처리방침
 *
 * 프로토타입 원본: korhrd-site/privacy.html
 * ⚠ 이 파일은 마크업만 옮긴 상태입니다. 아래를 확인해 주세요.
 *   - 반복되는 목록은 data/*.ts 를 map() 으로 돌리도록 바꾸기
 *   - 상호작용(탭·아코디언·필터 등)은 components/ 의 공용 컴포넌트로 교체
 *   - class 이름은 그대로 두세요. styles/*.css 가 그 이름에 걸려 있습니다.
 */

import Link from 'next/link';
import { PrivacyBody } from '@/features/korhrd/components/policy/PrivacyBody';
export default function Page() {
  return (
    <div className="container">
        <nav className="breadcrumb" aria-label="현재 위치"><ol><li><Link href="/">홈</Link></li><li aria-current="page">개인정보처리방침</li></ol></nav>
        <div className="page-head"><h1>개인정보처리방침</h1></div>
        <PrivacyBody />
    </div>
  );
}
