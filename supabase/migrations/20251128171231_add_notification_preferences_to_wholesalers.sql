-- ============================================
-- wholesalers 테이블에 notification_preferences 필드 추가
-- ============================================
-- 
-- 목적: 도매점 알림 설정 저장 (JSON 형식)
-- 
-- 추가 필드:
-- - notification_preferences: JSONB 타입의 알림 설정
--   - new_order: 새 주문 알림 (email, push)
--   - settlement_completed: 정산 완료 알림 (email, push)
--   - inquiry_answered: 문의 답변 알림 (email, push)
-- 
-- 기본값:
-- {
--   "new_order": { "email": true, "push": true },
--   "settlement_completed": { "email": true, "push": false },
--   "inquiry_answered": { "email": true, "push": true }
-- }
-- ============================================

-- notification_preferences 필드 추가
ALTER TABLE public.wholesalers
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "new_order": { "email": true, "push": true },
  "settlement_completed": { "email": true, "push": false },
  "inquiry_answered": { "email": true, "push": true }
}'::jsonb;

COMMENT ON COLUMN public.wholesalers.notification_preferences IS 
  '알림 설정 (JSON 형식). 새 주문, 정산 완료, 문의 답변 알림의 이메일/푸시 설정을 포함합니다.';

