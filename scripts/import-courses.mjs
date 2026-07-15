/**
 * 과정/차시/썸네일 일괄 임포트 스크립트
 *
 * 입력:
 *   - CSV(long 포맷: 차시당 1행): 과정명, 썸네일, 담당교수, 강의형태, 수업방식, 강의시간,
 *     수강료, 자격증발급비, 민간자격등록번호, 주무관청, 자격관리기관, ..., 강번호, 강의제목
 *   - 썸네일 폴더: {과정명}.jpg (macOS NFD 파일명 → NFC 정규화 후 매칭)
 *
 * 동작:
 *   1) 기존 courses 및 종속 데이터 전체 삭제(하드 삭제, --keep 옵션 없음. 사용자 승인 하에 실행)
 *   2) 썸네일을 Supabase Storage course-thumbnails 버킷에 업로드(공개 URL 획득)
 *   3) courses(71) → course_lectures(과정당 1개) → lecture_sessions(차시) 순서로 삽입
 *
 * 사용법: node scripts/import-courses.mjs <csv경로> <썸네일폴더>
 */
import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const [csvPath, thumbsDir] = process.argv.slice(2);
if (!csvPath || !thumbsDir) {
  console.error("사용법: node scripts/import-courses.mjs <csv경로> <썸네일폴더>");
  process.exit(1);
}

// ---------- CSV 파싱 (따옴표 필드 지원) ----------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((v) => v.length > 0)) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((v) => v.length > 0)) rows.push(row);
  }
  return rows;
}

// ---------- 과정명 ↔ 썸네일 매칭용 정규화 ----------
function norm(s) {
  return s
    .normalize("NFC")
    .replace(/[\s()[\]/·,&_]/g, "")
    .toLowerCase();
}

// ---------- 과정 → 카테고리 매핑 (slug 기준) ----------
const CATEGORY_BY_COURSE = {
  ESG경영평가사: "environment-expert",
  ESG인증평가사: "environment-expert",
  도시농업전문가: "environment-expert",
  영농형태양광전문가: "environment-expert",
  자원순환관리사: "environment-expert",
  정원관리사: "environment-expert",
  환경관리전문가: "environment-expert",
  SNS마케팅전문가: "marketing",
  마케팅기획전문가: "marketing",
  유튜브크리에이터: "marketing",
  가족상담사: "psychology-counseling",
  노인심리상담사: "psychology-counseling",
  다문화심리상담사: "psychology-counseling",
  독서심리상담사: "psychology-counseling",
  명리심리상담사: "psychology-counseling",
  미술심리상담사: "psychology-counseling",
  부모교육상담사: "psychology-counseling",
  심리분석사1급: "psychology-counseling",
  심리상담사: "psychology-counseling",
  아동심리상담사: "psychology-counseling",
  타로심리상담사: "psychology-counseling",
  학교폭력예방상담사: "psychology-counseling",
  "아동미술심리상담사 & 아동미술지도사": "psychology-counseling",
  간병사: "silver-care",
  노인돌봄생활지원사: "silver-care",
  방과후돌봄교실지도사: "silver-care",
  베이비시터: "silver-care",
  산모신생아건강관리사: "silver-care",
  산후관리사: "silver-care",
  생활지원사: "silver-care",
  실버보드게임지도사: "silver-care",
  실버인지활동지도사: "silver-care",
  실버케어지도사: "silver-care",
  초등돌봄전담사: "silver-care",
  독서논술지도사1급: "child-career",
  독서지도사: "child-career",
  동화구연지도사: "child-career",
  디지털리터러시지도사: "child-career",
  디지털중독예방지도사: "child-career",
  "방과후수학지도사&스토리텔링수학지도사": "child-career",
  방과후아동지도사: "child-career",
  방과후학교지도사: "child-career",
  손유희지도사: "child-career",
  "아동공예지도자 [8종 공예과정]": "child-career",
  아동미술지도사: "child-career",
  아동요리지도사1급: "child-career",
  인형극공연지도사: "child-career",
  자기주도학습지도사: "child-career",
  종이접기지도사: "child-career",
  지역아동교육지도사1급: "child-career",
  코딩지도사: "child-career",
  병원동행매니저: "hospital-health",
  병원원무행정전문가: "hospital-health",
  병원코디네이터1급: "hospital-health",
  운동처방전문가: "hospital-health",
  방역관리사: "safety-expert",
  학교안전지도사: "safety-expert",
  네일아트코디네이터: "beauty-instructor",
  메이크업코디네이터: "beauty-instructor",
  피부미용코디네이터: "beauty-instructor",
  헤어코디네이터: "beauty-instructor",
  "조향사[향수디자이너]": "beauty-instructor",
  바리스타: "coffee",
  데이터라벨러: "career-welfare",
  반려동물관리사: "career-welfare",
  반려동물행동상담지도사: "career-welfare",
  부동산권리분석사: "career-welfare",
  은퇴설계전문가: "career-welfare",
  자원봉사지도사1급: "career-welfare",
  "진로적성상담사 & 진로직업상담사": "career-welfare",
  집합건물관리사: "career-welfare",
};

function buildPgConfig() {
  const parsed = new URL(process.env.DATABASE_URL);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "") || "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

async function main() {
  // ---------- 1. CSV 로드 ----------
  const raw = fs.readFileSync(csvPath, "utf8").replace(/^﻿/, "");
  const [header, ...dataRows] = parseCsv(raw);
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const required = ["과정명", "담당교수", "강의형태", "수업방식", "강의시간", "주무관청", "강번호", "강의제목"];
  for (const col of required) {
    if (!(col in idx)) throw new Error(`CSV에 "${col}" 컬럼이 없습니다.`);
  }

  const courseMap = new Map();
  for (const r of dataRows) {
    const name = r[idx["과정명"]].normalize("NFC").trim();
    if (!courseMap.has(name)) {
      courseMap.set(name, {
        name,
        professor: r[idx["담당교수"]].trim(),
        lectureStyle: r[idx["강의형태"]].trim(),
        studyMethod: r[idx["수업방식"]].trim(),
        lectureTime: r[idx["강의시간"]].trim(),
        agency: r[idx["주무관청"]].trim(),
        certFee: (r[idx["자격증발급비"]] ?? "").trim(),
        certRegNo: (r[idx["민간자격등록번호"]] ?? "").trim(),
        certOrg: (r[idx["자격관리기관"]] ?? "").trim(),
        sessions: [],
      });
    }
    courseMap.get(name).sessions.push({
      order: Number(r[idx["강번호"]]),
      title: r[idx["강의제목"]].normalize("NFC").trim(),
    });
  }
  const courses = [...courseMap.values()];
  courses.forEach((c) => c.sessions.sort((a, b) => a.order - b.order));
  const totalSessions = courses.reduce((n, c) => n + c.sessions.length, 0);
  console.log(`CSV: 과정 ${courses.length}개, 차시 ${totalSessions}개`);

  // ---------- 2. 썸네일 매칭 ----------
  const files = fs.readdirSync(thumbsDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  const stemToFile = new Map(files.map((f) => [norm(path.basename(f, path.extname(f))), f]));
  let matchedCount = 0;
  for (const c of courses) {
    const key = norm(c.name);
    c.thumbFile = stemToFile.get(key) ?? null;
    if (!c.thumbFile) {
      for (const [stem, f] of stemToFile) {
        if (stem.includes(key) || key.includes(stem)) {
          c.thumbFile = f;
          break;
        }
      }
    }
    if (c.thumbFile) matchedCount++;
  }
  console.log(`썸네일 매칭: ${matchedCount}/${courses.length}`);
  const unmatched = courses.filter((c) => !c.thumbFile).map((c) => c.name);
  if (unmatched.length) console.log("  ⚠️ 썸네일 없는 과정:", unmatched.join(", "));

  // ---------- 3. 카테고리 조회 ----------
  const client = new pg.Client(buildPgConfig());
  await client.connect();
  const { rows: catRows } = await client.query(
    "select id, slug, name from public.course_categories where is_active",
  );
  const catBySlug = new Map(catRows.map((r) => [r.slug, r]));

  // ---------- 4. 썸네일 업로드 (Storage) ----------
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  courses.forEach((c, i) => {
    c.code = `CRS-KH-${String(i + 1).padStart(4, "0")}`;
  });
  console.log("썸네일 업로드 중...");
  for (const c of courses) {
    if (!c.thumbFile) continue;
    const ext = path.extname(c.thumbFile).toLowerCase().replace("jpeg", "jpg");
    const objectPath = `import/${c.code}${ext}`;
    const body = fs.readFileSync(path.join(thumbsDir, c.thumbFile));
    const { error } = await supabase.storage
      .from("course-thumbnails")
      .upload(objectPath, body, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`썸네일 업로드 실패(${c.name}): ${error.message}`);
    const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(objectPath);
    c.thumbnailUrl = data.publicUrl;
  }
  console.log("썸네일 업로드 완료");

  // ---------- 5. 기존 데이터 삭제 + 신규 삽입 (트랜잭션) ----------
  await client.query("BEGIN");
  try {
    // FK가 전부 NO ACTION이므로 자식 → 부모 순서로 삭제
    await client.query("DELETE FROM public.lecture_progress");
    await client.query("DELETE FROM public.lecture_sessions");
    await client.query("DELETE FROM public.course_lectures");
    await client.query("DELETE FROM public.exam_submissions");
    await client.query("DELETE FROM public.exam_questions");
    await client.query("DELETE FROM public.exams");
    await client.query("DELETE FROM public.assignments");
    await client.query("DELETE FROM public.learning_materials");
    await client.query("DELETE FROM public.completion_certificates");
    await client.query("DELETE FROM public.certificate_applications");
    await client.query("DELETE FROM public.certificate_prepayments");
    await client.query("DELETE FROM public.course_payments");
    await client.query("DELETE FROM public.enrollments");
    await client.query("DELETE FROM public.classes");
    await client.query("DELETE FROM public.courses");
    console.log("기존 과정/종속 데이터 삭제 완료");

    for (const c of courses) {
      const cat = catBySlug.get(CATEGORY_BY_COURSE[c.name]) ?? null;
      const descriptionLines = [
        c.lectureStyle,
        c.certRegNo ? `민간자격등록번호: ${c.certRegNo}` : null,
        c.certOrg ? `자격관리기관: ${c.certOrg}` : null,
        c.certFee ? `자격증 발급비: ${c.certFee}` : null,
      ].filter(Boolean);

      const { rows: courseRows } = await client.query(
        `INSERT INTO public.courses
           (code, name, category, category_id, description, status,
            price, regular_price, display_price, is_free_course,
            study_method, lecture_time, supervising_agency, professor_name, thumbnail_url)
         VALUES ($1,$2,$3,$4,$5,'active',0,300000,0,true,$6,$7,$8,$9,$10)
         RETURNING id`,
        [
          c.code,
          c.name,
          cat?.name ?? null,
          cat?.id ?? null,
          descriptionLines.join("\n"),
          c.studyMethod,
          c.lectureTime,
          c.agency,
          c.professor,
          c.thumbnailUrl ?? null,
        ],
      );
      const courseId = courseRows[0].id;

      const { rows: lectureRows } = await client.query(
        `INSERT INTO public.course_lectures (course_id, title, description, is_published)
         VALUES ($1,$2,$3,true) RETURNING id`,
        [courseId, c.name, c.lectureStyle],
      );
      const lectureId = lectureRows[0].id;

      const values = [];
      const params = [];
      c.sessions.forEach((s, i) => {
        params.push(lectureId, s.order, s.title);
        const base = i * 3;
        values.push(`($${base + 1},$${base + 2},$${base + 3})`);
      });
      await client.query(
        `INSERT INTO public.lecture_sessions (lecture_id, session_order, title)
         VALUES ${values.join(",")}`,
        params,
      );
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }

  // ---------- 6. 검증 ----------
  const { rows: verify } = await client.query(`
    select (select count(*) from public.courses) courses,
           (select count(*) from public.courses where thumbnail_url is not null) with_thumb,
           (select count(*) from public.courses where category_id is not null) with_category,
           (select count(*) from public.course_lectures) lectures,
           (select count(*) from public.lecture_sessions) sessions
  `);
  console.log("=== 임포트 결과 ===", JSON.stringify(verify[0]));
  await client.end();
}

main().catch((e) => {
  console.error("실패:", e.message);
  process.exit(1);
});
