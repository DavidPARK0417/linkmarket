"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  // 메인 페이지('/')에서는 Navbar를 렌더링하지 않음 (RoleSelectionHeader 사용)
  if (pathname === "/") {
    return null;
  }

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
    </header>
  );
};

export default Navbar;
