/**
 * @file components/role-selection-header.tsx
 * @description 역할 선택 페이지 헤더 컴포넌트
 *
 * FarmToBiz 로고와 다크모드 토글 버튼을 제공합니다.
 * 반응형 웹/앱 버전으로 구현됨.
 *
 * @dependencies
 * - next-themes (useTheme)
 * - lucide-react (Sun, Moon)
 * - next/link (Link)
 * - next/image (Image)
 */

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RoleSelectionHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 다크모드 토글을 위한 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 다크모드 토글 버튼 클릭
  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="w-full border-b border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-[#1f2937]/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          {/* 왼쪽: FarmToBiz 로고 */}
          <Link 
            href="/" 
            className="flex items-center text-[#111418] dark:text-[#f0f2f4] hover:opacity-80 transition-opacity"
          >
            <Image
              src="/farmtobiz_logo.png"
              alt="FarmToBiz"
              width={160}
              height={62}
              className="object-contain"
            />
          </Link>

          {/* 오른쪽: 다크모드 토글 버튼 */}
          {mounted && (
            <button
              onClick={handleThemeToggle}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-200/50 text-[#111418] dark:bg-gray-700/50 dark:text-[#f0f2f4] hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-colors cursor-pointer flex-shrink-0"
              aria-label="테마 변경"
            >
              {theme === "light" ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
