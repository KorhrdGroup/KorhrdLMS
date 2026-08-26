# HPS Design System

한평생 오피스(KorhrdGroupDB)의 디자인 시스템 문서.
**정본(Single Source of Truth)은 코드**이며, 이 문서는 그 요약이다.

- 토큰: [`src/styles/tokens.css`](../src/styles/tokens.css)
- 컴포넌트: [`src/components/ui/`](../src/components/ui/)

---

## 1. 원칙

1. **토큰이 유일한 제어점** — 색·radius·크기·그림자는 `--hps-*` 토큰으로만 정의한다. 토큰 하나를 바꾸면 전 화면이 함께 바뀐다.
2. **하드코딩 금지** — 새 CSS에서 hex 색상, px radius/font-size를 직접 쓰지 않는다. (`border-radius: 8px` ❌ → `var(--hps-radius-md)` ✅)
3. **variant는 실제 스타일로** — 버튼·칩의 변형은 이름이 아니라 시각적 의미(강조 위계)로 고른다.
4. **파괴적 액션은 상시 구분** — 삭제/반려는 hover에서만이 아니라 평소에도 danger 계열로 보여야 한다 (터치 기기에는 hover가 없다).
5. **레거시 네임스페이스 신규 사용 금지** — `--color-*`(status 제외)·`--text-*`·`--radius-*`·`--space-*`·`--shadow-*`는 호환용 bridge alias다. 신규 코드는 `--hps-*`만 쓴다.

---

## 2. Foundation 토큰

### 2.1 Color

**Brand (Primary)** — 파랑은 `#3182F6` 하나로 통일되어 있다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--hps-blue` | `#3182F6` | 브랜드 파랑 (버튼·링크·활성) |
| `--hps-blue-hover` | `#1B64DA` | hover |
| `--hps-blue-subtle` | `#EBF3FE` | 옅은 파랑 배경 (soft 버튼·선택 칩) |
| `--hps-blue-subtle-hover` | `#DBEAFE` | soft hover |

> 차트·canvas·SVG처럼 `var()`를 못 쓰는 곳은 hex 리터럴 `#3182F6` / `#1B64DA`를 쓴다.

**Text (5티어)**

| 토큰 | 값 | 용도 |
|---|---|---|
| `--hps-text-primary` | `#191F28` | 제목·강조 |
| `--hps-text-body` | `#4E5968` | 본문 진한 회색 |
| `--hps-text-muted` | `#6B7684` | 중간 회색 |
| `--hps-text-secondary` | `#8B95A1` | 보조 |
| `--hps-text-tertiary` | `#B0B8C1` | 플레이스홀더 |

**Surface / Background**

| 토큰 | 값 | 용도 |
|---|---|---|
| `--hps-bg` | `#F2F4F6` | 페이지 바탕 |
| `--hps-bg-subtle` | `#F9FAFB` | 가장 옅은 서피스 |
| `--hps-card-bg` | `#FFFFFF` | 카드/서피스 |
| `--hps-hover-bg` | `rgba(0,0,0,0.04)` | hover 오버레이 |
| `--hps-table-head-bg` | `#F9FAFB` | 테이블 헤더 |

**Border (3단계)**

| 토큰 | 값 | 용도 |
|---|---|---|
| `--hps-border` | `#E5E8EB` | 기본 보더·divider |
| `--hps-border-subtle` | `#F2F4F6` | 옅은 구분선 |
| `--hps-border-hover` | `#D1D6DB` | 강조/hover 보더 |

**Status** — 상태색 + subtle 배경 페어.

| 상태 | 색 | subtle 배경 |
|---|---|---|
| success | `--color-success` `#22C55E` | `--color-success-subtle` `#E7F9EF` |
| danger | `--color-danger` `#F04452` (hover `#D93A48`) | `--color-danger-subtle` `#FEECEE` |
| warning | `--color-warning` `#FFB020` | `--color-warning-subtle` `#FFF6E5` |
| info | `--color-info` `#3182F6` | `--color-info-subtle` `#EBF3FE` |

### 2.2 Radius (6단계)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--hps-radius-xs` | 4px | 칩·작은 태그 |
| `--hps-radius-sm` | 6px | 뱃지 |
| `--hps-radius-md` | 8px | **기본** (버튼·인풋·내부 박스) |
| `--hps-radius-lg` | 12px | 큰 카드·모달 |
| `--hps-radius-xl` | 16px | 특대 컨테이너 |
| `--hps-radius-full` | 9999px | pill |

Semantic alias: `--hps-radius-badge`→sm, `--hps-radius-input`/`button`→md,
**`--hps-radius-card`→lg** — 모든 카드(`.card`, `<Card>`)의 단일 제어점.
원형은 토큰이 아니라 `border-radius: 50%`를 직접 쓴다.

**카드 2티어 규칙:** 외곽 카드(보더+흰 배경) = `lg`, 내부 박스 = `md`.

### 2.3 Typography (9단계, 13px 베이스)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--hps-text-xs` | 11px | 캡션·보조 |
| `--hps-text-sm` | 12px | 작은 본문·라벨 |
| `--hps-text-base` | 13px | **기본 본문** |
| `--hps-text-md` | 14px | 강조 본문·버튼 |
| `--hps-text-lg` | 16px | 소제목 |
| `--hps-text-xl` | 18px | 제목 |
| `--hps-text-2xl` | 20px | 큰 제목 |
| `--hps-text-3xl` | 24px | **페이지 제목** (PageHeader) |
| `--hps-text-4xl` | 32px | 히어로·숫자 강조 |

굵기: `400 / 500 / 600 / 700` 4단계 (`--font-normal`~`--font-bold`). 800 사용 금지.
반픽셀 크기(12.5px 등) 금지.

### 2.4 Spacing (px, 실사용 스케일)

`--hps-space-{2,4,6,8,10,12,14,16,20,24,32,40,48}` — 숫자가 곧 px 값.
padding·gap은 이 토큰만 사용. margin은 아직 토큰화 대상 아님(레이아웃성).
52px 초과 대형 스페이서는 직접 px 허용.

### 2.5 Shadow (elevation 5단계)

| 토큰 | 용도 |
|---|---|
| `--hps-shadow-card` | 카드 |
| `--hps-shadow-dropdown` | 드롭다운 |
| `--hps-shadow-modal` | 모달 |
| `--hps-shadow-primary` | 파랑 버튼 글로우 |
| `--hps-focus-ring` | `:focus-visible` 포커스 링 (`0 0 0 3px rgba(49,130,246,0.12)`) |

방향성 그림자(드로어)와 inset은 개별 정의 허용.

### 2.6 Layout / Control

| 토큰 | 값 |
|---|---|
| `--control-height-sm` | 32px |
| `--control-height` | 36px (버튼·인풋·셀렉트 공통 기준) |
| `--control-height-lg` | 44px |
| `--page-max` | 1200px |
| `--hps-nav-height` | 56px |
| `--hps-sidebar-width` | 190px |

---

## 3. 컴포넌트 (`src/components/ui/`)

### 3.1 `<Button>` — 8 variant × 3 size

```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary">저장하기</Button>
<Button variant="secondary" size="sm">취소</Button>
<Button variant="soft" fullWidth>가이드 모음</Button>
<Button variant="dangerOutline" leftIcon={<Trash2 size={14}/>}>선택 삭제</Button>
<Button iconOnly aria-label="닫기"><X size={16}/></Button>
```

**중립 계열 (강조 강한 순)**

| variant | 모양 | 용도 |
|---|---|---|
| `primary` | 파랑 채움 + 흰 글씨 | 화면의 주요 액션 — **화면당 1개 권장** |
| `outline` | 흰 배경 + 파랑 테두리 | primary 옆 보조 강조 (다운로드 등) |
| `soft` | 옅은 파랑 채움 | 파랑 약한 강조 (가이드 등) |
| `secondary` | 흰 배경 + 회색 보더 | **기본값.** 취소·닫기·목록 |
| `ghost` | 투명 + 회색 글씨 | 가장 약한 액션 (새로고침·툴바) |

**위험 계열**

| variant | 모양 | 용도 |
|---|---|---|
| `danger` | 빨강 채움 | 되돌릴 수 없는 확정 (영구 삭제) |
| `dangerSoft` | 연빨강 채움 | 목록/카드 안의 삭제·비활성화 |
| `dangerOutline` | 흰 배경 + 빨강 | 툴바 삭제 (중립 버튼과 나란히 놓일 때) |

**size**: `sm` 32px · `md` 36px(기본) · `lg` 44px
**props**: `leftIcon` `rightIcon` `iconOnly`(정사각) `fullWidth` + 표준 button 속성 전부
**내장**: focus-ring(`:focus-visible`) · disabled(opacity 0.5) · radius `--hps-radius-button`

**이관 규칙 (기존 버튼 → Button):**
- variant는 클래스명이 아니라 **실제 CSS 색**으로 판정한다.
- 원본 클래스가 순수 시각 스타일이면 → `<Button>`으로 완전 대체(className 없음).
- `width`/`margin`/`flex`/`position` 등 **레이아웃을 담으면** → 배치용 className을 분리한 뒤 이관 (예: approvals `.sidebarActionBtn`).
- **이관하지 않는 것**: 28px 이하 아이콘 글리프(최소 size와 충돌), 부모 `:hover`로 노출되는 버튼, 그라데이션·애니메이션 버튼, 탭·페이지네이션·토글칩·커스텀셀렉트, `<Link>`/`<a>`/`<label>`.

### 3.2 `<FilterChip>` — 토글 필터 칩

```tsx
import { FilterChip } from "@/components/ui/FilterChip";

<FilterChip selected={filter === "today"} onClick={() => setFilter("today")}>
  오늘 연락 예정 (3)
</FilterChip>
```

- 30px 토글 버튼. 미선택 = 흰 배경+보더+회색 / 선택 = 파랑 보더·글씨·옅은 배경.
- `aria-pressed` 자동, focus-ring 내장.
- Button과의 구분: **on/off 선택 상태가 있으면 FilterChip**, 단순 클릭 액션이면 Button.

### 3.3 `<Card>` — 카드 컨테이너

```tsx
import { Card } from "@/components/ui/Card";

<Card>기본 카드 (padding md=20px)</Card>
<Card as="section" padding="lg">섹션 카드</Card>
<Card flat padding="none">테두리 없는 내부 카드</Card>
```

- radius는 `--hps-radius-card`(12px) 상속 → 이 토큰 하나로 전 카드 제어.
- props: `as`(태그) · `padding`(none/sm/md/lg) · `flat`(보더·그림자 제거).
- 페이지의 `.card` 리터럴 클래스도 같은 토큰에 연결되어 있다.

### 3.4 `<PageHeader>` — 페이지 제목

```tsx
import { PageHeader } from "@/components/ui/PageHeader";

<PageHeader
  title="공지사항"
  subtitle="회사의 주요 소식을 확인하실 수 있습니다."
  icon={<Copy size={18}/>}
  badge={<span>61명</span>}
  actions={<Button variant="primary">+ 글쓰기</Button>}
/>
```

- 제목 `h1` **24px / 700** 고정 — 전 페이지 제목 통일의 단일 제어점.
- 슬롯: `subtitle` · `icon`(제목 앞) · `badge`(제목 옆) · `actions`(우측).
- 예외: 문서 편집기(계약서 write)처럼 h1이 문서 자체 제목인 화면은 대상 아님.

### 3.5 기타 기존 공유 컴포넌트

- `ui/Calendar` + `DateInput` — 단일/범위 날짜 필드 (폼용)
- `DateRangeCalendar` — 프리셋 있는 기간 선택 (필터/리포트용)
  - 규칙: 달력 하나 = `ui/Calendar`, 기간 선택 = `DateRangeCalendar`
- `ui/Skeleton` — TableSkeleton·StatsCardsSkeleton 등 로딩 상태
- `common/ConfirmDialog` — 확인 다이얼로그

---

## 4. 채택 현황 (2026-08 기준)

| 영역 | 상태 |
|---|---|
| 토큰 하드코딩 제거 | radius·font-size·shadow·padding/gap 하드코딩 0. 색상은 구조색(그레이·보더·배경·상태·파랑) 토큰화 완료, 롱테일(차트·일러스트)은 의도적 보존 |
| `<PageHeader>` | 37개 페이지 이관 완료 |
| `<Button>` | 271곳 / 69파일 이관 (batch 1~6) |
| `<FilterChip>` | 14파일 이관 |
| `<Card>` | 컴포넌트 준비 완료, 페이지 `.card`는 토큰 연결 상태 (점진 채택) |

## 5. 미결 사항 (설계 결정 대기)

- **me/attendance 액션 버튼** — near-black(`--hps-text-primary`) 채움으로 현 팔레트 밖. 파랑 통일 vs 전용 variant 결정 필요.
- **엑셀 다운로드 초록 버튼** — 엑셀=초록 관례. `success` variant 신설 여부.
- **레이아웃 보유 버튼** — `flex:1`/`width:100%` 버튼들은 배치 className 분리 후 이관 가능 (contracts/write 툴바, PhoneOtpGate 등).
- **margin 토큰화** — 1,000여 곳, 레이아웃 컴포넌트화와 함께 검토.
- **다크모드** — 현재 라이트 전용. `--hps-*` 다크 오버라이드는 별도 트랙.
- **Stylelint** — 하드코딩 재발 방지 린트 규칙 미도입 (머지로 새 하드코딩이 유입될 수 있음).

## 6. 신규 화면 체크리스트

- [ ] 색·radius·크기·그림자·간격은 `--hps-*` 토큰만 사용했는가
- [ ] 버튼은 `<Button>`, 토글 칩은 `<FilterChip>`인가
- [ ] 페이지 제목은 `<PageHeader>`인가
- [ ] 카드 radius는 `--hps-radius-card`(또는 `<Card>`)인가
- [ ] primary 버튼이 화면에 1개인가
- [ ] 삭제·반려가 danger 계열로 상시 구분되는가
- [ ] 인라인 `style={{}}`을 쓰지 않았는가 (동적 값 제외 — CLAUDE.md 규칙)
