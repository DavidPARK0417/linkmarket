/**
 * @file app/wholesaler/page.tsx
 * @description 도매 대시보드 리다이렉트 페이지
 *
 * `/wholesaler` 경로로 접근 시 실제 대시보드(`/wholesaler/dashboard`)로 리다이렉트합니다.
 * 로그인 후 접속했을 때와 사이드바에서 대시보드 버튼을 눌렀을 때 같은 화면을 보여주기 위함입니다.
 */

import { redirect } from "next/navigation";

export default function WholesalerPage() {
  console.log("🔄 [wholesaler] 대시보드로 리다이렉트");
  redirect("/wholesaler/dashboard");
}
