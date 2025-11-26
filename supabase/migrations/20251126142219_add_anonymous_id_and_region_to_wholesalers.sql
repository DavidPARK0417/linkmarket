-- ============================================
-- wholesalers 테이블에 anonymous_id, region 필드 추가
-- ============================================
-- 
-- 목적: 도매점 익명 식별자 및 지역 정보 추가
-- 
-- 추가 필드:
-- 1. anonymous_id: Partner #F2B-01 형식의 익명 ID
-- 2. region: 시/구 단위의 대략적 지역 정보
-- 
-- 참고:
-- - anonymous_id는 UNIQUE 제약조건 적용
-- - 두 필드 모두 NULL 허용 (기존 데이터 호환성)
-- ============================================

-- anonymous_id 필드 추가
ALTER TABLE public.wholesalers
ADD COLUMN IF NOT EXISTS anonymous_id TEXT UNIQUE;

COMMENT ON COLUMN public.wholesalers.anonymous_id IS 
  '익명 식별자 (Partner #F2B-01 형식)';

-- region 필드 추가
ALTER TABLE public.wholesalers
ADD COLUMN IF NOT EXISTS region TEXT;

COMMENT ON COLUMN public.wholesalers.region IS 
  '대략적 지역 정보 (시/구 단위)';

