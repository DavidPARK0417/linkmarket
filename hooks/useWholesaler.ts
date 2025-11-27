/**
 * @file hooks/useWholesaler.ts
 * @description 도매점 정보 조회 훅
 *
 * 현재 로그인한 사용자의 도매점 정보를 조회하는 React Query 훅입니다.
 * Clerk user_id를 사용하여 profiles → wholesalers 조회합니다.
 *
 * 데이터 흐름:
 * Clerk user_id → profiles (clerk_user_id) → wholesalers (profile_id)
 *
 * @dependencies
 * - @tanstack/react-query
 * - @clerk/nextjs
 * - lib/supabase/clerk-client.ts
 * - types/wholesaler.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { Wholesaler } from "@/types/wholesaler";

/**
 * 도매점 정보 조회 함수
 *
 * @param supabase Supabase 클라이언트
 * @param userId Clerk user_id
 * @returns 도매점 정보 또는 null
 */
async function fetchWholesalerInfo(
  supabase: ReturnType<typeof useClerkSupabaseClient>,
  userId: string,
): Promise<Wholesaler | null> {
  console.group("🔍 [useWholesaler] 도매점 정보 조회 시작");
  console.log("Clerk userId:", userId);

  try {
    // 1. 프로필 조회 (clerk_user_id로)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (profileError) {
      // PGRST116은 "no rows returned" 에러 (프로필이 없는 경우, 정상)
      if (profileError.code === "PGRST116") {
        console.log(
          "⚠️ [useWholesaler] 프로필 없음 (정상 - 신규 사용자 또는 프로필 미생성)",
          { clerkUserId: userId },
        );
        console.groupEnd();
        return null;
      }

      // 다른 에러는 실제 에러로 처리
      console.error("❌ [useWholesaler] 프로필 조회 오류:", 
        profileError instanceof Error
          ? profileError.message
          : JSON.stringify(profileError, null, 2),
      );
      console.groupEnd();
      return null;
    }

    if (!profile) {
      console.log("⚠️ [useWholesaler] 프로필 없음", { clerkUserId: userId });
      console.groupEnd();
      return null;
    }

    console.log("✅ [useWholesaler] 프로필 조회 완료:", profile.id);

    // 2. 도매점 정보 조회 (profile_id로)
    const { data: wholesaler, error: wholesalerError } = await supabase
      .from("wholesalers")
      .select("*")
      .eq("profile_id", profile.id)
      .single();

    if (wholesalerError) {
      // PGRST116은 "no rows returned" 에러 (도매점 정보가 없는 경우, 정상)
      if (wholesalerError.code === "PGRST116") {
        console.log(
          "⚠️ [useWholesaler] 도매점 정보 없음 (정상 - 도매점 등록 필요)",
          { profileId: profile.id },
        );
        console.groupEnd();
        return null;
      }

      // 다른 에러는 실제 에러로 처리
      console.error(
        "❌ [useWholesaler] 도매점 정보 조회 오류:",
        wholesalerError instanceof Error
          ? wholesalerError.message
          : JSON.stringify(wholesalerError, null, 2),
      );
      console.groupEnd();
      return null;
    }

    if (!wholesaler) {
      console.log("⚠️ [useWholesaler] 도매점 정보 없음", { profileId: profile.id });
      console.groupEnd();
      return null;
    }

    console.log("✅ [useWholesaler] 도매점 정보 조회 완료:", wholesaler.id);
    console.groupEnd();

    return wholesaler as Wholesaler;
  } catch (error) {
    console.error("❌ [useWholesaler] 도매점 정보 조회 예외:", error);
    console.groupEnd();
    return null;
  }
}

/**
 * 도매점 정보 조회 훅
 *
 * 현재 로그인한 사용자의 도매점 정보를 조회합니다.
 * React Query를 사용하여 캐싱 및 상태 관리를 합니다.
 *
 * @returns 도매점 정보 및 로딩/에러 상태
 *
 * @example
 * ```tsx
 * const { data: wholesaler, isLoading, error } = useWholesaler();
 *
 * if (isLoading) return <div>로딩 중...</div>;
 * if (!wholesaler) return <div>도매점 정보 없음</div>;
 *
 * return <div>{wholesaler.business_name}</div>;
 * ```
 */
export function useWholesaler() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const supabase = useClerkSupabaseClient();

  return useQuery({
    queryKey: ["wholesaler", user?.id],
    queryFn: () => {
      if (!user?.id || !supabase) {
        return Promise.resolve(null);
      }
      return fetchWholesalerInfo(supabase, user.id);
    },
    enabled: isUserLoaded && !!user?.id && !!supabase,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: false,
  });
}
