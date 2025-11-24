/**
 * @file app/(auth)/sign-in/wholesaler/page.tsx
 * @description 도매점 로그인 페이지
 *
 * 도매업자를 위한 커스텀 로그인 페이지입니다.
 * Clerk SignIn 컴포넌트를 사용하며, 역할 표시 배너와 회원가입 안내를 포함합니다.
 *
 * 개선 사항 (v2):
 * - 로그인 후 온보딩 페이지로 이동 (자동 승인 상태 체크)
 * - 회원가입 링크에 역할 구분 파라미터 추가
 */

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, UserPlus } from "lucide-react";
import SignInWithRedirect from "@/components/auth/sign-in-with-redirect";

export default function WholesalerSignInPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md space-y-4">
        {/* 역할 안내 카드 */}
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">도매업자 로그인</CardTitle>
            <CardDescription>
              전국의 소매업체에게 상품을 판매하고 비즈니스를 확장하세요.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 로그인 폼 */}
        <div className="flex justify-center">
          <SignInWithRedirect
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
            path="/sign-in/wholesaler"
            signUpUrl="/sign-up?type=wholesaler"
            afterSignInUrl="/wholesaler-onboarding"
            forceRedirectUrl="/wholesaler-onboarding"
            redirectToSignUpUrl="/sign-up?type=wholesaler"
          />
        </div>

        {/* 신규 회원 안내 카드 */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">아직 회원이 아니신가요?</CardTitle>
            </div>
            <CardDescription className="text-blue-900/70 mb-3">
              지금 바로 회원가입하고 도매 비즈니스를 시작하세요!
            </CardDescription>
            <Link href="/sign-up?type=wholesaler">
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                회원가입하기
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
