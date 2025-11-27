/**
 * @file components/wholesaler/Dashboard/LowStockAlert.tsx
 * @description 재고 부족 알림 컴포넌트
 *
 * 재고가 10개 이하인 상품을 표시하고 재고 추가 버튼을 제공합니다.
 *
 * @dependencies
 * - lib/supabase/queries/products.ts
 * - components/ui/card.tsx
 * - components/ui/button.tsx
 * - components/common/EmptyState.tsx
 */

import { getLowStockProducts } from "@/lib/supabase/queries/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function LowStockAlert() {
  console.log("🔍 [LowStockAlert] 재고 부족 상품 조회 시작");

  try {
    const lowStockProducts = await getLowStockProducts();

    console.log("✅ [LowStockAlert] 재고 부족 상품 조회 완료", {
      count: lowStockProducts.length,
    });

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg font-semibold">
              재고 부족 알림
            </CardTitle>
          </div>
          {lowStockProducts.length > 0 && (
            <Link href="/wholesaler/products">
              <Button variant="outline" size="sm">
                전체 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <EmptyState
              message="재고 부족 상품이 없습니다"
              description="모든 상품의 재고가 충분합니다."
              icon={Package}
            />
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      재고: {product.stock}개
                    </p>
                  </div>
                  <Link href={`/wholesaler/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">
                      재고 추가
                    </Button>
                  </Link>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-center text-gray-500">
                  외 {lowStockProducts.length - 5}개 상품
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("❌ [LowStockAlert] 재고 부족 상품 조회 오류:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            재고 부족 알림
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            재고 정보를 불러오는 중 오류가 발생했습니다.
          </p>
        </CardContent>
      </Card>
    );
  }
}
