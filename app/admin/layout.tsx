/**
 * @file app/admin/layout.tsx
 * @description 관리자 페이지 레이아웃
 *
 * 모든 관리자 페이지를 보호하는 레이아웃입니다.
 * requireAdmin()을 통해 관리자 권한을 확인하고,
 * 관리자 전용 사이드바 네비게이션 메뉴를 제공합니다.
 *
 * 주요 기능:
 * 1. 관리자 권한 체크 (requireAdmin)
 * 2. 사이드바 네비게이션 메뉴
 * 3. 헤더 (사용자 정보 표시)
 * 4. 공통 레이아웃 구조
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - components/admin/AdminSidebar.tsx (사이드바)
 * - @clerk/nextjs (UserButton)
 */

import { requireAdmin } from "@/lib/clerk/auth";
import { UserButton } from "@clerk/nextjs";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 관리자 권한 확인
  const profile = await requireAdmin();

  console.log("✅ [admin] 레이아웃: 관리자 권한 확인됨", {
    email: profile.email,
    role: profile.role,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <AdminSidebar />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile.email}</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
