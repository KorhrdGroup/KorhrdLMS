"use client";

import { useEffect } from "react";

/**
 * `<body data-logged-in="true">` 를 세션에 맞춰 붙입니다.
 *
 * 퍼블리싱 CSS가 이 속성으로 로그인/비로그인 UI를 가릅니다
 * (home.css: `.loginbox--member{display:none}` +
 *  `body[data-logged-in="true"] .loginbox--member{display:flex}`).
 * 원본 프로토타입에서는 main.js가 붙이던 것이라, React로 옮기며 빠져 있었습니다.
 */
export function BodyAuthFlag({ isLoggedIn }: { isLoggedIn: boolean }) {
  useEffect(() => {
    const { body } = document;
    if (isLoggedIn) {
      body.dataset.loggedIn = "true";
    } else {
      delete body.dataset.loggedIn;
    }
    return () => {
      delete body.dataset.loggedIn;
    };
  }, [isLoggedIn]);

  return null;
}
