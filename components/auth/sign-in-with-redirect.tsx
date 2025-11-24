/**
 * @file components/auth/sign-in-with-redirect.tsx
 * @description SignIn 컴포넌트 래퍼 - 계정 없음 오류 감지 시 회원가입 페이지로 자동 리다이렉트
 *
 * Clerk의 SignIn 컴포넌트를 래핑하여 가입되지 않은 계정으로 로그인 시도 시
 * 자동으로 회원가입 페이지로 리다이렉트하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. MutationObserver를 사용하여 Clerk의 에러 메시지 감지
 * 2. "계정이 존재하지 않습니다" 또는 "form_identifier_not_found" 에러 감지
 * 3. 계정 없음 오류인 경우에만 회원가입 페이지로 리다이렉트
 * 4. 다른 오류(비밀번호 오류 등)는 Clerk의 기본 에러 메시지 표시 유지
 *
 * @dependencies
 * - @clerk/nextjs (SignIn)
 * - next/navigation (useRouter)
 * - react (useEffect, useRef)
 */

"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface SignInWithRedirectProps {
  /**
   * SignIn 컴포넌트에 전달할 props
   */
  path: string;
  signUpUrl: string;
  afterSignInUrl: string;
  /**
   * 로그인 후 강제 리다이렉트 URL (환경 변수보다 우선)
   */
  forceRedirectUrl?: string;
  appearance?: {
    elements?: {
      rootBox?: string;
      card?: string;
    };
  };
  /**
   * 회원가입 페이지 URL (리다이렉트 대상)
   */
  redirectToSignUpUrl: string;
}

export default function SignInWithRedirect({
  path,
  signUpUrl,
  afterSignInUrl,
  forceRedirectUrl,
  appearance,
  redirectToSignUpUrl,
}: SignInWithRedirectProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    console.log("🔍 [sign-in-redirect] 에러 감지 시작");

    // 에러 감지 함수
    const checkForAccountNotFoundError = () => {
      if (hasRedirectedRef.current || !containerRef.current) return;

      // Clerk의 에러 메시지 요소 찾기 (다양한 선택자 시도)
      const errorSelectors = [
        '[data-localization-key*="identifier"]',
        '[data-localization-key*="form_identifier_not_found"]',
        ".cl-alert",
        '[role="alert"]',
        ".cl-formFieldErrorText",
        '[class*="error"]',
        '[class*="Error"]',
      ];

      let errorElements: NodeListOf<Element> | null = null;
      for (const selector of errorSelectors) {
        errorElements = containerRef.current.querySelectorAll(selector);
        if (errorElements.length > 0) break;
      }

      if (errorElements && errorElements.length > 0) {
        errorElements.forEach((element) => {
          const text = element.textContent?.toLowerCase() || "";
          const innerHTML = element.innerHTML?.toLowerCase() || "";
          const dataKey =
            element.getAttribute("data-localization-key")?.toLowerCase() || "";

          // 계정 없음 오류 키워드 확인
          const accountNotFoundKeywords = [
            "form_identifier_not_found",
            "account not found",
            "계정이 존재하지 않습니다",
            "identifier_not_found",
            "user not found",
            "존재하지 않는",
            "찾을 수 없습니다",
            "couldn't find",
            "doesn't exist",
          ];

          const isAccountNotFound = accountNotFoundKeywords.some(
            (keyword) =>
              text.includes(keyword) ||
              innerHTML.includes(keyword) ||
              dataKey.includes(keyword),
          );

          // 비밀번호 오류는 제외
          const isPasswordError =
            text.includes("password") ||
            text.includes("비밀번호") ||
            text.includes("incorrect") ||
            text.includes("틀렸습니다") ||
            text.includes("wrong") ||
            dataKey.includes("password");

          if (isAccountNotFound && !isPasswordError) {
            console.log(
              "✅ [sign-in-redirect] 계정 없음 오류 감지, 회원가입 페이지로 리다이렉트",
            );
            hasRedirectedRef.current = true;
            router.push(redirectToSignUpUrl);
            return;
          }
        });
      }

      // 추가로 전체 텍스트에서 에러 메시지 확인
      const allText = containerRef.current.textContent?.toLowerCase() || "";
      const accountNotFoundPatterns = [
        /form_identifier_not_found/,
        /계정이 존재하지 않습니다/,
        /account.*not.*found/i,
        /user.*not.*found/i,
        /존재하지 않는.*계정/i,
      ];

      const passwordErrorPatterns = [
        /password/i,
        /비밀번호/i,
        /incorrect.*password/i,
        /틀린.*비밀번호/i,
      ];

      const hasAccountNotFound = accountNotFoundPatterns.some((pattern) =>
        pattern.test(allText),
      );
      const hasPasswordError = passwordErrorPatterns.some((pattern) =>
        pattern.test(allText),
      );

      if (
        hasAccountNotFound &&
        !hasPasswordError &&
        !hasRedirectedRef.current
      ) {
        console.log(
          "✅ [sign-in-redirect] 계정 없음 오류 감지 (텍스트 검색), 회원가입 페이지로 리다이렉트",
        );
        hasRedirectedRef.current = true;
        router.push(redirectToSignUpUrl);
      }
    };

    // MutationObserver로 에러 메시지 감지
    const observer = new MutationObserver(() => {
      checkForAccountNotFoundError();
    });

    // 관찰 시작
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-localization-key", "class"],
    });

    // 주기적으로도 체크 (MutationObserver가 놓칠 수 있는 경우 대비)
    const intervalId = setInterval(() => {
      checkForAccountNotFoundError();
    }, 500);

    // 정리 함수
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [router, redirectToSignUpUrl]);

  return (
    <div ref={containerRef}>
      <SignIn
        appearance={appearance}
        routing="path"
        path={path}
        signUpUrl={signUpUrl}
        afterSignInUrl={afterSignInUrl}
        forceRedirectUrl={forceRedirectUrl}
      />
    </div>
  );
}
