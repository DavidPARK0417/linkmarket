/**
 * @file components/retailer/delivery-schedule-alerts.tsx
 * @description 배송 예정 알림 컴포넌트
 *
 * 오늘 또는 내일 배송 예정인 주문들을 알림 형태로 표시합니다.
 *
 * 주요 기능:
 * - 배송 예정 주문 목록 표시
 * - 배송 시간 및 방법 표시
 * - 주문 상세 페이지로 이동 링크
 */

"use client";

import Link from "next/link";
import { Truck, Clock, Calendar } from "lucide-react";

interface DeliverySchedule {
  id: string;
  order_number: string;
  product_name: string;
  delivery_date: string;
  delivery_time: string;
  delivery_method: "새벽 배송" | "일반 배송";
  status: "preparing" | "shipping";
}

interface DeliveryScheduleAlertsProps {
  schedules: DeliverySchedule[];
}

export default function DeliveryScheduleAlerts({
  schedules,
}: DeliveryScheduleAlertsProps) {
  if (schedules.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          배송 예정 알림
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            배송 예정인 주문이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100">
          배송 예정 알림
        </h3>
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          {schedules.length}건
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {schedules.map((schedule) => (
          <Link
            key={schedule.id}
            href={`/retailer/orders/${schedule.id}`}
            className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {schedule.order_number}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-2">
                  {schedule.product_name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{schedule.delivery_date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{schedule.delivery_time}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      schedule.delivery_method === "새벽 배송"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {schedule.delivery_method}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

