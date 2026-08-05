"use client";

import { useEffect } from "react";

/**
 * 퍼블리싱 산출물(`course-detail-page/assets/js/main.js`)의 상세페이지 동작만 옮긴 것입니다.
 * 원본 스크립트는 사이트 전역용이라 그대로 싣지 않고, 이 페이지에 필요한 것만 담았습니다.
 *
 *  · body 클래스/속성 (style.css의 body.page--flat 규칙이 필요)
 *  · 섹션 바로가기 탭 — 스크롤 위치에 따라 현재 구역 표시
 *  · 추천 대상 캐러셀 — 자동 넘김 + 점 표시
 *  · FAQ 아코디언
 *  · 하단 CTA 카운트다운
 */
export function CourseDetailInteractions({ deadline }: { deadline: string }) {
  // body 스타일 — style.css가 body.page--flat 기준으로 배경/헤더선을 잡습니다.
  // (폰트는 CourseDetailView의 래퍼가 Pretendard 스택을 지정합니다)
  useEffect(() => {
    const { body } = document;
    body.classList.add("page--flat");
    body.dataset.loggedIn = "false";
    return () => {
      body.classList.remove("page--flat");
      delete body.dataset.loggedIn;
    };
  }, []);

  // 섹션 바로가기 탭
  useEffect(() => {
    const tabs = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-detail-tab]"));
    if (tabs.length === 0) return;

    const sections = tabs
      .map((tab) => document.querySelector<HTMLElement>(tab.getAttribute("href") ?? ""))
      .filter((el): el is HTMLElement => el !== null);

    const sync = () => {
      const line = window.scrollY + window.innerHeight * 0.3;
      let current = 0;
      sections.forEach((section, index) => {
        if (section.offsetTop <= line) current = index;
      });
      tabs.forEach((tab, index) => {
        tab.setAttribute("aria-current", index === current ? "true" : "false");
      });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  // 추천 대상 캐러셀 — 카드 폭 단위로 넘기고, 점은 페이지 수만큼 만듭니다.
  useEffect(() => {
    const track = document.querySelector<HTMLElement>("[data-who-track]");
    const dots = document.querySelector<HTMLElement>("[data-who-dots]");
    if (!track || !dots) return;

    // 레이아웃 전에는 clientWidth가 0이라 나눗셈이 Infinity가 됩니다. 반드시 막아야 합니다.
    const pageCount = () => {
      const width = track.clientWidth;
      if (width <= 0) return 1;
      return Math.max(1, Math.min(50, Math.ceil(track.scrollWidth / width)));
    };
    const currentPage = () => {
      const width = track.clientWidth;
      return width > 0 ? Math.round(track.scrollLeft / width) : 0;
    };

    const render = () => {
      const total = pageCount();
      if (dots.childElementCount !== total) {
        dots.replaceChildren(
          ...Array.from({ length: total }, (_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", `${index + 1}페이지`);
            dot.addEventListener("click", () => {
              track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
            });
            return dot;
          }),
        );
      }
      const active = currentPage();
      Array.from(dots.children).forEach((dot, index) => {
        dot.setAttribute("aria-current", index === active ? "true" : "false");
      });
    };

    render();
    track.addEventListener("scroll", render, { passive: true });
    window.addEventListener("resize", render);

    // 자동 넘김은 이 영역이 화면에 들어온 뒤에만 돕니다.
    // 그렇지 않으면 페이지를 연 순간부터 넘어가서, 스크롤해 내려왔을 때
    // 이미 2~3페이지로 밀려 있거나 넘어가는 중간이 보입니다.
    let timer = 0;
    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    };
    const start = () => {
      if (timer || pageCount() <= 1) return;
      timer = window.setInterval(() => {
        const next = (currentPage() + 1) % pageCount();
        track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
      }, 4500);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stop();
          return;
        }
        // 처음 보이는 순간에는 항상 첫 페이지부터 보여줍니다.
        if (track.scrollLeft !== 0 && !track.dataset.whoSeen) {
          track.scrollTo({ left: 0, behavior: "auto" });
        }
        track.dataset.whoSeen = "1";
        start();
      },
      { threshold: 0.4 },
    );
    observer.observe(track);

    // 읽는 중에 넘어가지 않도록 마우스를 올리거나 직접 끌면 멈춥니다.
    track.addEventListener("pointerenter", stop);
    track.addEventListener("pointerleave", start);
    track.addEventListener("pointerdown", stop);

    return () => {
      stop();
      observer.disconnect();
      track.removeEventListener("pointerenter", stop);
      track.removeEventListener("pointerleave", start);
      track.removeEventListener("pointerdown", stop);
      track.removeEventListener("scroll", render);
      window.removeEventListener("resize", render);
    };
  }, []);

  // FAQ 아코디언 — 원본 main.js와 동일한 구조로 맞춥니다.
  //
  // style.css는 `.faq__a { grid-template-rows: 0fr }` ↔ `1fr` 모프로 여닫습니다.
  // 이때 패딩이 클리핑 요소에 있으면 0fr에서도 그 높이만큼 남아 완전히 접히지 않으므로,
  // 내용을 .faq__a-inner(클리핑) > .faq__a-pad(여백)로 감싸야 합니다.
  // 접힘은 hidden이 아니라 0fr로 표현하므로 hidden은 걷어냅니다.
  useEffect(() => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-faq-q]"));
    const handlers: { button: HTMLButtonElement; handler: () => void }[] = [];

    for (const button of buttons) {
      const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
      if (!panel) continue;

      panel.hidden = false;

      if (!panel.querySelector(".faq__a-inner")) {
        const inner = document.createElement("div");
        inner.className = "faq__a-inner";
        const pad = document.createElement("div");
        pad.className = "faq__a-pad";
        while (panel.firstChild) pad.appendChild(panel.firstChild);
        inner.appendChild(pad);
        panel.appendChild(inner);
      }

      const handler = () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
      };
      button.addEventListener("click", handler);
      handlers.push({ button, handler });
    }

    return () => handlers.forEach(({ button, handler }) => button.removeEventListener("click", handler));
  }, []);

  // 하단 CTA 카운트다운
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-countdown]");
    if (!root) return;

    const endsAt = new Date(deadline).getTime();
    if (Number.isNaN(endsAt)) return;

    const slots = {
      d: root.querySelector<HTMLElement>("[data-cd-d]"),
      h: root.querySelector<HTMLElement>("[data-cd-h]"),
      m: root.querySelector<HTMLElement>("[data-cd-m]"),
      s: root.querySelector<HTMLElement>("[data-cd-s]"),
    };

    const tick = () => {
      const left = Math.max(0, endsAt - Date.now());
      const total = Math.floor(left / 1000);
      const value = {
        d: String(Math.floor(total / 86400)),
        h: String(Math.floor((total % 86400) / 3600)).padStart(2, "0"),
        m: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
        s: String(total % 60).padStart(2, "0"),
      };
      (Object.keys(slots) as (keyof typeof slots)[]).forEach((key) => {
        const slot = slots[key];
        if (!slot) return;
        // 각 자릿수를 개별 박스로 그립니다. 원본(main.js)과 동일하게
        // span.timer__box 를 써야 style.css의 박스 스타일이 적용됩니다.
        slot.replaceChildren(
          ...value[key].split("").map((digit) => {
            const box = document.createElement("span");
            box.className = "timer__box";
            box.textContent = digit;
            return box;
          }),
        );
      });
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return null;
}
