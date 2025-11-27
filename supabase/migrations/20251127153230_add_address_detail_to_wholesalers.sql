-- ============================================
-- wholesalers 테이블에 address_detail 필드 추가
-- ============================================
-- 
-- 목적: 도매점 상세주소 저장 (카카오 주소 API 통합)
-- 
-- 추가 필드:
-- - address_detail: 상세주소 (예: "101호", "2층", 선택사항)
-- 
-- 참고:
-- - address: 기본주소 (카카오 주소 API에서 가져온 주소)
-- - address_detail: 상세주소 (사용자가 직접 입력, 선택사항)
-- - 두 필드를 결합하여 전체 주소를 구성할 수 있음
-- ============================================

-- address_detail 필드 추가
ALTER TABLE public.wholesalers
ADD COLUMN IF NOT EXISTS address_detail TEXT;

COMMENT ON COLUMN public.wholesalers.address_detail IS 
  '상세주소 (예: 101호, 2층 등, 선택사항)';

