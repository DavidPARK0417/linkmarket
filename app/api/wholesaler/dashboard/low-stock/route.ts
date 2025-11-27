/**
 * @file app/api/wholesaler/dashboard/low-stock/route.ts
 * @description 재고 부족 상품 조회 API
 *
 * 대시보드에서 재고 부족 상품을 조회하는 API 엔드포인트입니다.
 */

import { NextResponse } from "next/server";
import { getLowStockProducts } from "@/lib/supabase/queries/products";

export async function GET() {
  try {
    console.log("📊 [low-stock-api] 재고 부족 상품 조회 요청");

    const products = await getLowStockProducts();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("❌ [low-stock-api] 재고 부족 상품 조회 오류:", error);

    return NextResponse.json(
      {
        error: "재고 부족 상품을 불러오는 중 오류가 발생했습니다.",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}

