-- 자격증 발급비 PayApp 결제 연동
--
-- PayApp은 결제요청마다 mul_no(결제요청번호)를 돌려주고, 결제 결과를 feedbackurl로
-- 통보합니다. 통보는 재시도(checkretry=y)로 같은 건이 여러 번 올 수 있어,
-- mul_no를 유일키로 두고 중복 반영을 막습니다.
--
-- payment_status(unpaid/paid/…)는 이미 있으므로 그대로 쓰고, 여기서는 대사(정산 확인)에
-- 필요한 결제요청번호와 결제완료 시각만 더합니다.

alter table public.certificate_applications
  add column if not exists payapp_mul_no text,
  add column if not exists paid_at timestamptz;

comment on column public.certificate_applications.payapp_mul_no is
  'PayApp 결제요청번호(mul_no). 결제결과 통보를 신청 건에 연결하고 중복 반영을 막는 데 씁니다.';
comment on column public.certificate_applications.paid_at is
  'PayApp 결제완료(pay_state=4) 통보를 받은 시각.';

-- 같은 mul_no로 두 신청 건이 갱신되는 일이 없도록 유일 인덱스를 겁니다.
create unique index if not exists certificate_applications_payapp_mul_no_key
  on public.certificate_applications (payapp_mul_no)
  where payapp_mul_no is not null;
