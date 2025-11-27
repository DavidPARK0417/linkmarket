/**
 * @file app/api/wholesaler/dashboard/stats/route.ts
 * @description 대시보드 통계 데이터 API
 *
 * 도매 대시보드의 통계 데이터를 제공하는 API 엔드포인트입니다.
 */

import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/supabase/queries/dashboard";

export async function GET() {
  try {
    console.log("📊 [dashboard-api] 통계 데이터 요청");

    const stats = await getDashboardStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ [dashboard-api] 통계 데이터 조회 오류:", error);

    return NextResponse.json(
      {
        error: "통계 데이터를 불러오는 중 오류가 발생했습니다.",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}
