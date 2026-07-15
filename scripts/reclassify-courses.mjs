/**
 * 과정 분류 재정렬 스크립트 (공식 분류표 기준)
 *
 * 1) 신규 카테고리 5개 추가: 공예과정, 독서과정, IT과정, 반려과정, 내일배움과정
 * 2) 전체 과정을 공식 분류표대로 재분류 (category_id + category 텍스트 동시 갱신)
 * 3) 분류표에 있으나 DB에 없는 과정 3개 신규 등록(차시는 추후):
 *    안전관리사/안전교육지도사, 클레이아트지도사, 영어동화구연지도사
 * 4) 분류표에 명시된 주무관청으로 갱신(CSV 오타 교정: 질병관리부→질병관리청 등)
 *
 * 참고: courses는 과정당 카테고리 1개(단일 category_id)라, 분류표에 중복 게재된
 *   병원동행매니저(실버/돌봄·병원/건강), 베이비시터(아동/진로·병원/건강)는 먼저
 *   나온 분류를 적용한다.
 *
 * 사용법: node scripts/reclassify-courses.mjs [썸네일폴더]
 */
import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const thumbsDir = process.argv[2] ?? "/Users/korhrd/Downloads/korhrd_thumbnails";

const NEW_CATEGORIES = [
  { name: "공예과정", slug: "craft", sort: 120 },
  { name: "독서과정", slug: "reading", sort: 130 },
  { name: "IT과정", slug: "it-course", sort: 140 },
  { name: "반려과정", slug: "companion-animal", sort: 150 },
  { name: "내일배움과정", slug: "tomorrow-learning", sort: 160 },
];

// 과정명(정규화 전) → [카테고리명, 주무관청(분류표 기준, null이면 기존 유지)]
const CLASSIFICATION = {
  // 1. 실버/돌봄 과정
  간병사: ["실버/돌봄 과정", "보건복지부"],
  노인돌봄생활지원사: ["실버/돌봄 과정", "보건복지부"],
  도시농업전문가: ["실버/돌봄 과정", "농림축산식품부"],
  병원동행매니저: ["실버/돌봄 과정", "보건복지부"],
  생활지원사: ["실버/돌봄 과정", "보건복지부"],
  실버보드게임지도사: ["실버/돌봄 과정", "보건복지부"],
  실버인지활동지도사: ["실버/돌봄 과정", "문화체육관광부"],
  실버케어지도사: ["실버/돌봄 과정", "보건복지부"],
  은퇴설계전문가: ["실버/돌봄 과정", "보건복지부"],
  정원관리사: ["실버/돌봄 과정", "산림청"],
  // 2. 심리상담과정
  가족상담사: ["심리상담과정", "여성가족부"],
  노인심리상담사: ["심리상담과정", "보건복지부"],
  다문화심리상담사: ["심리상담과정", "보건복지부"],
  명리심리상담사: ["심리상담과정", "문화체육관광부"],
  미술심리상담사: ["심리상담과정", "보건복지부"],
  심리분석사1급: ["심리상담과정", "보건복지부"],
  심리상담사: ["심리상담과정", "보건복지부"],
  "아동미술심리상담사 & 아동미술지도사": ["심리상담과정", "보건복지부"],
  아동심리상담사: ["심리상담과정", "보건복지부"],
  타로심리상담사: ["심리상담과정", "보건복지부"],
  // 3. 아동/진로 과정
  동화구연지도사: ["아동/진로 과정", "교육부"],
  방과후돌봄교실지도사: ["아동/진로 과정", "교육부"],
  "방과후수학지도사&스토리텔링수학지도사": ["아동/진로 과정", "교육부"],
  방과후아동지도사: ["아동/진로 과정", null],
  방과후학교지도사: ["아동/진로 과정", "교육부"],
  베이비시터: ["아동/진로 과정", "여성가족부"],
  손유희지도사: ["아동/진로 과정", "교육부"],
  아동미술지도사: ["아동/진로 과정", "교육부"],
  아동요리지도사1급: ["아동/진로 과정", "농림축산식품부"],
  영어동화구연지도사: ["아동/진로 과정", "교육부"],
  인형극공연지도사: ["아동/진로 과정", "교육부"],
  초등돌봄전담사: ["아동/진로 과정", "교육부"],
  코딩지도사: ["아동/진로 과정", "교육부"],
  // 4. 강사과정
  ESG경영평가사: ["강사과정", "산업통상자원부"],
  ESG인증평가사: ["강사과정", "산업통상부"],
  데이터라벨러: ["강사과정", "과학기술정보통신부"],
  부동산권리분석사: ["강사과정", "국토교통부"],
  유튜브크리에이터: ["강사과정", "과학기술정보통신부"],
  집합건물관리사: ["강사과정", "법무부"],
  클레이아트지도사: ["강사과정", "문화체육관광부"],
  // 5. 병원/건강 과정
  병원원무행정전문가: ["병원/건강 과정", "보건복지부"],
  병원코디네이터1급: ["병원/건강 과정", "보건복지부"],
  산모신생아건강관리사: ["병원/건강 과정", "보건복지부"],
  산후관리사: ["병원/건강 과정", "보건복지부"],
  운동처방전문가: ["병원/건강 과정", "문화체육관광부"],
  // 6. 안전 전문가
  "안전관리사/안전교육지도사": ["안전 전문가", "행정안전부"],
  학교안전지도사: ["안전 전문가", "교육부"],
  학교폭력예방상담사: ["안전 전문가", "교육부"],
  // 7. 뷰티/강사 과정
  네일아트코디네이터: ["뷰티/강사 과정", "보건복지부"],
  메이크업코디네이터: ["뷰티/강사 과정", "보건복지부"],
  "조향사[향수디자이너]": ["뷰티/강사 과정", "식품의약품안전처"],
  피부미용코디네이터: ["뷰티/강사 과정", "보건복지부"],
  헤어코디네이터: ["뷰티/강사 과정", "보건복지부"],
  // 8. 진로/사회복지
  부모교육상담사: ["진로/사회복지", "여성가족부"],
  자기주도학습지도사: ["진로/사회복지", "교육부"],
  자원봉사지도사1급: ["진로/사회복지", "행정안전부"],
  지역아동교육지도사1급: ["진로/사회복지", "교육부"],
  "진로적성상담사 & 진로직업상담사": ["진로/사회복지", "교육부·고용노동부"],
  // 9. 커피과정
  바리스타: ["커피과정", "농림축산식품부"],
  // 10. 환경전문가
  방역관리사: ["환경전문가", "질병관리청"],
  영농형태양광전문가: ["환경전문가", "농림축산식품부"],
  자원순환관리사: ["환경전문가", "환경부"],
  환경관리전문가: ["환경전문가", "환경부"],
  // 11. 마케팅과정
  SNS마케팅전문가: ["마케팅과정", "과학기술정보통신부"],
  마케팅기획전문가: ["마케팅과정", "중소기업벤처부"],
  // 12. 공예과정
  "아동공예지도자 [8종 공예과정]": ["공예과정", "교육부"],
  종이접기지도사: ["공예과정", "문화체육관광부"],
  // 13. 독서과정
  독서논술지도사1급: ["독서과정", "교육부"],
  독서심리상담사: ["독서과정", "보건복지부"],
  독서지도사: ["독서과정", "교육부"],
  // 14. IT과정
  디지털리터러시지도사: ["IT과정", "과학기술정보통신부"],
  디지털중독예방지도사: ["IT과정", "과학기술정보통신부"],
  // 15. 반려과정
  반려동물관리사: ["반려과정", "농림축산식품부"],
  반려동물행동상담지도사: ["반려과정", "농림축산식품부"],
};

// DB에 없어 신규 등록할 과정 (차시는 추후 등록)
const NEW_COURSES = [
  { name: "안전관리사/안전교육지도사", professor: "이민태 교수", thumbStem: "안전관리사_안전교육지도사" },
  { name: "클레이아트지도사", professor: "성은하 교수", thumbStem: "클레이아트지도사" },
  { name: "영어동화구연지도사", professor: "이화정 교수", thumbStem: "영어동화구연지도사" },
];

function norm(s) {
  return s
    .normalize("NFC")
    .replace(/[\s()[\]/·,&_]/g, "")
    .toLowerCase();
}

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
  const client = new pg.Client(buildPgConfig());
  await client.connect();
  await client.query("BEGIN");
  try {
    // 1. 신규 카테고리 추가 (이미 있으면 건너뜀)
    for (const cat of NEW_CATEGORIES) {
      await client.query(
        `INSERT INTO public.course_categories (name, slug, sort_order, is_active)
         SELECT $1, $2, $3, true
         WHERE NOT EXISTS (SELECT 1 FROM public.course_categories WHERE name = $1)`,
        [cat.name, cat.slug, cat.sort],
      );
    }
    const { rows: catRows } = await client.query(
      "select id, name from public.course_categories",
    );
    const catByName = new Map(catRows.map((r) => [r.name, r.id]));

    // 2. 분류표 키를 정규화해 기존 과정과 매칭 후 재분류
    const normalizedPlan = new Map(); // norm(name) → { category, agency, rawName }
    for (const [rawName, [category, agency]] of Object.entries(CLASSIFICATION)) {
      normalizedPlan.set(norm(rawName), { category, agency, rawName });
    }

    const { rows: courseRows } = await client.query(
      "select id, name from public.courses where deleted_at is null",
    );
    let updated = 0;
    const missing = [];
    for (const course of courseRows) {
      const plan = normalizedPlan.get(norm(course.name));
      if (!plan) {
        missing.push(course.name);
        continue;
      }
      const catId = catByName.get(plan.category);
      if (!catId) throw new Error(`카테고리를 찾을 수 없음: ${plan.category}`);
      await client.query(
        `UPDATE public.courses
         SET category_id = $1, category = $2,
             supervising_agency = COALESCE($3, supervising_agency),
             updated_at = now()
         WHERE id = $4`,
        [catId, plan.category, plan.agency, course.id],
      );
      updated++;
    }
    if (missing.length) console.log("⚠️ 분류표에 없는 DB 과정(분류 유지):", missing.join(", "));

    // 3. DB에 없는 과정 신규 등록 (+썸네일 업로드, 빈 강의 컨테이너)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    const files = fs.existsSync(thumbsDir) ? fs.readdirSync(thumbsDir) : [];
    const fileByStem = new Map(
      files.map((f) => [norm(path.basename(f, path.extname(f))), f]),
    );
    const { rows: maxCode } = await client.query(
      `select max(code) as max from public.courses where code like 'CRS-KH-%'`,
    );
    let nextNum = Number((maxCode[0].max ?? "CRS-KH-0000").slice(-4)) + 1;

    for (const nc of NEW_COURSES) {
      const exists = courseRows.some((r) => norm(r.name) === norm(nc.name));
      if (exists) {
        console.log(`  · ${nc.name} — 이미 존재, 건너뜀`);
        continue;
      }
      const plan = normalizedPlan.get(norm(nc.name));
      const catId = catByName.get(plan.category);
      const code = `CRS-KH-${String(nextNum++).padStart(4, "0")}`;

      let thumbnailUrl = null;
      const thumbFile = fileByStem.get(norm(nc.thumbStem));
      if (thumbFile) {
        const ext = path.extname(thumbFile).toLowerCase().replace("jpeg", "jpg");
        const objectPath = `import/${code}${ext}`;
        const body = fs.readFileSync(path.join(thumbsDir, thumbFile));
        const { error } = await supabase.storage
          .from("course-thumbnails")
          .upload(objectPath, body, { contentType: "image/jpeg", upsert: true });
        if (error) throw new Error(`썸네일 업로드 실패(${nc.name}): ${error.message}`);
        thumbnailUrl = supabase.storage.from("course-thumbnails").getPublicUrl(objectPath).data.publicUrl;
      } else {
        console.log(`  ⚠️ ${nc.name} 썸네일 파일 없음`);
      }

      const { rows: inserted } = await client.query(
        `INSERT INTO public.courses
           (code, name, category, category_id, description, status,
            price, regular_price, display_price, is_free_course,
            study_method, lecture_time, supervising_agency, professor_name, thumbnail_url)
         VALUES ($1,$2,$3,$4,'',
                 'active',0,300000,0,true,'온라인 강의','전체 약 20시간',$5,$6,$7)
         RETURNING id`,
        [code, nc.name, plan.category, catId, plan.agency, nc.professor, thumbnailUrl],
      );
      await client.query(
        `INSERT INTO public.course_lectures (course_id, title, description, is_published)
         VALUES ($1, $2, '', true)`,
        [inserted[0].id, nc.name],
      );
      console.log(`  + 신규 등록: ${nc.name} (${plan.category})`);
    }

    await client.query("COMMIT");
    console.log(`재분류 완료: ${updated}개 과정 갱신`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }

  // 4. 검증: 카테고리별 과정 수
  const { rows: dist } = await client.query(`
    select coalesce(cc.name,'(미분류)') as category, cc.sort_order, count(c.id) as courses
    from public.course_categories cc
    left join public.courses c on c.category_id = cc.id and c.deleted_at is null
    where cc.is_active
    group by cc.name, cc.sort_order
    order by cc.sort_order
  `);
  console.log("=== 카테고리별 과정 수 ===");
  dist.forEach((r) => console.log(`  ${r.category}: ${r.courses}개`));
  const { rows: total } = await client.query(
    "select count(*) as n from public.courses where deleted_at is null",
  );
  console.log(`총 과정: ${total[0].n}개`);
  await client.end();
}

main().catch((e) => {
  console.error("실패:", e.message);
  process.exit(1);
});
