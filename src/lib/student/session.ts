export const STUDENT_SESSION_COOKIE = "student_session";
export const SAVED_LOGIN_ID_KEY = "hanpyeong_saved_login_id";

export type StudentSession = {
  memberId: string;
  loginId: string;
  name: string;
};
