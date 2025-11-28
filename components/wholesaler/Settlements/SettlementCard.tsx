/**
 * @file components/wholesaler/Settlements/SettlementCard.tsx
 * @description 정산 카드 컴포넌트 (모바일용)
 *
 * 모바일 화면에서 정산 정보를 카드 형태로 표시하는 컴포넌트입니다.
 * 데스크톱에서는 SettlementTable을 사용합니다.
 *
 * @dependencies
 * - components/ui/card.tsx
 * - components/wholesaler/Settlements/SettlementStatusBadge.tsx
 * - components/wholesaler/Settlements/SettlementDetailDialog.tsx
 * - lib/utils/format.ts
 */

"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SettlementStatusBadge from "./SettlementStatusBadge";
import SettlementDetailDialog from "./SettlementDetailDialog";
import { formatPrice } from "@/lib/utils/format";
import type { SettlementWithOrder } from "@/lib/supabase/queries/settlements";
import { useState } from "react";

interface SettlementCardProps {
  settlement: SettlementWithOrder;
  onViewDetail?: (settlement: SettlementWithOrder) => void;
}

export default function SettlementCard({
  settlement,
  onViewDetail,
}: SettlementCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(settlement);
    }
    setIsDialogOpen(true);
  };

  const order = settlement.orders;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold mb-1">
                주문번호: {order?.order_number || "-"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                주문일:{" "}
                {order?.created_at
                  ? format(new Date(order.created_at), "yyyy-MM-dd", {
                      locale: ko,
                    })
                  : "-"}
              </p>
            </div>
            <SettlementStatusBadge status={settlement.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 정산 예정일 */}
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">정산 예정일</span>
            <span className="text-sm font-medium">
              {format(new Date(settlement.scheduled_payout_at), "yyyy-MM-dd", {
                locale: ko,
              })}
            </span>
          </div>

          {/* 주문 금액 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">주문 금액</span>
            <span className="text-sm font-medium">
              {formatPrice(settlement.order_amount)}
            </span>
          </div>

          {/* 수수료 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              수수료 (플랫폼)
            </span>
            <span className="text-sm text-red-600">
              -{formatPrice(settlement.platform_fee)}
            </span>
          </div>

          {/* 정산 금액 (강조) */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-semibold">정산 금액</span>
            <span className="text-lg font-bold text-green-600">
              {formatPrice(settlement.wholesaler_amount)}
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleViewDetail}
          >
            <Eye className="h-4 w-4 mr-2" />
            상세보기
          </Button>
        </CardFooter>
      </Card>

      {/* 정산 상세 Dialog */}
      <SettlementDetailDialog
        settlement={settlement}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
