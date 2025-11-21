/**
 * @file client.ts
 * @description Supabase 기본 클라이언트 (공개 데이터용)
 *
 * 이 파일은 인증이 불필요한 공개 데이터에 접근하기 위한 Supabase 클라이언트를 제공합니다.
 * RLS 정책이 'to anon'으로 설정된 데이터만 접근 가능합니다.
 *
 * ⚠️ 주의사항:
 * - 인증이 필요한 데이터에는 사용하지 마세요
 * - 클라이언트 컴포넌트에서 인증이 필요한 경우: `clerk-client.ts`의 `useClerkSupabaseClient` 사용
 * - 서버 컴포넌트에서 인증이 필요한 경우: `server.ts`의 `createClerkSupabaseClient` 사용
 *
 * @example
 * ```tsx
 * // 공개 상품 목록 조회 (인증 불필요)
 * import { supabase } from '@/lib/supabase/client';
 *
 * const { data } = await supabase
 *   .from('products')
 *   .select('*')
 *   .eq('is_active', true);
 * ```
 *
 * @dependencies
 * - @supabase/supabase-js
 *
 * @see {@link ./clerk-client.ts} - 클라이언트 컴포넌트용 인증 클라이언트
 * @see {@link ./server.ts} - 서버 컴포넌트용 인증 클라이언트
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.",
  );
}

/**
 * Supabase 기본 클라이언트 (공개 데이터용)
 *
 * 인증이 불필요한 공개 데이터에 접근할 때 사용합니다.
 * RLS 정책이 'to anon'으로 설정된 데이터만 접근 가능합니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
