/**
 * @file app/retailer/dashboard/page.tsx
 * @description 소매점 대시보드 페이지
 *
 * 소매점 사용자의 메인 대시보드입니다.
 * 추후 AI 추천 상품, 최근 주문 요약, 긴급 알림 등을 표시합니다.
 *
 * @dependencies
 * - app/retailer/layout.tsx (레이아웃)
 */

export default function RetailerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">소매점 대시보드</h1>
        <p className="mt-2 text-gray-600">
          환영합니다! 소매점 전용 대시보드입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 임시 카드들 */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI 추천 상품
          </h3>
          <p className="text-gray-600">곧 추가될 예정입니다.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            최근 주문
          </h3>
          <p className="text-gray-600">곧 추가될 예정입니다.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            긴급 알림
          </h3>
          <p className="text-gray-600">곧 추가될 예정입니다.</p>
        </div>
      </div>
    </div>
  );
}

