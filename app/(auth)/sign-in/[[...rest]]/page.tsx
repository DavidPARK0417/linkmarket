/**
 * @file app/(auth)/sign-in/[[...rest]]/page.tsx
 * @description 로그인 페이지 (Catch-all route)
 *
 * Clerk를 사용한 로그인 페이지입니다.
 * Catch-all route로 설정하여 Clerk의 내부 라우팅을 지원합니다.
 * 인증되지 않은 사용자가 보호된 페이지에 접근할 때 자동으로 이 페이지로 리다이렉트됩니다.
 *
 * 주요 기능:
 * 1. Clerk SignIn 컴포넌트를 통한 로그인 처리
 * 2. 로그인 성공 시 자동 리다이렉트
 * 3. Catch-all route로 Clerk 내부 라우팅 지원
 *
 * @dependencies
 * - @clerk/nextjs (SignIn)
 *
 * @see {@link https://clerk.com/docs/components/sign-in/sign-in} - Clerk SignIn 문서
 */

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <SignIn
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}

