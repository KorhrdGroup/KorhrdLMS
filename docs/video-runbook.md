# 강의 영상 R2 이전 — 복귀 후 실행 순서

작성: 2026-07-23 (휴가 전 준비 완료)
담당자가 자리를 비우는 동안 업로드가 돌아가고, **복귀 후 아래 순서대로 실행**하면 끝납니다.

## 현재까지 완료된 것

- Cloudflare R2 버킷 `lms-video` 생성 (Asia-Pacific)
- rclone 설치·연결 완료 (remote 이름: `r2`)
- 428GB 업로드 **진행 중** (백그라운드, 약 10시간 소요)
- Public Development URL 발급: `https://pub-9a68f6a216c94dd887caa254f2dd4130.r2.dev`
- DB 정리 완료
  - 신규 과정 11개 등록 (CRS-KH-0075~0085, `status='hidden'`)
  - 차시 수 보정 3건 (독서지도사 24 / 안전관리사 15 / 클레이아트 20)
- 연결 스크립트 작성 완료 (`scripts/link-video-urls.mjs`)

---

## 1단계 — 업로드 완료 확인

```bash
rclone size r2:lms-video/
```

원본과 대조(누락 확인):

```bash
rclone check "/Users/korhrd/Desktop/한직훈" r2:lms-video/ --include "*.mp4" --include "*.mov" --one-way
```

- `0 differences found` → 2단계로
- 차이가 있으면 아래로 이어서 업로드 (이미 올라간 건 자동 skip)

```bash
caffeinate -i rclone copy "/Users/korhrd/Desktop/한직훈" r2:lms-video/ --include "*.mp4" --include "*.mov" --transfers 4 --s3-chunk-size 64M --progress
```

> 업로드가 중단된 채 방치됐어도 위 명령 한 번이면 이어서 진행됩니다.

## 2단계 — 연결 SQL 생성

```bash
node scripts/link-video-urls.mjs
```

`scripts/out/link-video-urls.sql` 이 생성됩니다 (UPDATE 약 1,706개).
콘솔에 "영상 수 ≠ DB 차시 수" 리포트가 같이 출력되니 확인하세요.

## 3단계 — SQL 실행

Supabase 대시보드 → SQL Editor → `scripts/out/link-video-urls.sql` 내용 붙여넣기 → Run.
`BEGIN; … COMMIT;` 으로 감싸져 있어 중간에 실패하면 전부 롤백됩니다.

확인:

```sql
SELECT COUNT(*) FROM lecture_sessions
WHERE video_url LIKE 'https://pub-9a68f6a216c94dd887caa254f2dd4130.r2.dev%';
```

## 4단계 — 재생 테스트

1. 어드민 → 과정관리 → 차시관리에서 URL이 들어갔는지 확인
2. 학생 계정으로 로그인 → 강의실 → 영상 재생
3. 진도(`lecture_progress`)가 저장되는지 확인

## 5단계 — 검토가 필요한 과정 6개

영상 수와 DB 차시 수가 다릅니다. **어느 쪽이 맞는지 확인 후 조정**하세요.

| 과정 | 영상 | DB 차시 | 원인 추정 |
|---|---|---|---|
| 유품정리사 (0083) | 21 | 41 | 하위 `유품정리사인트로전`(19) 제외함 → DB를 21로 줄일지 확인 |
| AI프롬프트엔지니어 (0075) | 18 | 35 | 하위 `AI프롬프트 엔지니어링 전문가`(17) 제외함 → 별개 강의인지 확인 |
| 음악심리상담사 (0084) | 20 | 26 | 하위 `자료/음악작업/1~6강`(6)은 작업본으로 판단해 제외 |
| 학교안전지도사 (0068) | 20 | 17 | 영상이 3개 더 많음 |
| 간병사 (0005) | 22 | 20 | 영상이 2개 더 많음 |
| 실버케어지도사 (0042) | 18 | 19 | 영상이 1개 부족 |

- 영상이 더 많은 경우: 초과분은 연결되지 않음 (앞에서부터 차시 수만큼만)
- 영상이 부족한 경우: 뒤쪽 차시는 `video_url` 이 빈 채로 남음

## 6단계 — 신규 과정 11개 공개 전환

`status='hidden'` 이라 학생에게 안 보입니다. 검수 후 공개하세요.

- 차시 제목 `1차시` → 실제 강의명으로 수정
- 가격·카테고리·교수명 입력
- 어드민에서 상태를 **공개(active)** 로 변경

대상: CRS-KH-0075 ~ 0085 (AI프롬프트엔지니어, 강아지산책전문가, 교통안전지도사,
동물병원코디네이터, 등하원보호사, 디지털튜터, 보험심사관리사, 세차관리사, 유품정리사,
음악심리상담사, 치과병원코디네이터)

## 7단계 (선택) — 커스텀 도메인 전환

`r2.dev` 는 속도 제한이 있고 CDN 캐싱이 안 되며, 영상 보호 기능(핫링크 차단·Signed URL)을
쓸 수 없습니다. 수강생이 늘기 전에 전환을 권장합니다.

1. Cloudflare에서 도메인 구매 (Registrar, 연 $10~12) — 네임서버 이전 불필요
2. R2 → `lms-video` → 설정 → Custom Domains → `+ Add`
3. 새 주소로 재생 테스트 후 아래 SQL 실행 (몇 초)

```sql
UPDATE lecture_sessions
SET video_url = replace(video_url,
  'https://pub-9a68f6a216c94dd887caa254f2dd4130.r2.dev',
  'https://video.<새도메인>')
WHERE video_url LIKE 'https://pub-9a68f6a216c94dd887caa254f2dd4130.r2.dev%';
```

4. 며칠 지켜본 뒤 r2.dev 비활성화

> r2.dev와 커스텀 도메인은 동시에 켜둘 수 있어 무중단 전환이 가능합니다.

## 8단계 (선택) — 중복본 정리

약 40GB 절감(월 600원 수준). 급하지 않습니다.

```bash
rclone purge "r2:lms-video/운동처방전문가_김창혁/강의영상/워터마크+인트로"
rclone purge "r2:lms-video/영농형태양광전문가/영농형작업"
rclone purge "r2:lms-video/인형극공연지도사/인형극공연_원본"
```

---

## 참고 문서

- 파일 선택 규칙: `docs/video-mapping-rules.md`
- 연결 스크립트: `scripts/link-video-urls.mjs`
- 과정 목록 스냅샷: `scripts/db-courses.json`
- 신규 과정 등록: `supabase/migrations/20260723000001_add_new_video_courses.sql`
- 차시 수 보정: `supabase/migrations/20260723000002_fix_lecture_session_counts.sql`
