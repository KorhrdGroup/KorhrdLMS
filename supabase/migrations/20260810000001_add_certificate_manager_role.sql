-- 자격증 신청 전용 어드민 역할 추가
ALTER TYPE admin_type ADD VALUE IF NOT EXISTS 'certificate_manager';
