"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

const Navbar = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  const [isApprovedWholesaler, setIsApprovedWholesaler] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 승인된 도매사업자 여부 확인
  useEffect(() => {
    const checkWholesalerStatus = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        setIsApprovedWholesaler(false);
        setIsChecking(false);
        return;
      }

      try {
        console.log("🔍 [navbar] 도매사업자 승인 상태 확인 시작");

        // 프로필 조회 (wholesalers 관계 포함)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, wholesalers(status)")
          .eq("clerk_user_id", user.id)
          .single();

        if (profileError || !profile) {
          console.log("⚠️ [navbar] 프로필 없음 또는 오류:", profileError);
          setIsApprovedWholesaler(false);
          setIsChecking(false);
          return;
        }

        // wholesalers 관계에서 승인 상태 확인
        const wholesalers = profile.wholesalers as Array<{
          status: string;
        }> | null;

        if (wholesalers && wholesalers.length > 0) {
          const wholesaler = wholesalers[0];
          const isApproved = wholesaler.status === "approved";

          console.log("✅ [navbar] 도매사업자 상태:", {
            status: wholesaler.status,
            isApproved,
          });

          setIsApprovedWholesaler(isApproved);
        } else {
          setIsApprovedWholesaler(false);
        }
      } catch (error) {
        console.error("❌ [navbar] 도매사업자 상태 확인 오류:", error);
        setIsApprovedWholesaler(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkWholesalerStatus();
  }, [isLoaded, isSignedIn, user, supabase]);

  // 로고 클릭 핸들러
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // 승인된 도매사업자인 경우 대시보드로 이동
    if (isApprovedWholesaler) {
      console.log("✅ [navbar] 승인된 도매사업자, 대시보드로 이동");
      router.push("/wholesaler");
    } else {
      console.log("ℹ️ [navbar] 일반 사용자, 홈으로 이동");
      router.push("/");
    }
  };

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link
        href={isApprovedWholesaler ? "/wholesaler" : "/"}
        onClick={handleLogoClick}
        className="flex items-center gap-2"
      >
        <Image
          src="/logo.png"
          alt="FarmToBiz"
          width={32}
          height={32}
          className="object-contain"
        />
        <span className="text-2xl font-bold text-green-600">FarmToBiz</span>
      </Link>

      {/* 로그인 상태에 따라 사용자 정보 표시 */}
      {isLoaded && (
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              {/* 로그인 상태 표시 */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:inline">로그인됨</span>
                {user?.primaryEmailAddress?.emailAddress && (
                  <span className="hidden md:inline text-gray-500">
                    ({user.primaryEmailAddress.emailAddress})
                  </span>
                )}
              </div>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">로그인되지 않음</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
