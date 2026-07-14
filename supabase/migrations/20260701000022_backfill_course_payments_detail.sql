-- 샘플 결제 데이터 상세 필드 보강
UPDATE public.course_payments cp
SET
  payment_number = COALESCE(
    cp.payment_number,
    'PAY-' || TO_CHAR(cp.payment_date, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(cp.id::text, 1, 8))
  ),
  product_name = COALESCE(cp.product_name, course.name),
  deposit_bank = CASE cp.payment_method
    WHEN 'virtual_account' THEN COALESCE(cp.deposit_bank, '국민은행')
    WHEN 'bank_transfer' THEN COALESCE(cp.deposit_bank, '우리은행')
    WHEN 'cash' THEN COALESCE(cp.deposit_bank, '신한은행')
    ELSE cp.deposit_bank
  END,
  depositor_name = COALESCE(cp.depositor_name, member.name),
  virtual_account_number = CASE cp.payment_method
    WHEN 'virtual_account' THEN COALESCE(cp.virtual_account_number, '123-456-789012')
    ELSE cp.virtual_account_number
  END,
  class_start_date = COALESCE(cp.class_start_date, cp.payment_date),
  class_end_date = COALESCE(cp.class_end_date, cp.payment_date + INTERVAL '90 days'),
  shipping_address = COALESCE(cp.shipping_address, '서울특별시 강남구 테헤란로 123'),
  approved_at = CASE cp.status
    WHEN 'approved' THEN COALESCE(cp.approved_at, cp.created_at)
    ELSE cp.approved_at
  END
FROM public.members member,
     public.courses course
WHERE cp.member_id = member.id
  AND cp.course_id = course.id
  AND cp.deleted_at IS NULL;
