/**
 * @file app/retailer/layout.tsx
 * @description 소매점 페이지 레이아웃
 *
 * 모든 소매점 페이지를 보호하는 레이아웃입니다.
 * requireRetailer()를 통해 소매점 권한을 확인하고,
 * 소매점 전용 헤더를 제공합니다.
 *
 * 주요 기능:
 * 1. 소매점 권한 체크 (requireRetailer)
 * 2. 헤더 컴포넌트 (로고, 사용자 메뉴, 로그아웃)
 * 3. 공통 레이아웃 구조
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireRetailer)
 * - components/retailer/header.tsx (헤더)
 */

import { requireRetailer } from "@/lib/clerk/auth";
import RetailerHeader from "@/components/retailer/header";

export default async function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 소매점 권한 확인
  const profile = await requireRetailer();

  console.log("✅ [retailer] 레이아웃: 소매점 권한 확인됨", {
    email: profile.email,
    role: profile.role,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <RetailerHeader />

      {/* 메인 컨텐츠 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

