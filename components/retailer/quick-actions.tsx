/**
 * @file components/retailer/quick-actions.tsx
 * @description 빠른 액션 컴포넌트
 *
 * 대시보드에서 자주 사용하는 페이지로 빠르게 이동할 수 있는 버튼들을 제공합니다.
 *
 * 주요 기능:
 * - 상품 검색 바로가기
 * - 주문 내역 바로가기
 * - 장바구니 바로가기
 */

"use client";

import Link from "next/link";
import { Search, ShoppingBag, Package } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      id: "search",
      label: "상품 검색",
      href: "/retailer/products",
      icon: Search,
      description: "상품 검색 및 탐색",
    },
    {
      id: "orders",
      label: "주문 내역",
      href: "/retailer/orders",
      icon: Package,
      description: "주문 상태 확인",
    },
    {
      id: "cart",
      label: "장바구니",
      href: "/retailer/cart",
      icon: ShoppingBag,
      description: "장바구니 확인",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        빠른 액션
      </h3>
      <div className="flex flex-col gap-3 flex-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

