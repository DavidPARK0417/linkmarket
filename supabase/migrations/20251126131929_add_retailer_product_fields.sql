-- ============================================
-- 소매점 상품 검색 기능을 위한 products 테이블 필드 추가
-- (한국어 텍스트 검색 지원)
-- ============================================
-- 
-- 요구사항: R.SEARCH.01-05
-- 추가 필드:
--   - original_name: 원본 상품명
--   - stock: 재고
--   - delivery_options: 배송 옵션 (JSONB)
--
-- 한국어 텍스트 검색을 위한 pg_trgm 확장 사용
-- ============================================

-- 1단계: pg_trgm 확장 설치 (한국어 부분 일치 검색 지원)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2단계: original_name 필드 추가 (원본 상품명)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_name TEXT;

-- 기존 name 값을 original_name으로 복사
UPDATE products 
SET original_name = name 
WHERE original_name IS NULL;

-- 3단계: stock 필드 추가 (재고)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- 기존 stock_quantity 값을 stock으로 복사
UPDATE products 
SET stock = stock_quantity 
WHERE stock = 0 AND stock_quantity > 0;

-- 4단계: delivery_options 필드 추가 (배송 옵션)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS delivery_options JSONB DEFAULT '{}'::jsonb;

-- delivery_options 기본 구조 예시:
-- {
--   "dawn_delivery_available": true,
--   "delivery_time_slots": ["02:00-06:00", "06:00-10:00"],
--   "delivery_methods": ["courier", "direct"]
-- }

-- 5단계: 인덱스 추가 (한국어 검색 최적화)
-- 기본 인덱스
CREATE INDEX IF NOT EXISTS idx_products_original_name ON products(original_name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_delivery_options ON products USING GIN(delivery_options);

-- 한국어 텍스트 검색을 위한 GIN 인덱스 (pg_trgm 사용)
-- standardized_name과 original_name 모두에 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_standardized_name_trgm 
ON products USING gin(standardized_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_original_name_trgm 
ON products USING gin(original_name gin_trgm_ops);

-- 6단계: 코멘트 추가
COMMENT ON COLUMN products.original_name IS '원본 상품명 (도매상이 입력한 원래 이름)';
COMMENT ON COLUMN products.stock IS '재고 수량';
COMMENT ON COLUMN products.delivery_options IS '배송 옵션 (JSONB): 새벽 배송 가능 여부, 배송 시간대 등';
COMMENT ON INDEX idx_products_standardized_name_trgm IS '한국어 텍스트 검색 인덱스 (pg_trgm 사용)';
COMMENT ON INDEX idx_products_original_name_trgm IS '한국어 텍스트 검색 인덱스 (pg_trgm 사용)';
