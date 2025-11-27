/**
 * @file hooks/use-wholesaler-notifications.ts
 * @description 도매점 알림 관리 훅
 *
 * 도매점의 주문 알림을 관리하는 커스텀 훅입니다.
 * 읽지 않은 주문 개수 조회, 최근 주문 목록 조회, 읽음 처리 등을 제공합니다.
 *
 * 주요 기능:
 * 1. 읽지 않은 주문 개수 조회 (React Query)
 * 2. 최근 주문 목록 조회 (React Query)
 * 3. Realtime 구독으로 실시간 업데이트
 * 4. 읽음 처리 (드롭다운 열 때 자동 실행)
 *
 * @dependencies
 * - @tanstack/react-query
 * - lib/supabase/clerk-client.ts
 * - lib/supabase/queries/notifications.ts
 * - lib/supabase/realtime.ts
 */

"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";
import {
  getUnreadOrdersCount,
  getRecentOrderNotifications,
  markAllOrdersAsRead,
  type OrderNotification,
} from "@/lib/supabase/queries/notifications";
import { subscribeToNewOrders } from "@/lib/supabase/realtime";

/**
 * 도매점 ID 조회 (내부 헬퍼 함수)
 */
async function getWholesalerId(
  supabase: ReturnType<typeof useClerkSupabaseClient>,
  userId: string,
): Promise<string | null> {
  // 프로필 조회
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (profileError || !profile) {
    console.error("❌ [notifications-hook] 프로필 조회 오류:", profileError);
    return null;
  }

  // wholesaler 정보 조회
  const { data: wholesaler, error: wholesalerError } = await supabase
    .from("wholesalers")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (wholesalerError || !wholesaler) {
    console.error("❌ [notifications-hook] 도매점 정보 조회 오류:", wholesalerError);
    return null;
  }

  return wholesaler.id;
}

/**
 * 도매점 알림 관리 훅
 *
 * @returns 알림 관련 상태 및 함수
 */
export function useWholesalerNotifications() {
  const supabase = useClerkSupabaseClient();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // 도매점 ID 조회
  useEffect(() => {
    const fetchWholesalerId = async () => {
      if (!user) {
        setWholesalerId(null);
        return;
      }

      try {
        const id = await getWholesalerId(supabase, user.id);
        setWholesalerId(id);
      } catch (error) {
        console.error("❌ [notifications-hook] 도매점 ID 조회 예외:", error);
        setWholesalerId(null);
      }
    };

    fetchWholesalerId();
  }, [user, supabase]);

  // 읽지 않은 주문 개수 조회
  const {
    data: unreadCount = 0,
    isLoading: isLoadingCount,
    error: countError,
  } = useQuery({
    queryKey: ["notifications", "unread-count", wholesalerId],
    queryFn: async () => {
      if (!wholesalerId) return 0;
      return await getUnreadOrdersCount(supabase, wholesalerId);
    },
    enabled: !!wholesalerId,
    refetchInterval: 30000, // 30초마다 자동 새로고침
  });

  // 최근 주문 목록 조회
  const {
    data: recentOrders = [],
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useQuery({
    queryKey: ["notifications", "recent-orders", wholesalerId],
    queryFn: async () => {
      if (!wholesalerId) return [];
      return await getRecentOrderNotifications(supabase, wholesalerId, 5);
    },
    enabled: !!wholesalerId,
  });

  // 읽음 처리 Mutation
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!wholesalerId) return 0;
      return await markAllOrdersAsRead(supabase, wholesalerId);
    },
    onSuccess: (count) => {
      console.log("✅ [notifications-hook] 읽음 처리 완료:", count);
      // 관련 쿼리 무효화하여 자동 새로고침
      queryClient.invalidateQueries({
        queryKey: ["notifications", wholesalerId],
      });
    },
    onError: (error) => {
      console.error("❌ [notifications-hook] 읽음 처리 오류:", error);
    },
  });

  // Realtime 구독 (새 주문 알림)
  useEffect(() => {
    if (!wholesalerId) return;

    console.log("🔔 [notifications-hook] Realtime 구독 시작", { wholesalerId });

    const unsubscribe = subscribeToNewOrders(supabase, wholesalerId, (order) => {
      console.log("🔔 [notifications-hook] 새 주문 알림:", order);
      // 읽지 않은 주문 개수 새로고침
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count", wholesalerId],
      });
      // 최근 주문 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ["notifications", "recent-orders", wholesalerId],
      });
    });

    // Cleanup
    return () => {
      console.log("🧹 [notifications-hook] Realtime 구독 해제");
      unsubscribe();
    };
  }, [wholesalerId, supabase, queryClient]);

  return {
    // 상태
    unreadCount,
    recentOrders,
    hasNewNotifications: unreadCount > 0,
    isLoading: isLoadingCount || isLoadingOrders,
    error: countError || ordersError,

    // 함수
    markAsRead: () => markAsReadMutation.mutate(),
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}

