INSERT INTO public.certificate_applications (
  member_id,
  certificate_kind,
  certificate_name,
  member_login_id,
  applicant_name,
  phone,
  postal_code,
  address,
  address_detail,
  photo_url,
  issuance_cost,
  actual_payment_amount,
  payment_method,
  payment_info,
  delivery_status,
  memo,
  applied_at
)
SELECT
  m.id,
  v.certificate_kind::public.certificate_kind,
  v.certificate_name,
  m.login_id,
  m.name,
  m.phone,
  '06236',
  '서울특별시 강남구 테헤란로 123',
  '4층 401호',
  v.photo_url,
  v.issuance_cost,
  v.actual_payment_amount,
  v.payment_method::public.payment_method,
  v.payment_info,
  v.delivery_status::public.certificate_delivery_status,
  v.memo,
  v.applied_at::date
FROM (
  VALUES
    (
      'hong001',
      'social_worker',
      '사회복지사 2급',
      '/photos/hong001.jpg',
      50000,
      45000,
      'card',
      '카드 승인 2026-06-15',
      'preparing',
      '증명사진 확인 완료',
      '2026-06-10'
    ),
    (
      'kim002',
      'child_care',
      '보육교사 2급',
      '/photos/kim002.jpg',
      45000,
      45000,
      'bank_transfer',
      '계좌이체 입금 확인',
      'shipped',
      NULL,
      '2026-06-20'
    ),
    (
      'lee003',
      'lifelong_educator',
      '평생교육사 2급',
      NULL,
      40000,
      0,
      'virtual_account',
      '가상계좌 입금 대기',
      'pending',
      '입금 확인 필요',
      '2026-06-25'
    ),
    (
      'choi005',
      'youth_instructor',
      '청소년지도사 3급',
      '/photos/choi005.jpg',
      55000,
      55000,
      'card',
      '카드 일시불',
      'delivered',
      '배송 완료',
      '2026-06-01'
    ),
    (
      'yoon008',
      'health_educator',
      '건강가정사',
      '/photos/yoon008.jpg',
      48000,
      48000,
      'mobile',
      '휴대폰 결제',
      'delivered',
      NULL,
      '2026-05-28'
    )
) AS v (
  login_id,
  certificate_kind,
  certificate_name,
  photo_url,
  issuance_cost,
  actual_payment_amount,
  payment_method,
  payment_info,
  delivery_status,
  memo,
  applied_at
)
INNER JOIN public.members m ON m.login_id = v.login_id
WHERE m.deleted_at IS NULL;
