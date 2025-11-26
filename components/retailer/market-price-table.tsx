/**
 * @file components/retailer/market-price-table.tsx
 * @description 실시간 시세표 컴포넌트
 *
 * 주요 농수산물의 실시간 시세 정보를 표시합니다.
 *
 * 주요 기능:
 * - 주요 상품별 현재 가격 표시
 * - 전일 대비 가격 변동률 표시
 * - 가격 상승/하락 아이콘 표시
 */

"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketPrice {
  id: string;
  product_name: string;
  current_price: number;
  previous_price: number;
  unit: string;
  change_rate: number; // 전일 대비 변동률 (%)
}

interface MarketPriceTableProps {
  prices: MarketPrice[];
}

export default function MarketPriceTable({ prices }: MarketPriceTableProps) {
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const getChangeIcon = (changeRate: number) => {
    if (changeRate > 0) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (changeRate < 0) {
      return <TrendingDown className="w-4 h-4 text-blue-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = (changeRate: number) => {
    if (changeRate > 0) {
      return "text-red-600 dark:text-red-400";
    } else if (changeRate < 0) {
      return "text-blue-600 dark:text-blue-400";
    } else {
      return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        실시간 시세표
      </h3>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {prices.map((price) => (
            <div
              key={price.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {price.product_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {price.unit}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(price.current_price)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {getChangeIcon(price.change_rate)}
                    <span
                      className={`text-xs font-medium ${getChangeColor(
                        price.change_rate
                      )}`}
                    >
                      {price.change_rate > 0 ? "+" : ""}
                      {price.change_rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

