/**
 * @file app/wholesaler/page.tsx
 * @description 승인된 도매업자 대시보드 메인 페이지 (임시)
 *
 * 승인 완료된 도매업자가 접근하는 메인 대시보드입니다.
 * 처음 접근 시 환영 모달을 표시합니다.
 * 향후 통계, 주문 관리, 상품 관리 등의 기능이 추가될 예정입니다.
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";

export default function WholesalerDashboardPage() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 상호명 조회 및 환영 모달 표시
  useEffect(() => {
    const fetchBusinessName = async () => {
      if (!user) return;

      try {
        console.log("🔍 [wholesaler-dashboard] 상호명 조회 시작");

        // 프로필 조회
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError || !profile) {
          console.error(
            "❌ [wholesaler-dashboard] 프로필 조회 오류:",
            profileError,
          );
          setIsLoading(false);
          return;
        }

        // wholesaler 정보 조회
        const { data: wholesaler, error: wholesalerError } = await supabase
          .from("wholesalers")
          .select("business_name")
          .eq("profile_id", profile.id)
          .single();

        if (wholesalerError || !wholesaler) {
          console.error(
            "❌ [wholesaler-dashboard] 도매점 정보 조회 오류:",
            wholesalerError,
          );
          setIsLoading(false);
          return;
        }

        console.log(
          "✅ [wholesaler-dashboard] 상호명 조회 완료:",
          wholesaler.business_name,
        );
        setBusinessName(wholesaler.business_name);

        // 처음 접근인지 확인 (localStorage 사용)
        const hasSeenWelcome = localStorage.getItem("wholesaler_welcome_seen");
        if (!hasSeenWelcome) {
          setShowWelcomeModal(true);
          localStorage.setItem("wholesaler_welcome_seen", "true");
        }
      } catch (error) {
        console.error("❌ [wholesaler-dashboard] 상호명 조회 예외:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessName();
  }, [user, supabase]);

  // 환영 모달 확인 핸들러
  const handleWelcomeConfirm = () => {
    setShowWelcomeModal(false);
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 환영 모달 */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <Sparkles className="w-16 h-16 text-blue-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              {businessName ? `${businessName}님 환영합니다!` : "환영합니다!"}
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              도매업자 대시보드에 오신 것을 환영합니다.
              <br />
              이제 상품을 등록하고 주문을 관리할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleWelcomeConfirm}
              className="w-full sm:w-auto min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-2 text-gray-600">
            도매업자 관리 페이지에 오신 것을 환영합니다.
          </p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <CardTitle className="text-green-900">승인 완료</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-800">
              도매업자 승인이 완료되었습니다. 대시보드 기능은 곧 추가될
              예정입니다.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">주문 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">준비 중입니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">상품 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">준비 중입니다.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">정산 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">준비 중입니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
