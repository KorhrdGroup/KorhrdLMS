---
name: hps-design
description: >
  Use when creating or designing ANY new UI in this project — new pages, components,
  buttons, cards, modals, tables, forms, admin screens. Applies the HPS Design System
  (Toss-blue) so all new work is visually consistent. Triggers: 디자인, 화면, 페이지 만들기,
  컴포넌트, 버튼, 카드, 모달, UI, new screen, new component, design.
---

# HPS 디자인 시스템 적용 (신규 UI 전용)

**정본 문서를 먼저 읽어라: [docs/DESIGN_SYSTEM.md](../../../docs/DESIGN_SYSTEM.md)**
(원본은 한평생 오피스의 HPS Design System — 2026-08-26부터 이 LMS의 신규 UI 기준으로 채택됨)

## 적용 범위

- **새로 만드는 화면·컴포넌트에만 적용한다.** 기존 화면을 요청 없이 HPS로 리팩토링하지 않는다.
- 어드민 영역이 1순위 대상. 학생용 (korhrd) 라우트 그룹은 기존 korhrd 이식 디자인이 우선이며, 거기에 새 요소를 추가할 때만 HPS 값을 참고한다.

## 이 프로젝트에서의 어댑테이션 (중요)

이 저장소에는 오피스의 `--hps-*` 토큰과 `src/components/ui/`의 HPS 컴포넌트(Button 8-variant, FilterChip, Card, PageHeader)가 **아직 없다.** 따라서:

1. **색·크기 값은 문서의 값을 그대로 쓴다** — 브랜드 파랑 `#3182F6`(hover `#1B64DA`, subtle `#EBF3FE`), 텍스트 5티어(`#191F28`/`#4E5968`/`#6B7684`/`#8B95A1`/`#B0B8C1`), 배경 `#F2F4F6`, 보더 `#E5E8EB`, danger `#F04452`.
2. 이 저장소의 기존 전역 변수(`globals.css`의 `--primary` 등 shadcn 계열)가 이미 해당 역할을 하면 그 변수를 쓰고, 없으면 위 hex 값을 쓴다. 새 색을 임의로 발명하지 않는다.
3. radius: 기본 8px(버튼·인풋), 카드 12px, 뱃지 6px, pill 9999px.
4. 타이포: 본문 13px, 버튼 14px, 페이지 제목 24px/700. 굵기는 400/500/600/700만 (800 금지).
5. 컨트롤 높이: 버튼·인풋·셀렉트 기본 36px (sm 32 / lg 44).
6. 같은 역할의 토큰·컴포넌트가 이 저장소에 나중에 생기면 그것을 우선 사용한다.

## 핵심 원칙 (문서 요약)

- 파랑은 `#3182F6` 하나. primary(파랑 채움) 버튼은 화면당 1개.
- 버튼 위계: primary > outline > soft > secondary(기본) > ghost / 위험: danger > dangerSoft > dangerOutline.
- 삭제·반려는 hover에서만이 아니라 **평상시에도 danger 계열로 상시 구분** (터치 기기에 hover 없음).
- 상태색 페어: success `#22C55E`/`#E7F9EF`, danger `#F04452`/`#FEECEE`, warning `#FFB020`/`#FFF6E5`, info `#3182F6`/`#EBF3FE`.
- 카드 2티어: 외곽 카드(보더+흰 배경) 12px, 내부 박스 8px.
- 인라인 `style={{}}` 금지 (동적 값 제외).

## 신규 화면 체크리스트

- [ ] 색·radius·크기·간격이 위 HPS 값을 따르는가
- [ ] primary 버튼이 화면에 1개인가
- [ ] 삭제·반려가 danger 계열로 상시 구분되는가
- [ ] 페이지 제목이 24px/700인가
- [ ] 컨트롤 높이가 36px 기준인가
- [ ] 임의의 새 색상을 발명하지 않았는가
