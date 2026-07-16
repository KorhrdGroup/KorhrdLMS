/**
 * 관리자 계정 생성 스크립트 (Supabase Authentication)
 *
 * auth.users에 이메일/비밀번호 계정을 만들고, 이메일 확인까지 완료 처리해
 * /admin/login에서 바로 로그인할 수 있게 합니다.
 *
 * 사용법: node scripts/create-admin.mjs <이메일> <비밀번호> [이름]
 */
import dotenv from "dotenv";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const [email, password, name = "관리자"] = process.argv.slice(2);
if (!email || !password) {
  console.error("사용법: node scripts/create-admin.mjs <이메일> <비밀번호> [이름]");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Supabase Auth 최소 비밀번호 길이는 6자입니다.");
  process.exit(1);
}

function buildPgConfig() {
  const u = new URL(process.env.DATABASE_URL);
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: "admin" } },
  });
  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      console.error(`이미 존재하는 계정입니다: ${email}`);
    } else {
      console.error(`계정 생성 실패: ${signUpError.message}`);
    }
    process.exit(1);
  }

  // 이메일 확인 메일 발송을 기다리지 않고 즉시 로그인 가능하도록 확인 처리
  const pgc = new pg.Client(buildPgConfig());
  await pgc.connect();
  await pgc.query(
    "update auth.users set email_confirmed_at = now() where email = $1 and email_confirmed_at is null",
    [email],
  );
  await pgc.end();

  // 로그인 검증
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error(`계정은 생성됐지만 로그인 검증 실패: ${signInError.message}`);
    process.exit(1);
  }

  console.log(`✅ 관리자 계정 생성 완료: ${email} (${name})`);
  console.log("   /admin/login 에서 바로 로그인할 수 있습니다.");
}

main().catch((e) => {
  console.error("실패:", e.message);
  process.exit(1);
});
