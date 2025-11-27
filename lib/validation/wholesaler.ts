/**
 * @file wholesaler.ts
 * @description 도매점 온보딩 폼 유효성 검증 스키마
 *
 * 이 파일은 도매점 회원가입 시 사업자 정보 입력 폼의 유효성 검증을 위한
 * Zod 스키마를 정의합니다.
 *
 * 주요 검증 규칙:
 * - 사업자명: 2글자 이상
 * - 사업자번호: 10자리 숫자 (하이픈 제거 후 검증)
 * - 대표자명: 2글자 이상
 * - 연락처: 010-####-#### 형식 (하이픈 자동 추가)
 * - 주소: 5글자 이상
 * - 은행명: 드롭다운 선택 (BANKS 상수 사용)
 * - 계좌번호: 5글자 이상
 *
 * @dependencies
 * - zod: 스키마 검증 라이브러리
 * - lib/utils/constants.ts: BANKS 상수
 *
 * @example
 * ```tsx
 * import { wholesalerOnboardingSchema } from '@/lib/validation/wholesaler';
 * import { zodResolver } from '@hookform/resolvers/zod';
 *
 * const form = useForm({
 *   resolver: zodResolver(wholesalerOnboardingSchema),
 * });
 * ```
 */

import { z } from "zod";
import { BANKS } from "@/lib/utils/constants";

/**
 * 도매점 온보딩 폼 데이터 스키마
 */
export const wholesalerOnboardingSchema = z.object({
  business_name: z
    .string()
    .min(2, "사업자명은 2글자 이상 입력해주세요.")
    .max(100, "사업자명은 100글자 이하로 입력해주세요."),

  business_number: z
    .string()
    .min(1, "사업자번호를 입력해주세요.")
    .refine(
      (val) => {
        // 하이픈 제거 후 숫자만 추출
        const digits = val.replace(/\D/g, "");
        return digits.length === 10 && /^\d+$/.test(digits);
      },
      {
        message: "사업자번호는 10자리 숫자로 입력해주세요.",
      },
    ),

  representative: z
    .string()
    .min(2, "대표자명은 2글자 이상 입력해주세요.")
    .max(50, "대표자명은 50글자 이하로 입력해주세요."),

  phone: z
    .string()
    .min(1, "연락처를 입력해주세요.")
    .refine(
      (val) => {
        // 하이픈 제거 후 숫자만 추출
        const digits = val.replace(/\D/g, "");
        // 010으로 시작하는 11자리 또는 10자리 번호
        return (
          (digits.length === 11 || digits.length === 10) &&
          digits.startsWith("010") &&
          /^\d+$/.test(digits)
        );
      },
      {
        message: "연락처는 010-####-#### 형식으로 입력해주세요.",
      },
    ),

  address: z
    .string()
    .min(5, "주소는 5글자 이상 입력해주세요.")
    .max(200, "주소는 200글자 이하로 입력해주세요."),

  address_detail: z
    .string()
    .max(100, "상세주소는 100글자 이하로 입력해주세요.")
    .optional(),

  bank_name: z
    .string()
    .min(1, "은행을 선택해주세요.")
    .refine(
      (val) => BANKS.includes(val as (typeof BANKS)[number]),
      {
        message: "올바른 은행을 선택해주세요.",
      },
    ),

  bank_account_number: z
    .string()
    .min(5, "계좌번호는 5글자 이상 입력해주세요.")
    .max(20, "계좌번호는 20글자 이하로 입력해주세요.")
    .refine(
      (val) => /^[\d-]+$/.test(val),
      {
        message: "계좌번호는 숫자와 하이픈(-)만 입력 가능합니다.",
      },
    ),
});

/**
 * 도매점 온보딩 폼 데이터 타입
 */
export type WholesalerOnboardingFormData = z.infer<
  typeof wholesalerOnboardingSchema
>;

