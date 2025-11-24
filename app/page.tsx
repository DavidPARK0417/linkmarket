/**
 * @file app/page.tsx
 * @description FarmToBiz 메인 랜딩 페이지
 *
 * 역할 선택 및 프로젝트 소개를 제공하는 랜딩 페이지입니다.
 * - Hero 섹션: 역할 선택 카드 (소매점/도매점)
 * - 프로젝트 소개 섹션: 서비스 개요, 주요 취급 품목, MD 추천 상품, 경쟁력, 타깃 사용자, 기술 스택
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserProfile, redirectByRole } from "@/lib/clerk/auth";
import RoleSelectionHeader from "@/components/role-selection-header";

export default async function Home() {
  // 로그인한 사용자는 역할에 따라 대시보드로 리다이렉트
  const profile = await getUserProfile();

  if (profile) {
    // 역할이 없으면 역할 선택 페이지로 리다이렉트
    if (!profile.role) {
      redirect("/role-selection");
    }
    // 로그인한 사용자는 역할에 따라 대시보드로 리다이렉트
    redirectByRole(profile.role);
  }

  // 로그인하지 않은 사용자에게는 역할 선택 페이지를 보여줌

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f7f8] dark:bg-[#101922] overflow-x-hidden">
      {/* 헤더 */}
      <RoleSelectionHeader />

      {/* 메인 콘텐츠 - 역할 선택 */}
      <main className="flex flex-1 justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col max-w-6xl flex-1">
          {/* 제목 섹션 */}
          <div className="flex flex-wrap justify-center gap-4 text-center mb-10">
            <div className="flex w-full flex-col gap-3">
              <h1 className="text-[#111418] dark:text-[#f0f2f4] text-4xl font-black leading-tight tracking-[-0.033em]">
                환영합니다! 시작할 역할을 선택해주세요.
              </h1>
              <p className="text-[#617589] dark:text-[#a8b5c4] text-base font-normal leading-normal">
                소매업자 또는 도매업자 중 하나를 선택하여 대시보드로 이동하세요.
              </p>
            </div>
          </div>

          {/* 역할 선택 카드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 소매업자 카드 */}
            <Link href="/sign-in/retailer" className="group block cursor-pointer">
              <div className="flex flex-col h-full rounded-xl bg-white dark:bg-[#1f2937] shadow-sm hover:shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#137fec] transition-all duration-300">
                <div className="flex flex-col gap-4 p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-[#111418] dark:text-[#f0f2f4]">
                    소매업자
                  </h3>
                  <p className="text-base text-[#617589] dark:text-[#a8b5c4]">
                    다양한 도매업체의 상품을 발견하고 합리적인 가격으로 주문하세요.
                  </p>
                  <hr className="border-gray-200 dark:border-gray-700 my-2" />
                  <ul className="flex flex-col gap-3 text-sm text-[#617589] dark:text-[#a8b5c4]">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#137fec] text-xl">search</span>
                      <span>다양한 상품 검색 및 필터링</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#137fec] text-xl">shopping_cart</span>
                      <span>간편한 주문 및 결제</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#137fec] text-xl">local_shipping</span>
                      <span>거래 내역 및 배송 추적</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto p-6 sm:p-8 pt-0">
                  <div className="flex w-full max-w-[480px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-medium leading-normal">
                    <span className="truncate">소매업자로 시작하기</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* 도매업자 카드 */}
            <Link href="/sign-in/wholesaler" className="group block cursor-pointer">
              <div className="flex flex-col h-full rounded-xl bg-white dark:bg-[#1f2937] shadow-sm hover:shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#137fec] transition-all duration-300">
                <div className="flex flex-col gap-4 p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-[#111418] dark:text-[#f0f2f4]">
                    도매업자
                  </h3>
                  <p className="text-base text-[#617589] dark:text-[#a8b5c4]">
                    전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요.
                  </p>
                  <hr className="border-gray-200 dark:border-gray-700 my-2" />
                  <ul className="flex flex-col gap-3 text-sm text-[#617589] dark:text-[#a8b5c4]">
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#137fec] text-xl">inventory_2</span>
                      <span>상품 등록 및 재고 관리</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#137fec] text-xl">receipt_long</span>
                      <span>주문 접수 및 처리</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#137fec] text-xl">monitoring</span>
                      <span>판매 데이터 및 정산 관리</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-auto p-6 sm:p-8 pt-0">
                  <div className="flex w-full max-w-[480px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-medium leading-normal">
                    <span className="truncate">도매업자로 시작하기</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
}
