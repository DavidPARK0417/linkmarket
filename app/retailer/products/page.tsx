/**
 * @file app/retailer/products/page.tsx
 * @description 소매점 상품 목록 페이지
 *
 * 주요 기능:
 * 1. 상품 검색 (R.SEARCH.01)
 * 2. AI 표준화된 상품명 표시 (R.SEARCH.02)
 * 3. 배송 필터링 (R.SEARCH.03)
 * 4. 도매 정보 익명화 (R.SEARCH.04)
 * 5. 장바구니 추가 (R.SEARCH.05)
 *
 * @dependencies
 * - lib/supabase/queries/retailer-products.ts
 * - app/retailer/layout.tsx (레이아웃)
 *
 * @see {@link PRD.md} - R.SEARCH.01~05 요구사항
 */

import Link from "next/link";
import Image from "next/image";
import { Search, Filter, ShoppingCart } from "lucide-react";
import { getRetailerProducts } from "@/lib/supabase/queries/retailer-products";
import { ProductSearchClient } from "@/components/retailer/product-search-client";

/**
 * 소매점 상품 목록 페이지 (서버 컴포넌트)
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    dawn_delivery?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  const params = await searchParams;

  console.log("🔍 [retailer-products-page] 페이지 로드", { params });

  // 쿼리 파라미터 파싱
  const page = parseInt(params.page ?? "1", 10);
  const category = params.category;
  const search = params.search;
  const dawnDelivery = params.dawn_delivery === "true";
  const sortBy =
    (params.sortBy as "created_at" | "price" | "standardized_name") ??
    "created_at";
  const sortOrder = (params.sortOrder as "asc" | "desc") ?? "desc";

  // 필터 구성
  const filter: {
    category?: string;
    search?: string;
    dawn_delivery_available?: boolean;
  } = {};

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.search = search;
  }

  if (dawnDelivery) {
    filter.dawn_delivery_available = true;
  }

  // 상품 목록 조회
  let productsData;
  try {
    productsData = await getRetailerProducts({
      page,
      pageSize: 12,
      sortBy,
      sortOrder,
      filter,
    });
  } catch (error) {
    console.error("❌ [retailer-products-page] 상품 목록 조회 실패:", error);
    // 에러 발생 시 빈 데이터 반환
    productsData = {
      products: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
    };
  }

  const { products, total, totalPages } = productsData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 섹션 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          상품 목록
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          AI가 표준화한 상품명으로 투명한 가격 비교
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          총 {total.toLocaleString()}개의 상품이 있습니다.
        </p>
      </div>

      {/* 검색 및 필터 영역 (클라이언트 컴포넌트) */}
      <ProductSearchClient
        initialSearch={search}
        initialCategory={category}
        initialDawnDelivery={dawnDelivery}
        initialSortBy={sortBy}
        initialSortOrder={sortOrder}
      />

      {/* 상품 그리드 */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                {/* 이미지 영역 */}
                <Link href={`/retailer/products/${product.id}`}>
                  <div className="relative aspect-square w-full overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.standardized_name || product.original_name || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">이미지 없음</span>
                      </div>
                    )}
                    {/* 배지 */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      {product.delivery_dawn_available && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                          새벽배송
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* 상품 정보 */}
                <div className="flex flex-col p-4 gap-3">
                  {/* 판매자 정보 (익명화) */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.wholesaler_anonymous_code} · {product.wholesaler_region}
                  </p>

                  {/* 상품명 (AI 표준화된 이름 우선 표시) */}
                  <Link href={`/retailer/products/${product.id}`}>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-primary transition-colors">
                      {product.standardized_name || product.original_name || product.name}
                    </h3>
                  </Link>

                  {/* 규격 */}
                  {product.specification && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.specification}
                    </p>
                  )}

                  {/* 가격 및 재고 */}
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {product.price.toLocaleString()}원
                      </p>
                      {product.stock !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          재고: {product.stock > 0 ? `${product.stock}개` : "품절"}
                        </p>
                      )}
                    </div>
                    {product.moq > 1 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        최소 {product.moq}개
                      </p>
                    )}
                  </div>

                  {/* 장바구니 버튼 */}
                  <Link
                    href={`/retailer/products/${product.id}`}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>장바구니 담기</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/retailer/products?page=${page - 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}${dawnDelivery ? `&dawn_delivery=true` : ""}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  이전
                </Link>
              )}
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/retailer/products?page=${page + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}${dawnDelivery ? `&dawn_delivery=true` : ""}`}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  다음
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            상품이 없습니다.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            다른 검색어나 필터를 시도해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* 헤더 섹션 */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          상품 목록
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          AI가 표준화한 상품명으로 투명한 가격 비교
        </p>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* 검색창 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="상품명, 카테고리 검색 (Cmd+K)"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* 필터 버튼 */}
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">필터</span>
        </button>
      </div>

      {/* 필터 칩 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium whitespace-nowrap">
          전체
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          새벽 배송 가능
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          제철 농산물
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          과일
        </button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-700">
          채소
        </button>
      </div>

      {/* 상품 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <Link
            key={product.id}
            href={`/retailer/products/${product.id}`}
            className="group flex flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
          >
            {/* 이미지 영역 */}
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={product.image_url}
                alt={product.standardized_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* 배지 */}
              <div className="absolute top-2 left-2 flex flex-col gap-2">
                {product.is_seasonal && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    제철
                  </span>
                )}
                {product.delivery_dawn_available && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    새벽배송
                  </span>
                )}
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="flex flex-col p-4 gap-3">
              {/* 판매자 정보 */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {product.anonymous_seller_id} · {product.seller_region}
              </p>

              {/* 상품명 */}
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                {product.standardized_name}
              </h3>

              {/* 규격 */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {product.specification}
              </p>

              {/* 가격 */}
              <div className="flex items-center justify-between mt-auto">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {product.price.toLocaleString()}원
                </p>
                {product.moq > 1 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    최소 {product.moq}개
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 더보기 버튼 */}
      <div className="flex justify-center mt-8">
        <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
          더 보기
        </button>
      </div>
    </div>
  );
}

