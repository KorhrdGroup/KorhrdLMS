const PLACEHOLDER_PATTERNS = [
  "your-project",
  "your-anon-key",
  "your-project.supabase.co",
];

type EnvName = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

/**
 * 검증 로직만 담당합니다. `process.env[name]`처럼 동적으로 접근하면 브라우저
 * 번들에서는 Next.js가 NEXT_PUBLIC_* 값을 정적으로 치환하지 못해 항상
 * undefined가 되므로, 호출부(`getSupabaseEnv`)에서 반드시 `process.env.NEXT_PUBLIC_...`
 * 형태의 정적 리터럴로 값을 읽어 이 함수에 전달해야 합니다.
 */
function validateEnv(name: EnvName, raw: string | undefined) {
  const value = raw?.trim();

  if (!value) {
    throw new Error(
      `${name} is not set. Create .env.local in the project root and restart the dev server.`,
    );
  }

  const isPlaceholder = PLACEHOLDER_PATTERNS.some((pattern) =>
    value.includes(pattern),
  );

  if (isPlaceholder) {
    throw new Error(
      `${name} is still using the placeholder value. Update .env.local with your Supabase project credentials.`,
    );
  }

  if (name === "NEXT_PUBLIC_SUPABASE_URL") {
    try {
      const url = new URL(value);
      if (!url.hostname.endsWith(".supabase.co")) {
        throw new Error("invalid hostname");
      }
    } catch {
      throw new Error(
        `${name} must be a valid Supabase URL (e.g. https://xxxxx.supabase.co).`,
      );
    }
  }

  if (name === "NEXT_PUBLIC_SUPABASE_ANON_KEY" && value.length < 20) {
    throw new Error(
      `${name} looks invalid. Copy the anon public key from the Supabase dashboard.`,
    );
  }

  return value;
}

export function getSupabaseEnv() {
  return {
    url: validateEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: validateEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function hasSupabaseEnv() {
  try {
    getSupabaseEnv();
    return true;
  } catch {
    return false;
  }
}
