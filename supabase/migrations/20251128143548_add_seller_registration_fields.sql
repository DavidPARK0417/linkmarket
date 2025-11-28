-- ============================================
-- 입점 셀러 등록 관련 필드 추가
-- ============================================
-- 
-- 목적: 도매자를 "입점 셀러"로 등록하기 위한 필드 추가
-- 
-- 법적 요구사항:
-- - 전자상거래법상 판매자 정보 명시 필수
-- - 플랫폼과 도매자 간 책임 분리 명확화
-- 
-- 기능 요구사항:
-- - 토스 Payments 정산 기능 사용을 위한 가맹점 등록
-- - 입점 계약서 업로드 및 관리
-- - 약관 동의 기록
-- 
-- 구현 시점: Phase 2 (Week 8 이후 또는 실제 서비스 전)
-- ============================================

-- 입점 셀러 약관 동의 시각
ALTER TABLE wholesalers 
ADD COLUMN seller_terms_agreed_at TIMESTAMPTZ;

COMMENT ON COLUMN wholesalers.seller_terms_agreed_at IS 
  '입점 셀러 약관 동의 시각 (법적 요구사항 충족)';

-- 토스 Payments 가맹점 ID
ALTER TABLE wholesalers 
ADD COLUMN toss_merchant_id TEXT;

COMMENT ON COLUMN wholesalers.toss_merchant_id IS 
  '토스 Payments 가맹점 ID (정산 기능 사용을 위해 필수)';

-- 입점 계약서 파일 URL
ALTER TABLE wholesalers 
ADD COLUMN contract_file_url TEXT;

COMMENT ON COLUMN wholesalers.contract_file_url IS 
  '입점 계약서 파일 URL (Supabase Storage 경로, PDF 또는 이미지)';

-- 계약서 업로드 시각
ALTER TABLE wholesalers 
ADD COLUMN contract_uploaded_at TIMESTAMPTZ;

COMMENT ON COLUMN wholesalers.contract_uploaded_at IS 
  '계약서 업로드 시각';

-- 입점 셀러 등록 완료 시각
ALTER TABLE wholesalers 
ADD COLUMN seller_registered_at TIMESTAMPTZ;

COMMENT ON COLUMN wholesalers.seller_registered_at IS 
  '입점 셀러 등록 완료 시각 (약관 동의 + 토스 가맹점 등록 완료 시 설정)';

-- ============================================
-- 등록 흐름:
-- 1. 도매자 가입
-- 2. 관리자 승인 (status='approved', approved_at 설정)
-- 3. 입점 셀러 약관 동의 (seller_terms_agreed_at 설정)
-- 4. 입점 계약서 업로드 (contract_file_url, contract_uploaded_at 설정)
-- 5. 토스 Payments 가맹점 등록 (toss_merchant_id 설정)
-- 6. 입점 셀러 등록 완료 (seller_registered_at 설정)
-- ============================================

