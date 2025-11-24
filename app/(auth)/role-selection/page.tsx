/**
 * @file app/(auth)/role-selection/page.tsx
 * @description 역할 선택 페이지 (소매점 전용)
 *
 * 회원가입 후 사용자가 소매점(Retailer) 역할을 선택하는 페이지입니다.
 * 역할_선택 레이아웃을 참고하여 구현했습니다.
 *
 * 주요 기능:
 * 1. 소매점 역할 선택 UI
 * 2. 선택한 역할을 Supabase profiles 테이블에 저장
 * 3. 소매점 선택 시 /retailer/dashboard로 리다이렉트
 *
 * @dependencies
 * - @clerk/nextjs (useUser)
 * - @/lib/supabase/clerk-client (useClerkSupabaseClient)
 * - @/components/ui/card
 * - lucide-react (아이콘)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, LocalShipping } from "lucide-react";
import { useTheme } from "next-themes";

export default function RoleSelectionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 다크모드 토글을 위한 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  /**
   * 소매점 역할 선택 처리
   */
  const handleSelectRetailer = async () => {
    if (!user) {
      console.error("❌ [role-selection] 사용자 정보 없음");
      return;
    }

    setIsLoading(true);

    try {
      console.group("🔐 [role-selection] 소매점 역할 선택 시작");
      console.log("📝 선택한 역할: retailer");
      console.log("👤 Clerk User ID:", user.id);

      // profiles 테이블에 소매점 역할 저장 또는 업데이트
      const { data: profile, error } = await supabase
        .from("profiles")
        .upsert(
          {
            clerk_user_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            role: "retailer",
            status: "active",
          },
          {
            onConflict: "clerk_user_id",
          }
        )
        .select()
        .single();

      if (error) {
        console.error("❌ [role-selection] 프로필 저장 실패:", error);
        throw error;
      }

      console.log("✅ [role-selection] 프로필 저장 성공:", profile);
      console.log("🛒 [role-selection] 소매점 대시보드로 리다이렉트");
      console.groupEnd();

      // 소매점 대시보드로 리다이렉트
      router.push("/retailer/dashboard");
    } catch (error) {
      console.error("❌ [role-selection] 역할 선택 오류:", error);
      alert("역할 선택 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 사용자 정보가 없으면 로딩 표시
  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--background-light)] dark:bg-[var(--background-dark)] overflow-x-hidden">
      {/* 헤더 */}
      <header className="flex w-full items-center justify-center border-b border-solid border-gray-200/80 dark:border-gray-700/80 bg-[var(--container-light)] dark:bg-[var(--container-dark)]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex w-full max-w-6xl items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4 text-[var(--text-light-primary)] dark:text-[var(--text-dark-primary)]">
            <div className="size-6 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">B2B 플랫폼</h2>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200/50 text-[var(--text-light-primary)] dark:bg-gray-700/50 dark:text-[var(--text-dark-primary)] gap-2 text-sm font-bold leading-normal tracking-[0.015em]"
            aria-label="다크 모드 토글"
          >
            {mounted && (
              <>
                <span className="material-symbols-outlined dark:hidden">light_mode</span>
                <span className="material-symbols-outlined hidden dark:inline">dark_mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col max-w-6xl flex-1">
          {/* 제목 섹션 */}
          <div className="flex flex-wrap justify-center gap-4 text-center mb-10">
            <div className="flex w-full flex-col gap-3">
              <h1 className="text-[var(--text-light-primary)] dark:text-[var(--text-dark-primary)] text-4xl font-black leading-tight tracking-[-0.033em]">
                환영합니다! 소매업자로 시작하세요.
              </h1>
              <p className="text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)] text-base font-normal leading-normal">
                다양한 도매업체의 상품을 발견하고 합리적인 가격으로 주문할 수 있습니다.
              </p>
            </div>
          </div>

          {/* 소매업자 카드 */}
          <div className="flex justify-center">
            <Card className="group flex flex-col h-full w-full max-w-2xl rounded-xl bg-[var(--container-light)] dark:bg-[var(--container-dark)] shadow-sm hover:shadow-lg dark:hover:shadow-primary/20 ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-primary dark:group-hover:ring-primary transition-all duration-300">
              <CardHeader className="flex flex-col gap-4 p-6 sm:p-8">
                <CardTitle className="text-xl font-bold text-[var(--text-light-primary)] dark:text-[var(--text-dark-primary)]">
                  소매업자
                </CardTitle>
                <p className="text-base text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)]">
                  다양한 도매업체의 상품을 발견하고 합리적인 가격으로 주문하세요.
                </p>
                <hr className="border-gray-200 dark:border-gray-700 my-2" />
                <ul className="flex flex-col gap-3 text-sm text-[var(--text-light-secondary)] dark:text-[var(--text-dark-secondary)]">
                  <li className="flex items-center gap-3">
                    <Search className="text-primary text-xl" size={24} />
                    <span>다양한 상품 검색 및 필터링</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ShoppingCart className="text-primary text-xl" size={24} />
                    <span>간편한 주문 및 결제</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <LocalShipping className="text-primary text-xl" size={24} />
                    <span>거래 내역 및 배송 추적</span>
                  </li>
                </ul>
              </CardHeader>
              <CardContent className="mt-auto p-6 sm:p-8 pt-0">
                <Button
                  onClick={handleSelectRetailer}
                  disabled={isLoading}
                  className="flex w-full max-w-[480px] mx-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-medium leading-normal hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {isLoading ? "처리 중..." : "소매업자로 시작하기"}
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
