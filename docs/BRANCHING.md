# 브랜치 운영 — 디자인과 백엔드가 안 꼬이게

## 누가 어디서 작업하나

| 브랜치 | 담당 | 쓰임 | 배포 |
|---|---|---|---|
| `main` | KorhrdGroup | 배포되는 코드. 여기서 직접 작업하지 않습니다 | 푸시하면 배포 |
| `design` | **@jiuuucy** | 화면·마크업·CSS | 안 됨 |
| `backend` | KorhrdGroup | 서비스·DB·어드민 | 안 됨 |

```bash
git switch design      # 화면 작업
git switch backend     # 백엔드 작업
```

처음 받는 사람은 이렇게 시작합니다.

```bash
git clone https://github.com/KorhrdGroup/KorhrdLMS.git
cd KorhrdLMS && npm install
git switch design
```

`.env.local`은 저장소에 없습니다. 따로 받아서 프로젝트 루트에 두세요.

## 파일 경계 — 이것만 지키면 충돌이 거의 안 납니다

이 저장소는 이미 화면과 백엔드가 폴더로 갈려 있습니다.

**`design` 브랜치가 만지는 곳**

```
src/app/(korhrd)/**           학생 화면
src/features/korhrd/**        학생 화면 컴포넌트·데이터 스냅샷
src/features/course-detail/components/**   과정 상세 화면
public/korhrd/css/**          퍼블리싱 CSS (순서가 곧 규칙 — 손대지 말 것)
public/course-detail/**
```

**`backend` 브랜치가 만지는 곳**

```
src/features/<도메인>/services/**       조회·계산
src/features/<도메인>/repositories/**   Supabase 접근
src/features/<도메인>/actions/**        서버 액션
src/app/admin/**                        어드민 화면
src/lib/**                              공용 유틸·Supabase 클라이언트
supabase/migrations/**                  스키마 변경
```

## 유일하게 겹치는 자리: `(korhrd)/**/page.tsx`

학생 화면의 `page.tsx`는 **서버 컴포넌트**라 "데이터 조회 + 마크업"이 한 파일에
있습니다. 여기가 유일한 충돌 지점입니다. 규칙은 하나입니다.

> `page.tsx`에서 데이터 조회는 **서비스 함수 호출 한 줄**로 끝냅니다.
> 조회 로직(쿼리·계산·가공)을 화면 파일에 쓰지 않습니다.

- `backend`는 서비스 안쪽만 고칩니다. 반환 타입을 바꿔 호출부를 고쳐야 하면
  **그 한 줄만** 고치고 마크업은 건드리지 않습니다.
- `design`은 마크업만 고칩니다. 값이 더 필요하면 서비스에 요청하거나,
  임시로 화면에서 계산하지 말고 백엔드 쪽에 항목 추가를 남깁니다.

같은 파일이라도 위(조회)와 아래(마크업)가 갈려 있으면 git이 대부분 자동으로 합칩니다.

## 자동 생성 파일

`src/types/database.types.ts`는 Supabase에서 생성한 파일입니다. 충돌이 나면
고르지 말고 **다시 생성**해서 덮으세요.

## 합치는 순서 — Pull Request로

두 사람이 쓰므로 `main`에 바로 합치지 않고 PR로 올립니다. 무엇이 바뀌는지
서로 보고 넘어가는 것이 목적입니다.

```bash
# 1) 작업 브랜치에서 main의 최신을 먼저 받습니다 (충돌을 여기서 해결)
git switch design
git fetch origin
git rebase origin/main
git push --force-with-lease     # rebase 뒤에는 이 옵션으로만 밀어주세요

# 2) PR 올리기
gh pr create --base main --head design --title "화면: ○○"
```

PR이 열리면 `.github/CODEOWNERS`에 따라 담당자에게 자동으로 리뷰가 갑니다.
합치는 것(merge)과 배포는 KorhrdGroup이 합니다.

`--force-with-lease`를 쓰는 이유: rebase는 커밋을 다시 쓰기 때문에 그냥 push가
거절됩니다. 그렇다고 `--force`를 쓰면 상대가 그 사이 올린 커밋을 지울 수 있습니다.
`--force-with-lease`는 그런 경우 거절해 줍니다.

**하루 한 번은 `rebase origin/main`을 하세요.** 오래 떨어져 있을수록 충돌이 커집니다.

## 주의

- 마이그레이션(`supabase/migrations/`)은 `backend`에서만 만듭니다.
  파일명이 시간순이라 양쪽에서 만들면 순서가 꼬입니다.
- `public/korhrd/css/`는 전달본과 바이트 단위로 같아야 합니다.
  CSS를 고치는 대신 화면 마크업을 원본 클래스에 맞추세요.
- 배포는 `main` 푸시입니다. 작업 브랜치를 푸시해도 배포되지 않습니다.
