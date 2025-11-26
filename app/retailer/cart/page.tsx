/**
 * @file app/retailer/cart/page.tsx
 * @description 소매점 장바구니 페이지
 *
 * 주요 기능:
 * 1. 장바구니 상품 목록 관리 (R.CART.01)
 * 2. 수량/삭제 수정 (R.CART.02)
 * 3. 예상 총합계 (R.CART.03)
 * 4. 주문 검증 및 주문하기 이동 (R.CART.04)
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 * - stores/cart-store.ts (장바구니 상태 관리)
 * - lib/utils/cart-validation.ts (검증 로직)
 *
 * @see {@link PRD.md} - R.CART.01~04 요구사항
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, AlertCircle } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import {
  validateCartItems,
  formatValidationError,
  getErrorColorClass,
} from "@/lib/utils/cart-validation";

export default function CartPage() {
  const items = useCartStore((state) => state.items);

  // 장바구니 요약 정보 계산 (useMemo로 캐싱하여 무한 루프 방지)
  const summary = useMemo(() => {
    const totalProductPrice = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const totalPrice = totalProductPrice;
    const itemCount = items.length;

    return { totalProductPrice, totalPrice, itemCount };
  }, [items]);

  // 장바구니 검증
  const validationResult = useMemo(() => {
    return validateCartItems(items);
  }, [items]);

  // 주문하기 버튼 활성화 여부
  const canCheckout = validationResult.isValid && items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          장바구니
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {items.length}개 상품
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 장바구니 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 검증 에러 메시지 */}
          {!validationResult.isValid && validationResult.errors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-900 dark:text-red-100 mb-2">
                    주문 전 확인이 필요합니다
                  </h3>
                  <ul className="space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li
                        key={index}
                        className={`text-sm ${getErrorColorClass(error.code)}`}
                      >
                        <span className="font-medium">{error.product_name}:</span>{" "}
                        {formatValidationError(error)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 전체 선택 */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                전체 선택 ({items.length}/{items.length})
              </span>
            </label>
            <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500">
              선택 삭제
            </button>
          </div>

          {/* 상품 목록 */}
          {items.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                장바구니가 비어있습니다.
              </p>
              <Link
                href="/retailer/products"
                className="inline-block mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                쇼핑하러 가기
              </Link>
            </div>
          ) : (
            items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 체크박스 및 이미지 */}
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 flex-shrink-0"
                  />

                  {/* 이미지 */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  {/* 판매자 */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.anonymous_seller_id} · {item.seller_region}
                  </p>

                  {/* 상품명 */}
                  <Link
                    href={`/retailer/products/${item.product_id}`}
                    className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 line-clamp-2"
                  >
                    {item.product_name}
                  </Link>

                  {/* 규격 */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.specification}
                  </p>

                  {/* 배송 방법 */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    배송 방법:{" "}
                    {item.delivery_method === "dawn" ? "새벽 배송" : "일반 배송"}
                  </p>

                  {/* 수량 조절 및 가격 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
                    {/* 수량 조절 */}
                    <div className="flex items-center gap-2">
                      <button className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        readOnly
                        className="w-12 h-8 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                      />
                      <button className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 가격 */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        {(item.unit_price * item.quantity).toLocaleString()}원
                      </p>
                      <button className="text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* 오른쪽: 주문 요약 (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              주문 요약
            </h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  상품 금액
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {summary.totalProductPrice.toLocaleString()}원
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-base font-bold">
                <span className="text-gray-900 dark:text-gray-100">
                  총 결제 예상 금액
                </span>
                <span className="text-green-600 dark:text-green-400">
                  {summary.totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            {canCheckout ? (
              <Link
                href="/retailer/checkout"
                className="flex items-center justify-center gap-2 w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>주문하기</span>
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 w-full py-4 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-bold rounded-lg cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>주문하기</span>
              </button>
            )}

            <Link
              href="/retailer/products"
              className="block text-center mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

