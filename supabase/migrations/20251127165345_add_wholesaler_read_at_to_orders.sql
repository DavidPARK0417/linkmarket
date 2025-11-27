-- ============================================
-- orders 테이블에 wholesaler_read_at 필드 추가
-- ============================================
-- 
-- 목적: 도매점의 주문 알림 읽음 상태 관리
-- 
-- 추가 필드:
-- - wholesaler_read_at: 도매점이 주문을 읽은 시간 (TIMESTAMPTZ, NULL 허용)
--   - NULL: 읽지 않음 (새 주문)
--   - 값 있음: 읽음 처리됨
-- 
-- 사용 시나리오:
-- 1. 새 주문 생성 시: wholesaler_read_at = NULL (읽지 않음)
-- 2. 헤더 알림 드롭다운 열 때: 모든 읽지 않은 주문의 wholesaler_read_at을 현재 시간으로 업데이트
-- 3. 읽지 않은 주문 개수 조회: wholesaler_read_at IS NULL인 주문 개수
-- ============================================

-- wholesaler_read_at 필드 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS wholesaler_read_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.wholesaler_read_at IS 
  '도매점이 주문을 읽은 시간 (NULL이면 읽지 않음, 값이 있으면 읽음 처리됨)';

-- 인덱스 추가 (읽지 않은 주문 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_wholesaler_read_at 
ON public.orders(wholesaler_id, wholesaler_read_at) 
WHERE wholesaler_read_at IS NULL;

COMMENT ON INDEX idx_orders_wholesaler_read_at IS 
  '도매점별 읽지 않은 주문 조회 성능 향상을 위한 인덱스';

