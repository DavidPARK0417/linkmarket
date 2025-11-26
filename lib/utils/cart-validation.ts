/**
 * @file cart-validation.ts
 * @description 장바구니 검증 유틸리티
 *
 * 주문 전 장바구니 아이템에 대한 검증 로직을 제공합니다.
 * R.CART.04 요구사항에 따라 최소 주문 수량, 재고, 도매상 마감 시간을 체크합니다.
 *
 * @dependencies
 * - types/cart.ts
 *
 * @see {@link docs/retailer/RE_PRD.md} - R.CART.04 요구사항
 */

import type { CartItem, CartValidationResult, ValidationError } from "@/types/cart";

/**
 * 장바구니 아이템 검증 함수
 *
 * @param items 검증할 장바구니 아이템 배열
 * @returns 검증 결과 (통과 여부 및 에러 목록)
 */
export function validateCartItems(
  items: CartItem[]
): CartValidationResult {
  const errors: ValidationError[] = [];

  // 장바구니가 비어있으면 에러
  if (items.length === 0) {
    return {
      isValid: false,
      errors: [
        {
          code: "UNKNOWN",
          message: "장바구니가 비어있습니다.",
          product_id: "",
          product_name: "",
        },
      ],
    };
  }

  // 각 아이템별 검증
  for (const item of items) {
    // 1. 최소 주문 수량 체크
    if (item.quantity < item.moq) {
      errors.push({
        code: "MOQ_NOT_MET",
        message: `최소 주문 수량은 ${item.moq}개입니다. (현재: ${item.quantity}개)`,
        product_id: item.product_id,
        product_name: item.product_name,
      });
    }

    // 2. 재고 확인
    if (item.quantity > item.stock_quantity) {
      errors.push({
        code: "OUT_OF_STOCK",
        message: `재고가 부족합니다. (재고: ${item.stock_quantity}개, 주문: ${item.quantity}개)`,
        product_id: item.product_id,
        product_name: item.product_name,
      });
    }

    // 3. 도매상 마감 시간 체크
    // TODO: API 연동 시 도매상별 마감 시간 확인 로직 추가
    // 현재는 기본 검증만 수행 (나중에 구현 예정)
    // const deadlinePassed = checkWholesalerDeadline(item.wholesaler_id);
    // if (deadlinePassed) {
    //   errors.push({
    //     code: "DEADLINE_PASSED",
    //     message: "도매상 주문 마감 시간이 지났습니다.",
    //     product_id: item.product_id,
    //     product_name: item.product_name,
    //   });
    // }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 에러 코드에 따른 에러 메시지 포맷팅
 *
 * @param error 검증 에러 객체
 * @returns 포맷팅된 에러 메시지
 */
export function formatValidationError(error: ValidationError): string {
  return error.message;
}

/**
 * 에러 코드별 색상 클래스 반환
 *
 * @param code 에러 코드
 * @returns Tailwind CSS 색상 클래스
 */
export function getErrorColorClass(code: ValidationError["code"]): string {
  switch (code) {
    case "MOQ_NOT_MET":
      return "text-yellow-600 dark:text-yellow-400";
    case "OUT_OF_STOCK":
      return "text-red-600 dark:text-red-400";
    case "DEADLINE_PASSED":
      return "text-orange-600 dark:text-orange-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}

