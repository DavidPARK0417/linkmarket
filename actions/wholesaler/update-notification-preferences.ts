/**
 * @file update-notification-preferences.ts
 * @description 알림 설정 업데이트 Server Action
 *
 * 도매점 설정 페이지에서 알림 설정을 업데이트하는 Server Action입니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인
 * 2. 현재 도매점 정보 조회
 * 3. 알림 설정 JSON 업데이트
 * 4. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/validation/settings.ts (UpdateNotificationPreferencesFormData)
 *
 * @example
 * ```tsx
 * import { updateNotificationPreferences } from '@/actions/wholesaler/update-notification-preferences';
 *
 * const result = await updateNotificationPreferences({
 *   new_order: { email: true, push: true },
 *   settlement_completed: { email: true, push: false },
 *   inquiry_answered: { email: true, push: true }
 * });
 * ```
 */

"use server";

import { getUserProfile } from "@/lib/clerk/auth";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { UpdateNotificationPreferencesFormData } from "@/lib/validation/settings";

/**
 * 알림 설정 업데이트 결과 타입
 */
export interface UpdateNotificationPreferencesResult {
  success: boolean;
  error?: string;
}

/**
 * 알림 설정 업데이트 Server Action
 *
 * 도매점의 알림 설정을 업데이트합니다.
 * notification_preferences JSON 필드에 저장됩니다.
 *
 * @param {UpdateNotificationPreferencesFormData} formData - 폼 데이터
 * @returns {Promise<UpdateNotificationPreferencesResult>} 업데이트 결과
 *
 * @throws {Error} 인증 실패, 프로필 없음, 도매점 정보 없음 등
 */
export async function updateNotificationPreferences(
  formData: UpdateNotificationPreferencesFormData,
): Promise<UpdateNotificationPreferencesResult> {
  try {
    console.group("🔔 [notifications] 알림 설정 업데이트 시작");
    console.log("formData:", formData);

    // 1. Clerk 인증 확인 및 profile_id 조회
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [notifications] 인증되지 않은 사용자");
      return {
        success: false,
        error: "인증이 필요합니다. 다시 로그인해주세요.",
      };
    }

    if (profile.role !== "wholesaler") {
      console.error(
        "❌ [notifications] 도매점 역할이 아닌 사용자:",
        profile.role,
      );
      return {
        success: false,
        error: "도매점 회원만 사용할 수 있는 기능입니다.",
      };
    }

    console.log("✅ [notifications] 인증 확인 완료:", {
      profileId: profile.id,
      role: profile.role,
    });

    const supabase = getServiceRoleClient();

    // 2. 현재 도매점 정보 조회
    const { data: existingWholesaler, error: fetchError } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (fetchError) {
      console.error("❌ [notifications] 도매점 정보 조회 오류:", fetchError);
      return {
        success: false,
        error: "도매점 정보를 찾을 수 없습니다.",
      };
    }

    if (!existingWholesaler) {
      console.error("❌ [notifications] 도매점 정보 없음");
      return {
        success: false,
        error: "도매점 정보를 찾을 수 없습니다.",
      };
    }

    console.log("✅ [notifications] 도매점 정보 확인:", existingWholesaler.id);

    // 3. 알림 설정 JSON 변환
    const notificationPreferences = {
      new_order: formData.new_order,
      settlement_completed: formData.settlement_completed,
      inquiry_answered: formData.inquiry_answered,
    };

    console.log(
      "📝 [notifications] 업데이트할 알림 설정:",
      notificationPreferences,
    );

    // 4. wholesalers 테이블 UPDATE
    const { error: updateError } = await supabase
      .from("wholesalers")
      .update({
        notification_preferences: notificationPreferences,
      })
      .eq("id", existingWholesaler.id);

    if (updateError) {
      console.error("❌ [notifications] 알림 설정 업데이트 오류:", updateError);
      return {
        success: false,
        error: "알림 설정 업데이트 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [notifications] 알림 설정 업데이트 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [notifications] 알림 설정 업데이트 예외:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알림 설정 업데이트 중 오류가 발생했습니다.",
    };
  }
}
