/**
 * @file app/(auth)/sign-up/[[...rest]]/page.tsx
 * @description 회원가입 페이지 (Catch-all route)
 *
 * Clerk를 사용한 회원가입 페이지입니다.
 * Catch-all route로 설정하여 Clerk의 내부 라우팅을 지원합니다.
 * 신규 사용자가 계정을 생성할 수 있는 페이지입니다.
 *
 * 주요 기능:
 * 1. Clerk SignUp 컴포넌트를 통한 회원가입 처리
 * 2. 회원가입 성공 시 자동 리다이렉트
 * 3. Catch-all route로 Clerk 내부 라우팅 지원
 *
 * @dependencies
 * - @clerk/nextjs (SignUp)
 *
 * @see {@link https://clerk.com/docs/components/sign-up/sign-up} - Clerk SignUp 문서
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <SignUp
        afterSignUpUrl="/role-selection"
        routing="path"
        path="/sign-up"
      />
    </div>
  );
}

