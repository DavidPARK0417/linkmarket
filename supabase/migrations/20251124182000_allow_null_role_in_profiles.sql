-- ============================================
-- profiles 테이블 role 컬럼 NULL 허용
-- ============================================
-- 
-- 목적: 신규 사용자가 역할을 선택하기 전까지 role을 NULL로 설정할 수 있도록 함
-- 
-- 변경 사항:
-- - role 컬럼을 NULL 허용으로 변경
-- - CHECK 제약조건 업데이트 (NULL 허용)
-- 
-- 이유:
-- - sync-user API에서 기본 role을 설정하지 않고 역할 선택 페이지에서만 설정
-- - 도매점 로그인 시 자동으로 retailer로 설정되는 문제 해결
-- ============================================

-- role 컬럼을 NULL 허용으로 변경
alter table public.profiles
alter column role drop not null;

-- CHECK 제약조건 업데이트 (NULL 허용)
-- 기존 CHECK 제약조건이 있다면 제거 후 재생성
do $$
begin
  -- 기존 CHECK 제약조건 제거 (있다면)
  if exists (
    select 1
    from pg_constraint
    where conname = 'chk_profiles_role'
    and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles drop constraint chk_profiles_role;
  end if;
  
  -- 새로운 CHECK 제약조건 생성 (NULL 허용)
  alter table public.profiles
  add constraint chk_profiles_role
  check (role is null or role in ('retailer', 'wholesaler', 'admin'));
end $$;

-- 주석 업데이트
comment on column public.profiles.role is 
  '사용자 역할: retailer, wholesaler, admin (NULL 허용 - 역할 선택 전까지 NULL)';

