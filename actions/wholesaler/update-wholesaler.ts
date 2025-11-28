/**
 * @file update-wholesaler.ts
 * @description 도매점 정보 수정 Server Action
 *
 * 도매점 설정 페이지에서 사업자 정보를 수정하는 Server Action입니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인
 * 2. 현재 도매점 정보 조회
 * 3. 유효성 검증
 * 4. 전화번호 포맷팅
 * 5. 은행명 + 계좌번호 결합
 * 6. `wholesalers` 테이블 UPDATE
 * 7. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/utils/format.ts (formatPhone)
 * - lib/validation/settings.ts (UpdateWholesalerFormData)
 *
 * @example
 * ```tsx
 * import { updateWholesaler } from '@/actions/wholesaler/update-wholesaler';
 *
 * const result = await updateWholesaler({
 *   business_name: "도매상사",
 *   phone: "010-1234-5678",
 *   address: "서울시 강남구",
 *   address_detail: "101호",
 *   bank_name: "KB국민은행",
 *   bank_account_number: "123-456-789"
 * });
 * ```
 */

"use server";

import { getUserProfile } from "@/lib/clerk/auth";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { formatPhone } from "@/lib/utils/format";
import type { UpdateWholesalerFormData } from "@/lib/validation/settings";

/**
 * 도매점 정보 수정 결과 타입
 */
export interface UpdateWholesalerResult {
  success: boolean;
  error?: string;
}

/**
 * 도매점 정보 수정 Server Action
 *
 * 사업자 정보를 수정합니다.
 * 수정 가능한 필드: 상호명, 연락처, 주소, 상세주소, 계좌번호
 *
 * @param {UpdateWholesalerFormData} formData - 폼 데이터
 * @returns {Promise<UpdateWholesalerResult>} 수정 결과
 *
 * @throws {Error} 인증 실패, 프로필 없음, 도매점 정보 없음 등
 */
export async function updateWholesaler(
  formData: UpdateWholesalerFormData,
): Promise<UpdateWholesalerResult> {
  try {
    console.group("📝 [wholesaler] 도매점 정보 수정 시작");
    console.log("formData:", formData);

    // 1. Clerk 인증 확인 및 profile_id 조회
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [wholesaler] 인증되지 않은 사용자");
      return {
        success: false,
        error: "인증이 필요합니다. 다시 로그인해주세요.",
      };
    }

    if (profile.role !== "wholesaler") {
      console.error("❌ [wholesaler] 도매점 역할이 아닌 사용자:", profile.role);
      return {
        success: false,
        error: "도매점 회원만 사용할 수 있는 기능입니다.",
      };
    }

    console.log("✅ [wholesaler] 인증 확인 완료:", {
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
      console.error("❌ [wholesaler] 도매점 정보 조회 오류:", fetchError);
      return {
        success: false,
        error: "도매점 정보를 찾을 수 없습니다.",
      };
    }

    if (!existingWholesaler) {
      console.error("❌ [wholesaler] 도매점 정보 없음");
      return {
        success: false,
        error: "도매점 정보를 찾을 수 없습니다.",
      };
    }

    console.log("✅ [wholesaler] 도매점 정보 확인:", existingWholesaler.id);

    // 3. 전화번호 포맷팅
    const formattedPhone = formatPhone(formData.phone);

    // 4. 은행명 + 계좌번호 결합
    const bankAccount = `${formData.bank_name} ${formData.bank_account_number}`;

    // 5. 업데이트할 데이터 준비
    const updateData: {
      business_name?: string;
      phone?: string;
      address?: string;
      address_detail?: string | null;
      bank_account?: string;
    } = {};

    if (formData.business_name) {
      updateData.business_name = formData.business_name.trim();
    }
    if (formData.phone) {
      updateData.phone = formattedPhone;
    }
    if (formData.address) {
      updateData.address = formData.address.trim();
    }
    if (formData.address_detail !== undefined) {
      updateData.address_detail = formData.address_detail?.trim() || null;
    }
    if (formData.bank_name && formData.bank_account_number) {
      updateData.bank_account = bankAccount;
    }

    console.log("📝 [wholesaler] 업데이트 데이터:", updateData);

    // 6. wholesalers 테이블 UPDATE
    const { error: updateError } = await supabase
      .from("wholesalers")
      .update(updateData)
      .eq("id", existingWholesaler.id);

    if (updateError) {
      console.error("❌ [wholesaler] 도매점 정보 수정 오류:", updateError);
      return {
        success: false,
        error: "도매점 정보 수정 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [wholesaler] 도매점 정보 수정 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [wholesaler] 도매점 정보 수정 예외:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "도매점 정보 수정 중 오류가 발생했습니다.",
    };
  }
}
