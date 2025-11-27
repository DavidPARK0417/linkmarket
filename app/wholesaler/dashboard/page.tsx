/**
 * @file app/wholesaler/dashboard/page.tsx
 * @description 도매 대시보드 페이지
 *
 * 도매업자의 메인 대시보드입니다.
 *
 * 주요 기능:
 * 1. 통계 카드 4개 (오늘 주문, 출고 예정, 이번 주 정산 예정, 전체 상품)
 * 2. 최근 주문 5개 표시
 * 3. 재고 부족 알림 섹션
 * 4. 실시간 주문 알림 (Supabase Realtime)
 *
 * @dependencies
 * - components/common/PageHeader.tsx
 * - components/wholesaler/Dashboard/StatCard.tsx
 * - components/wholesaler/Dashboard/RecentOrders.tsx
 * - components/wholesaler/Dashboard/LowStockAlert.tsx
 * - lib/supabase/realtime.ts
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";
import { subscribeToNewOrders } from "@/lib/supabase/realtime";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/wholesaler/Dashboard/StatCard";
import RecentOrders from "@/components/wholesaler/Dashboard/RecentOrders";
import RecentOrdersSkeleton from "@/components/wholesaler/Dashboard/RecentOrdersSkeleton";
import LowStockAlert from "@/components/wholesaler/Dashboard/LowStockAlert";
import {
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  Loader2,
} from "lucide-react";

/**
 * 대시보드 통계 데이터 타입
 */
interface DashboardStats {
  todayOrders: number;
  confirmedOrders: number;
  weeklySettlementAmount: number;
  totalProducts: number;
}

/**
 * 대시보드 통계 데이터 조회 함수 (클라이언트)
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/wholesaler/dashboard/stats");
  if (!response.ok) {
    throw new Error("대시보드 통계 조회 실패");
  }
  return response.json();
}

/**
 * 도매점 ID 조회 함수
 */
async function getWholesalerId(
  supabase: ReturnType<typeof useClerkSupabaseClient>,
  userId: string,
): Promise<string | null> {
  try {
    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("❌ [dashboard] 프로필 조회 오류:", profileError);
      return null;
    }

    // wholesaler 정보 조회
    const { data: wholesaler, error: wholesalerError } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (wholesalerError || !wholesaler) {
      console.error("❌ [dashboard] 도매점 정보 조회 오류:", wholesalerError);
      return null;
    }

    return wholesaler.id;
  } catch (error) {
    console.error("❌ [dashboard] 도매점 ID 조회 예외:", error);
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = useClerkSupabaseClient();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [wholesalerId, setWholesalerId] = useState<string | null>(null);

  // 대시보드 통계 데이터 조회
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  // 도매점 ID 조회
  useEffect(() => {
    async function fetchWholesalerId() {
      if (!isUserLoaded || !user || !supabase) return;

      try {
        console.log("🔍 [dashboard] 도매점 ID 조회 시작");
        const id = await getWholesalerId(supabase, user.id);
        if (id) {
          console.log("✅ [dashboard] 도매점 ID 조회 완료:", id);
          setWholesalerId(id);
        }
      } catch (error) {
        console.error("❌ [dashboard] 도매점 ID 조회 오류:", error);
      }
    }

    fetchWholesalerId();
  }, [isUserLoaded, user, supabase]);

  // 실시간 주문 알림 구독
  useEffect(() => {
    if (!wholesalerId || !supabase) return;

    console.log("🔔 [dashboard] 새 주문 구독 시작", { wholesalerId });

    const unsubscribe = subscribeToNewOrders(
      supabase,
      wholesalerId,
      (order) => {
        console.log("🔔 [dashboard] 새 주문 알림:", order);

        // 토스트 알림 표시
        toast({
          title: "새 주문이 들어왔습니다! 🎉",
          description: `주문번호: ${order.order_number}`,
          action: (
            <button
              onClick={() => router.push(`/wholesaler/orders/${order.id}`)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              확인하기
            </button>
          ),
        });
      },
    );

    // ⚠️ 필수: Cleanup 함수로 구독 해제 (메모리 누수 방지)
    return () => {
      console.log("🧹 [dashboard] Cleaning up order subscription");
      unsubscribe();
    };
  }, [wholesalerId, supabase, router, toast]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="오늘의 주문, 출고 예정, 정산 요약을 확인하세요."
      />

      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="오늘 주문"
          value={isStatsLoading ? "..." : stats?.todayOrders ?? 0}
          icon={ShoppingCart}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="출고 예정"
          value={isStatsLoading ? "..." : stats?.confirmedOrders ?? 0}
          icon={Truck}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="이번 주 정산 예정"
          value={
            isStatsLoading
              ? "..."
              : `${new Intl.NumberFormat("ko-KR").format(
                  stats?.weeklySettlementAmount ?? 0,
                )}원`
          }
          icon={DollarSign}
          isLoading={isStatsLoading}
        />
        <StatCard
          title="전체 상품"
          value={isStatsLoading ? "..." : stats?.totalProducts ?? 0}
          icon={Package}
          isLoading={isStatsLoading}
        />
      </div>

      {/* 에러 메시지 */}
      {statsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            통계 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시
            시도해주세요.
          </p>
        </div>
      )}

      {/* 최근 주문 및 재고 부족 알림 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 주문 */}
        <Suspense fallback={<RecentOrdersSkeleton />}>
          <RecentOrders />
        </Suspense>

        {/* 재고 부족 알림 */}
        <Suspense
          fallback={
            <div className="rounded-lg border p-6">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">
                  재고 정보를 불러오는 중...
                </p>
              </div>
            </div>
          }
        >
          <LowStockAlert />
        </Suspense>
      </div>
    </div>
  );
}
