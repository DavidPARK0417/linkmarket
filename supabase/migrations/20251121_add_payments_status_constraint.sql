-- payments.status CHECK 제약조건 추가
-- 2025-11-21: 누락된 status 제약조건 추가

-- 주석 업데이트
COMMENT ON COLUMN "payments"."status" IS 'pending(대기), paid(완료), failed(실패), cancelled(취소), refunded(환불)';

-- status CHECK 제약조건 추가
ALTER TABLE "payments" 
ADD CONSTRAINT chk_payments_status 
CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded'));

