/**
 * @file components/retailer/header.tsx
 * @description 소매점 헤더 컴포넌트
 *
 * 소매점 페이지의 상단 헤더를 제공합니다.
 * 로고, 사용자 메뉴, 로그아웃 버튼을 포함합니다.
 *
 * 주요 기능:
 * 1. 로고 표시 (FarmToBiz)
 * 2. 사용자 메뉴 (Clerk UserButton)
 * 3. 로그아웃 기능 (UserButton 내장)
 *
 * @dependencies
 * - @clerk/nextjs (UserButton)
 * - next/link (Link)
 * - next/image (Image)
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export default function RetailerHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="FarmToBiz"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-bold text-green-600">FarmToBiz</span>
          </Link>

          {/* 사용자 메뉴 및 로그아웃 */}
          <div className="flex items-center gap-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

