/**
 * @file WholesalerOnboardingForm.tsx
 * @description 도매점 온보딩 폼 컴포넌트
 *
 * 도매점 회원가입 시 사업자 정보를 입력받는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용하여 유효성 검증을 수행합니다.
 *
 * 주요 기능:
 * 1. 사업자 정보 입력 필드 (사업자명, 사업자번호, 대표자명, 연락처, 주소, 은행명, 계좌번호)
 * 2. 전화번호 하이픈 자동 추가
 * 3. 사업자번호 하이픈 자동 제거
 * 4. 진행 표시 (2/3 단계)
 * 5. 폼 제출 시 Server Action 호출
 * 6. 성공 시 승인 대기 페이지로 리다이렉트
 * 7. 에러 처리 및 토스트 알림
 *
 * @dependencies
 * - react-hook-form: 폼 상태 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: zodResolver
 * - actions/wholesaler/create-wholesaler.ts: Server Action
 * - lib/validation/wholesaler.ts: 유효성 검증 스키마
 * - components/ui: shadcn/ui 컴포넌트들
 * - sonner: 토스트 알림
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  wholesalerOnboardingSchema,
  type WholesalerOnboardingFormData,
} from "@/lib/validation/wholesaler";
import { BANKS } from "@/lib/utils/constants";
import { createWholesaler } from "@/actions/wholesaler/create-wholesaler";
import { formatPhone } from "@/lib/utils/format";

export default function WholesalerOnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<WholesalerOnboardingFormData>({
    resolver: zodResolver(wholesalerOnboardingSchema),
    defaultValues: {
      business_name: "",
      business_number: "",
      representative: "",
      phone: "",
      address: "",
      bank_name: "",
      bank_account_number: "",
    },
  });

  // 전화번호 하이픈 자동 추가 핸들러
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let formatted = value;

    if (digits.length <= 3) {
      formatted = digits;
    } else if (digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length <= 11) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }

    form.setValue("phone", formatted, { shouldValidate: true });
  };

  // 사업자번호 하이픈 제거 핸들러 (숫자만 입력)
  const handleBusinessNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    form.setValue("business_number", digits, { shouldValidate: true });
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: WholesalerOnboardingFormData) => {
    setIsSubmitting(true);

    try {
      console.log("📝 [wholesaler-onboarding] 폼 제출:", data);

      const result = await createWholesaler(data);

      if (!result.success) {
        console.error("❌ [wholesaler-onboarding] 도매점 생성 실패:", result.error);
        toast.error(result.error || "도매점 등록 중 오류가 발생했습니다.");
        return;
      }

      console.log("✅ [wholesaler-onboarding] 도매점 생성 성공:", result.wholesalerId);

      // 성공 시 완료 모달 표시
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ [wholesaler-onboarding] 폼 제출 예외:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "도매점 등록 중 예상치 못한 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 완료 모달 확인 핸들러
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  return (
    <div className="w-full">
      {/* 완료 모달 */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              등록 완료
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              사업자 정보가 성공적으로 등록되었습니다.
              <br />
              관리자 승인을 기다려주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleSuccessConfirm}
              className="w-full sm:w-auto min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 진행 표시 */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <span>2/3 단계</span>
          <span className="text-blue-600 dark:text-blue-400">사업자 정보 입력</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사업자 정보 입력</CardTitle>
          <CardDescription>
            도매점 회원가입을 위해 사업자 정보를 입력해주세요.
            <br />
            입력하신 정보는 관리자 승인 후 활성화됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 사업자명 */}
              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업자명 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 농산물도매상사"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>사업자 등록증에 기재된 상호명을 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 사업자번호 */}
              <FormField
                control={form.control}
                name="business_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업자번호 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 1234567890"
                        {...field}
                        onChange={(e) => {
                          handleBusinessNumberChange(e.target.value);
                        }}
                        maxLength={10}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>하이픈 없이 10자리 숫자만 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 대표자명 */}
              <FormField
                control={form.control}
                name="representative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대표자명 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 홍길동"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>사업자 등록증에 기재된 대표자명을 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 연락처 */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연락처 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 010-1234-5678"
                        {...field}
                        onChange={(e) => {
                          handlePhoneChange(e.target.value);
                        }}
                        maxLength={13}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>010-####-#### 형식으로 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 주소 */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주소 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="예: 서울시 강남구 테헤란로 123"
                        {...field}
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>사업장 주소를 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 은행명 */}
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>은행명 *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="은행을 선택해주세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANKS.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>정산을 받을 은행을 선택해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 계좌번호 */}
              <FormField
                control={form.control}
                name="bank_account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>계좌번호 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 123-456-789"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>선택한 은행의 계좌번호를 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제출 버튼 */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    "등록하기"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

