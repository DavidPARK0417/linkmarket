/**
 * @file app/(auth)/sign-in/[[...rest]]/SignInCreateClient.tsx
 * @description /sign-in/create 경로용 클라이언트 컴포넌트
 *
 * 소매점 계정이 도매점 회원가입을 시도할 때 표시되는 모달 컴포넌트입니다.
 * Clerk 컴포넌트는 숨기고 모달만 표시합니다.
 *
 * 주요 기능:
 * 1. 소매점 계정의 도매점 회원가입 차단 모달 표시
 * 2. Clerk 컴포넌트 숨김 처리
 * 3. 확인 버튼 클릭 시 첫 페이지로 리다이렉트
 *
 * @dependencies
 * - react (useEffect)
 * - components/auth/retailer-signup-block-modal
 */

"use client";

import { useEffect } from "react";
import RetailerSignupBlockModal from "@/components/auth/retailer-signup-block-modal";

export default function SignInCreateClient() {
  console.log("🚫 [SignInCreateClient] 소매점 계정의 도매점 회원가입 차단 모달 표시");

  // Clerk 컴포넌트 숨기기
  useEffect(() => {
    const hideClerkComponents = () => {
      // Clerk 컴포넌트 숨기기
      const clerkSelectors = [
        "[class*='cl-rootBox']",
        "[class*='cl-card']",
        "[class*='cl-main']",
        "[class*='cl-form']",
      ];

      clerkSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          (element as HTMLElement).style.display = "none";
        });
      });
    };

    // 즉시 실행
    hideClerkComponents();

    // DOM 변화 감지를 위한 MutationObserver
    const observer = new MutationObserver(() => {
      hideClerkComponents();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <RetailerSignupBlockModal />;
}

