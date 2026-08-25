'use client';

import Link from 'next/link';
import { useState } from 'react';

/** 패밀리 사이트 — 여기에 한 줄 추가하면 전 페이지 푸터에 반영됩니다 */
const FAMILY_SITES = [{ name: '한평생원격교육원', url: 'https://www.hpsedu.co.kr/' }];

export default function Footer() {
  const [familyOpen, setFamilyOpen] = useState(false);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <p className="footer__links">
              <Link href="/about">교육원 소개</Link>
              <Link href="/support">고객센터</Link>
              <Link href="/terms">이용약관</Link>
              <Link href="/privacy">개인정보처리방침</Link>
            </p>
            <address>
              (주)한평생그룹 &nbsp; 대표 : 양병웅 &nbsp; 사업자등록번호 : 227-88-03196<br />
              주소 : 서울시 도봉구 창동 마들로13길 61 씨드큐브 905호 &nbsp; 개인정보책임자 : 양병웅<br />
              통신판매업신고 : 제24-도봉-0983호 &nbsp; 원격평생교육시설신고 (제 원격20-6호)<br />
              자격취득 발급계좌 : 신한은행 140-016-284987 (주)한평생그룹
            </address>
          </div>

          <div className="footer__side">
            <a className="footer__box" href="https://www.pqi.or.kr" target="_blank" rel="noopener">
              <span><strong>한국직업능력개발원</strong>민간자격관리운영센터에서 등록조회</span>
              <span aria-hidden="true">›</span>
            </a>
            <div className="footer__family">
              <button
                className="footer__box" type="button"
                aria-expanded={familyOpen} aria-controls="family-list"
                onClick={() => setFamilyOpen((v) => !v)}
              >
                <span>패밀리 사이트 바로가기</span>
                <span className="chev" aria-hidden="true">⌄</span>
              </button>
              <ul className="footer__family-list" id="family-list" hidden={!familyOpen}>
                {FAMILY_SITES.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener">{s.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="footer__legal">
          본 교육원의 자격증은 한국직업능력연구원에 등록된 민간자격으로, 국가공인 자격증이 아닙니다.<br />
          Copyright © 2026 한평생 직업훈련. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
