/**
 * @file actions/wholesaler/batch-update-order-status.ts
 * @description 주문 일괄 상태 변경 Server Action
 *
 * 여러 주문의 상태를 한 번에 변경하는 Server Action입니다.
 * RLS 정책을 통해 자신의 주문만 변경할 수 있습니다.
 *
 * 주요 기능:
 * 1. 주문 ID 배열로 주문 조회 및 권한 확인
 * 2. 각 주문 상태 업데이트
 * 3. 성공/실패 개수 반환
 * 4. 에러 처리 및 로깅
 * 5. 캐시 무효화
 *
 * @dependencies
 * - lib/supabase/queries/orders.ts
 * - next/cache (revalidatePath)
 */

"use server";

import { updateOrderStatus as updateOrderStatusQuery } from "@/lib/supabase/queries/orders";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types/database";

/**
 * 일괄 주문 상태 변경 결과
 */
export interface BatchUpdateOrderStatusResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors?: Array<{ orderId: string; error: string }>;
}

/**
 * 주문 일괄 상태 변경
 *
 * 현재 로그인한 도매점의 주문만 변경할 수 있습니다 (RLS 정책).
 *
 * @param {string[]} orderIds - 주문 ID 배열
 * @param {OrderStatus} status - 새로운 상태
 * @returns {Promise<BatchUpdateOrderStatusResult>} 변경 결과
 *
 * @example
 * ```tsx
 * const result = await batchUpdateOrderStatus(["id1", "id2"], "confirmed");
 * if (result.success) {
 *   console.log(`성공: ${result.successCount}건, 실패: ${result.failureCount}건`);
 * }
 * ```
 */
export async function batchUpdateOrderStatus(
  orderIds: string[],
  status: OrderStatus,
): Promise<BatchUpdateOrderStatusResult> {
  try {
    console.group("🔄 [batch-order-action] 주문 일괄 상태 변경 시작");
    console.log("orderIds:", orderIds);
    console.log("status:", status);
    console.log("총 개수:", orderIds.length);

    if (orderIds.length === 0) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        errors: [{ orderId: "", error: "주문이 선택되지 않았습니다." }],
      };
    }

    const errors: Array<{ orderId: string; error: string }> = [];
    let successCount = 0;
    let failureCount = 0;

    // 각 주문 상태 변경
    for (const orderId of orderIds) {
      try {
        await updateOrderStatusQuery(orderId, status);
        successCount++;
        console.log(`✅ [batch-order-action] 주문 ${orderId} 상태 변경 완료`);
      } catch (error) {
        failureCount++;
        const errorMessage =
          error instanceof Error
            ? error.message
            : "주문 상태 변경 중 오류가 발생했습니다.";
        errors.push({ orderId, error: errorMessage });
        console.error(
          `❌ [batch-order-action] 주문 ${orderId} 상태 변경 실패:`,
          error,
        );
      }
    }

    console.log("✅ [batch-order-action] 일괄 상태 변경 완료", {
      successCount,
      failureCount,
      total: orderIds.length,
    });
    console.groupEnd();

    // 캐시 무효화
    revalidatePath("/wholesaler/orders");

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("❌ [batch-order-action] 일괄 상태 변경 오류:", error);
    console.groupEnd();
    return {
      success: false,
      successCount: 0,
      failureCount: orderIds.length,
      errors: [
        {
          orderId: "",
          error:
            error instanceof Error
              ? error.message
              : "일괄 상태 변경 중 오류가 발생했습니다.",
        },
      ],
    };
  }
}
