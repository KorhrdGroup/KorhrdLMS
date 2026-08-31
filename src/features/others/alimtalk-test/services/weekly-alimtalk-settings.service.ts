import { createClient } from "@/lib/supabase/server";
import { todayInKst } from "@/lib/shared/kst-date";

/**
 * 주간 수강 독려 알림톡(60% 미만) 발송 설정.
 *
 * Vercel 크론(/api/cron/alimtalk-under60)은 매시간 돌고, 여기 저장된
 * 요일·시각(KST)과 맞는 시간에만 실제 발송합니다. last_sent_date 로
 * 같은 날 두 번 나가는 것을 막습니다 (크론 재시도·중복 호출 대비).
 */

export type WeeklyAlimtalkSettings = {
  enabled: boolean;
  /** 0=일요일 … 6=토요일 (JS getDay와 동일) */
  weekday: number;
  /** KST 기준 0~23시 */
  hour: number;
  lastSentDate: string | null;
};

export async function getWeeklyAlimtalkSettings(): Promise<WeeklyAlimtalkSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alimtalk_weekly_settings")
    .select("enabled, weekday, hour, last_sent_date")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { enabled: true, weekday: 1, hour: 10, lastSentDate: null };
  return {
    enabled: data.enabled,
    weekday: data.weekday,
    hour: data.hour,
    lastSentDate: data.last_sent_date,
  };
}

export async function updateWeeklyAlimtalkSettings(input: {
  enabled: boolean;
  weekday: number;
  hour: number;
}): Promise<{ success: boolean; message: string }> {
  if (!Number.isInteger(input.weekday) || input.weekday < 0 || input.weekday > 6) {
    return { success: false, message: "요일이 올바르지 않습니다." };
  }
  if (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23) {
    return { success: false, message: "시간이 올바르지 않습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("alimtalk_weekly_settings")
    .upsert({
      id: true,
      enabled: input.enabled,
      weekday: input.weekday,
      hour: input.hour,
      updated_at: new Date().toISOString(),
    });
  if (error) return { success: false, message: `저장에 실패했습니다: ${error.message}` };
  return { success: true, message: "주간 독려 발송 설정을 저장했습니다." };
}

/** 지금(KST)의 요일·시각 */
function nowInKst(): { weekday: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(new Date());
  const weekdayName = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekdayName);
  return { weekday: weekday === -1 ? 1 : weekday, hour };
}

/**
 * 크론에서 부릅니다 — 설정과 현재 시각(KST)이 맞고 오늘 아직 안 보냈으면
 * 오늘 날짜를 선점(update)하고 true 를 반환합니다. 선점에 실패하면(이미 발송)
 * false 를 반환해 중복 발송을 막습니다.
 */
export async function claimWeeklyAlimtalkSend(): Promise<
  { send: true } | { send: false; reason: string }
> {
  const settings = await getWeeklyAlimtalkSettings();
  if (!settings.enabled) return { send: false, reason: "발송 꺼짐" };

  const now = nowInKst();
  if (now.weekday !== settings.weekday || now.hour !== settings.hour) {
    return { send: false, reason: `설정 시각 아님 (설정 요일 ${settings.weekday}·${settings.hour}시, 현재 ${now.weekday}·${now.hour}시)` };
  }

  const today = todayInKst();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("alimtalk_weekly_settings")
    .update({ last_sent_date: today })
    .eq("id", true)
    .or(`last_sent_date.is.null,last_sent_date.neq.${today}`)
    .select("id")
    .maybeSingle();
  if (error) return { send: false, reason: `마커 선점 실패: ${error.message}` };
  if (!data) return { send: false, reason: "오늘 이미 발송됨" };
  return { send: true };
}
