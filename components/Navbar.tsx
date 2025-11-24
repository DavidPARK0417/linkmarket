"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSignedIn, isLoaded, user } = useUser();

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
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
