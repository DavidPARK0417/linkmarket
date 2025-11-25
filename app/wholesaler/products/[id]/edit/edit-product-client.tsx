/**
 * @file app/wholesaler/products/[id]/edit/edit-product-client.tsx
 * @description 상품 수정 페이지 Client Component
 *
 * 상품 수정 폼을 렌더링하고 제출을 처리하는 Client Component입니다.
 *
 * 주요 기능:
 * 1. ProductForm 컴포넌트 렌더링 (mode="edit", initialData 전달)
 * 2. 상품 수정 제출 처리 (updateProduct Server Action 호출)
 * 3. 성공 시 리다이렉트 + 토스트 알림
 * 4. 에러 처리
 *
 * @dependencies
 * - components/wholesaler/Products/ProductForm.tsx
 * - actions/wholesaler/update-product.ts
 * - components/common/PageHeader.tsx
 * - lib/validation/product.ts
 * - types/product.ts
 */

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductForm from "@/components/wholesaler/Products/ProductForm";
import { updateProduct } from "@/actions/wholesaler/update-product";
import type { ProductFormData } from "@/lib/validation/product";
import type { Product } from "@/types/product";
import PageHeader from "@/components/common/PageHeader";

interface EditProductClientProps {
  product: Product;
}

/**
 * 상품 수정 페이지 Client Component
 */
export default function EditProductClient({
  product,
}: EditProductClientProps) {
  const router = useRouter();

  // 폼 제출 핸들러
  const handleSubmit = async (data: ProductFormData) => {
    try {
      console.group("📝 [edit-product-client] 상품 수정 시작");
      console.log("productId:", product.id);
      console.log("form data:", {
        ...data,
        images: data.images?.length || 0,
      });

      // updateProduct Server Action 호출
      const result = await updateProduct(product.id, data);

      if (!result.success) {
        console.error("❌ [edit-product-client] 상품 수정 실패:", result.error);
        throw new Error(result.error || "상품 수정 중 오류가 발생했습니다.");
      }

      console.log("✅ [edit-product-client] 상품 수정 성공");
      console.groupEnd();

      // 성공 토스트 알림
      toast.success("상품이 성공적으로 수정되었습니다.");

      // 상품 목록 페이지로 리다이렉트
      router.push("/wholesaler/products");
    } catch (error) {
      console.error("❌ [edit-product-client] 상품 수정 예외:", error);
      console.groupEnd();

      // 에러는 ProductForm에서 이미 처리하므로 여기서는 추가 처리 불필요
      // 하지만 명확성을 위해 다시 throw
      throw error;
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.push("/wholesaler/products");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="상품 수정"
        description="상품 정보를 수정하세요."
      />

      <ProductForm
        mode="edit"
        initialData={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

