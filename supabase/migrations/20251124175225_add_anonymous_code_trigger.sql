-- ============================================
-- Anonymous Code 자동 생성 트리거 추가
-- ============================================
-- 
-- 목적: wholesalers 테이블에 INSERT 시 anonymous_code를 자동으로 생성
-- 형식: VENDOR-001, VENDOR-002, VENDOR-003 (3자리 숫자 패딩)
-- 
-- 동작 방식:
-- 1. anonymous_code가 NULL이거나 빈 문자열일 때만 생성
-- 2. 이미 값이 있으면 덮어쓰지 않음
-- 3. 기존 최대값을 조회하여 +1 증가
-- 4. 동시성 안전을 위해 advisory lock 사용
-- 
-- 참고:
-- - 기존 데이터는 그대로 유지됨
-- - UNIQUE 제약조건으로 중복 방지
-- ============================================

-- anonymous_code 자동 생성 함수
create or replace function public.generate_anonymous_code()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  max_code text;
  next_number integer := 1;
  code_match text[];
  lock_id bigint := 123456; -- advisory lock ID (고유한 값)
begin
  -- anonymous_code가 이미 있으면 그대로 유지
  if new.anonymous_code is not null and new.anonymous_code != '' then
    return new;
  end if;

  -- 동시성 안전을 위해 advisory lock 사용
  -- 같은 lock_id를 사용하는 다른 트랜잭션은 대기함
  perform pg_advisory_xact_lock(lock_id);

  -- 최대 anonymous_code 조회 (VENDOR-XXX 형식만)
  select anonymous_code into max_code
  from public.wholesalers
  where anonymous_code ~ '^VENDOR-\d+$'
  order by anonymous_code desc
  limit 1;

  -- 기존 코드에서 숫자 추출
  if max_code is not null then
    code_match := regexp_match(max_code, 'VENDOR-(\d+)');
    if code_match[1] is not null then
      next_number := cast(code_match[1] as integer) + 1;
    end if;
  end if;

  -- 새 코드 생성 (3자리 패딩)
  new.anonymous_code := 'VENDOR-' || lpad(next_number::text, 3, '0');

  return new;
end;
$$;

comment on function public.generate_anonymous_code() is 
  'wholesalers 테이블 INSERT 시 anonymous_code를 자동 생성하는 트리거 함수. VENDOR-001 형식으로 순차 생성.';

-- 트리거 생성
create trigger trg_generate_anonymous_code
before insert on public.wholesalers
for each row
execute function public.generate_anonymous_code();

comment on trigger trg_generate_anonymous_code on public.wholesalers is 
  'wholesalers 테이블 INSERT 전에 anonymous_code를 자동 생성하는 트리거.';

