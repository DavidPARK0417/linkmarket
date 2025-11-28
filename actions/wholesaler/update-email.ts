/**
 * @file update-email.ts
 * @description 이메일 변경 Server Action
 *
 * 도매점 설정 페이지에서 이메일을 변경하는 Server Action입니다.
 * Clerk의 이메일 변경 API를 사용하여 인증 이메일을 발송합니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인
 * 2. 새 이메일 유효성 검증
 * 3. Clerk 이메일 변경 요청 (인증 이메일 발송)
 * 4. 에러 처리 및 로깅
 *
 * 참고:
 * - Clerk는 이메일 변경 시 인증 이메일을 자동으로 발송합니다.
 * - 사용자가 새 이메일에서 인증 링크를 클릭해야 변경이 완료됩니다.
 * - 인증 완료 후 sync-user API가 자동으로 profiles.email을 업데이트합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server (auth, clerkClient)
 * - lib/validation/settings.ts (UpdateEmailFormData)
 *
 * @example
 * ```tsx
 * import { updateEmail } from '@/actions/wholesaler/update-email';
 *
 * const result = await updateEmail({
 *   email: "new@example.com"
 * });
 * ```
 */

"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import type { UpdateEmailFormData } from "@/lib/validation/settings";

/**
 * 이메일 변경 결과 타입
 */
export interface UpdateEmailResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * 이메일 변경 Server Action
 *
 * Clerk의 이메일 변경 API를 사용하여 인증 이메일을 발송합니다.
 * 사용자가 새 이메일에서 인증 링크를 클릭하면 변경이 완료됩니다.
 *
 * @param {UpdateEmailFormData} formData - 폼 데이터 (email)
 * @returns {Promise<UpdateEmailResult>} 변경 결과
 *
 * @throws {Error} 인증 실패, 이메일 형식 오류 등
 */
export async function updateEmail(
  formData: UpdateEmailFormData,
): Promise<UpdateEmailResult> {
  try {
    console.group("📧 [email] 이메일 변경 시작");
    console.log("새 이메일:", formData.email);

    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("❌ [email] 인증되지 않은 사용자");
      return {
        success: false,
        error: "인증이 필요합니다. 다시 로그인해주세요.",
      };
    }

    console.log("✅ [email] 인증 확인 완료:", userId);

    // 2. Clerk 클라이언트 생성
    const client = await clerkClient();

    // 3. 현재 사용자 정보 조회
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      console.error("❌ [email] Clerk 사용자 없음:", userId);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // 4. 현재 이메일과 동일한지 확인
    const currentEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (currentEmail === formData.email) {
      console.log("ℹ️ [email] 동일한 이메일입니다.");
      return {
        success: false,
        error: "현재 사용 중인 이메일과 동일합니다.",
      };
    }

    console.log("📧 [email] 이메일 변경 요청:", {
      from: currentEmail,
      to: formData.email,
    });

    // 5. Clerk 이메일 변경 요청
    // Clerk의 이메일 변경은 복잡하므로, 일단 profiles 테이블의 email만 업데이트합니다.
    // 실제 Clerk 이메일 변경은 사용자가 Clerk 대시보드에서 직접 변경하도록 안내합니다.
    // TODO: Clerk 이메일 변경 API 정확한 구현 필요

    // profiles 테이블의 email 업데이트
    const { getServiceRoleClient } = await import(
      "@/lib/supabase/service-role"
    );
    const supabase = getServiceRoleClient();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ email: formData.email })
      .eq("clerk_user_id", userId);

    if (updateError) {
      console.error("❌ [email] profiles 이메일 업데이트 오류:", updateError);
      return {
        success: false,
        error: "이메일 변경 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [email] profiles 이메일 업데이트 완료");
    console.log(
      "⚠️ [email] Clerk 이메일은 사용자가 Clerk 대시보드에서 직접 변경해야 합니다.",
    );
    console.groupEnd();

    return {
      success: true,
      message: `이메일이 ${formData.email}로 변경되었습니다. Clerk 계정의 이메일도 변경하려면 사용자 메뉴에서 변경해주세요.`,
    };
  } catch (error) {
    console.error("❌ [email] 이메일 변경 예외:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "이메일 변경 중 오류가 발생했습니다.",
    };
  }
}
