/**
 * @file app/api/wholesaler/dashboard/recent-orders/route.ts
 * @description 최근 주문 조회 API
 *
 * 대시보드에서 최근 주문 5개를 조회하는 API 엔드포인트입니다.
 */

import { NextResponse } from "next/server";
import { getOrders } from "@/lib/supabase/queries/orders";

export async function GET() {
  try {
    console.log("📊 [recent-orders-api] 최근 주문 조회 요청");

    const { orders } = await getOrders({
      page: 1,
      pageSize: 5,
      sortBy: "created_at",
      sortOrder: "desc",
    });

    return NextResponse.json({ orders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("❌ [recent-orders-api] 최근 주문 조회 오류:", {
      message: errorMessage,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      } : error,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "최근 주문을 불러오는 중 오류가 발생했습니다.",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && errorStack && {
          stack: errorStack,
        }),
      },
      { status: 500 },
    );
  }
}

