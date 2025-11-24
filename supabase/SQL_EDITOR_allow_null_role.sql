-- ============================================
-- profiles 테이블 role 컬럼 NULL 허용
-- ============================================
-- 
-- 📌 실행 방법:
-- 1. Supabase Dashboard 접속
-- 2. 좌측 메뉴에서 "SQL Editor" 클릭
-- 3. "New query" 클릭
-- 4. 아래 SQL 전체를 복사하여 붙여넣기
-- 5. "Run" 버튼 클릭 (또는 Ctrl+Enter)
-- 
-- ⚠️ 주의사항:
-- - 이 마이그레이션은 기존 데이터에 영향을 주지 않습니다
-- - 기존 role 값은 그대로 유지됩니다
-- - NULL은 신규 사용자에게만 적용됩니다
-- 
-- ============================================

-- 1단계: role 컬럼을 NULL 허용으로 변경
ALTER TABLE public.profiles
ALTER COLUMN role DROP NOT NULL;

-- 2단계: 기존 CHECK 제약조건 확인 및 제거
DO $$
BEGIN
  -- 기존 CHECK 제약조건이 있는지 확인
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_profiles_role'
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    -- 기존 제약조건 제거
    ALTER TABLE public.profiles DROP CONSTRAINT chk_profiles_role;
    RAISE NOTICE '기존 CHECK 제약조건 제거됨: chk_profiles_role';
  ELSE
    RAISE NOTICE '기존 CHECK 제약조건 없음 (건너뜀)';
  END IF;
END $$;

-- 3단계: 새로운 CHECK 제약조건 생성 (NULL 허용)
ALTER TABLE public.profiles
ADD CONSTRAINT chk_profiles_role
CHECK (role IS NULL OR role IN ('retailer', 'wholesaler', 'admin'));

-- 4단계: 주석 업데이트
COMMENT ON COLUMN public.profiles.role IS 
  '사용자 역할: retailer, wholesaler, admin (NULL 허용 - 역할 선택 전까지 NULL)';

-- ============================================
-- ✅ 실행 완료 확인
-- ============================================
-- 아래 쿼리로 변경 사항을 확인할 수 있습니다:

-- role 컬럼이 NULL을 허용하는지 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'role';

-- 예상 결과:
-- column_name: role
-- data_type: text
-- is_nullable: YES (NULL 허용)
-- column_default: NULL

-- CHECK 제약조건 확인
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND conname = 'chk_profiles_role';

-- 예상 결과:
-- constraint_name: chk_profiles_role
-- constraint_definition: CHECK ((role IS NULL) OR ((role)::text = ANY ((ARRAY['retailer'::character varying, 'wholesaler'::character varying, 'admin'::character varying])::text[])))

