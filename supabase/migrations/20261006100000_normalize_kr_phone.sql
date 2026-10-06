-- 휴대폰 번호 표기 통일 — "01012341234" 와 "010-1234-1234" 가 섞여 있어 엑셀·목록에서 제각각이었다
-- (2026-10-06 요청). 저장할 때 항상 하이픈 형식으로 바꾸는 트리거를 달고, 기존 값도 한 번 정리한다.
--
-- 번호로 회원을 찾는 코드(계정 찾기·소셜 로그인 연결·중복가입·오피스 자동발급)와 알림톡 발송은
-- 모두 숫자만 뽑아 비교/전송하므로 표기를 바꿔도 동작은 같다.
-- 숫자가 9~11자리가 아니거나 0 으로 시작하지 않는 값(잘못 들어간 값)은 손대지 않는다.

CREATE OR REPLACE FUNCTION public.format_kr_phone(raw text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d text := regexp_replace(coalesce(raw, ''), '\D', '', 'g');
BEGIN
  IF raw IS NULL OR btrim(raw) = '' THEN
    RETURN raw;
  END IF;
  IF left(d, 1) <> '0' THEN
    RETURN raw;
  END IF;
  IF left(d, 2) = '02' THEN
    IF length(d) = 10 THEN RETURN substr(d,1,2) || '-' || substr(d,3,4) || '-' || substr(d,7,4); END IF;
    IF length(d) = 9  THEN RETURN substr(d,1,2) || '-' || substr(d,3,3) || '-' || substr(d,6,4); END IF;
    RETURN raw;
  END IF;
  IF length(d) = 11 THEN RETURN substr(d,1,3) || '-' || substr(d,4,4) || '-' || substr(d,8,4); END IF;
  IF length(d) = 10 THEN RETURN substr(d,1,3) || '-' || substr(d,4,3) || '-' || substr(d,7,4); END IF;
  RETURN raw;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_phone_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.phone := public.format_kr_phone(NEW.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS members_normalize_phone ON public.members;
CREATE TRIGGER members_normalize_phone
  BEFORE INSERT OR UPDATE OF phone ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_column();

DROP TRIGGER IF EXISTS certificate_applications_normalize_phone ON public.certificate_applications;
CREATE TRIGGER certificate_applications_normalize_phone
  BEFORE INSERT OR UPDATE OF phone ON public.certificate_applications
  FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_column();

-- 기존 값 정리 (바뀌는 행만)
UPDATE public.members
   SET phone = public.format_kr_phone(phone)
 WHERE phone IS NOT NULL AND phone IS DISTINCT FROM public.format_kr_phone(phone);

UPDATE public.certificate_applications
   SET phone = public.format_kr_phone(phone)
 WHERE phone IS NOT NULL AND phone IS DISTINCT FROM public.format_kr_phone(phone);
