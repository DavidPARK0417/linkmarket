/**
 * @file cart-store.ts
 * @description 장바구니 상태 관리 스토어
 *
 * Zustand를 사용한 장바구니 전역 상태 관리입니다.
 * R.CART.01 요구사항에 따라 장바구니 아이템 배열 관리 및 총 금액 계산을 제공합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 배열 관리
 * 2. 총 금액 계산 (상품 총액, 배송비, 최종 금액)
 * 3. 장바구니 추가/수정/삭제 액션
 * 4. 로컬 스토리지 연동 (페이지 새로고침 대응)
 *
 * @dependencies
 * - zustand
 * - types/cart.ts
 *
 * @see {@link docs/retailer/RE_PRD.md} - R.CART.01 요구사항
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CartItem,
  CartSummary,
  AddToCartInput,
  UpdateCartItemInput,
  DeliveryMethod,
} from "@/types/cart";

/**
 * 장바구니 스토어 상태 타입
 */
interface CartStore {
  /** 장바구니 아이템 배열 */
  items: CartItem[];
  /** 장바구니 요약 정보 계산 */
  getSummary: () => CartSummary;
  /** 장바구니에 상품 추가 */
  addToCart: (input: AddToCartInput) => void;
  /** 장바구니 아이템 수정 */
  updateCartItem: (input: UpdateCartItemInput) => void;
  /** 장바구니에서 아이템 삭제 */
  removeFromCart: (itemId: string) => void;
  /** 장바구니 전체 비우기 */
  clearCart: () => void;
}

/**
 * 고유 ID 생성 함수
 * 간단한 UUID v4 스타일 ID 생성
 */
function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 장바구니 스토어
 *
 * @example
 * ```tsx
 * import { useCartStore } from "@/stores/cart-store";
 *
 * function CartComponent() {
 *   const items = useCartStore((state) => state.items);
 *   const summary = useCartStore((state) => state.getSummary());
 *   const addToCart = useCartStore((state) => state.addToCart);
 *   const removeFromCart = useCartStore((state) => state.removeFromCart);
 *
 *   return (
 *     <div>
 *       {items.map((item) => (
 *         <div key={item.id}>
 *           {item.product_name}
 *           <button onClick={() => removeFromCart(item.id)}>삭제</button>
 *         </div>
 *       ))}
 *       <div>총 금액: {summary.totalPrice.toLocaleString()}원</div>
 *     </div>
 *   );
 * }
 * ```
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      /** 초기 장바구니 아이템 배열 (빈 배열) */
      items: [],

      /**
       * 장바구니 요약 정보 계산
       *
       * @returns 장바구니 요약 정보 (상품 총액, 최종 금액, 아이템 개수)
       */
      getSummary: (): CartSummary => {
        const { items } = get();

        // 상품 총액 계산: 각 아이템의 (단가 * 수량) 합계
        const totalProductPrice = items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        );

        // 총 결제 예상 금액 = 상품 총액 (배송비 없음)
        const totalPrice = totalProductPrice;

        // 장바구니 아이템 개수
        const itemCount = items.length;

        return {
          totalProductPrice,
          totalPrice,
          itemCount,
        };
      },

      /**
       * 장바구니에 상품 추가
       *
       * 같은 상품(product_id + variant_id 조합)이 이미 있으면 수량을 증가시키고,
       * 없으면 새 아이템으로 추가합니다.
       *
       * @param input 추가할 상품 정보
       */
      addToCart: (input: AddToCartInput) => {
        const { items } = get();

        // 같은 상품이 이미 장바구니에 있는지 확인
        // 같은 상품 = product_id와 variant_id가 동일한 경우
        const existingItemIndex = items.findIndex(
          (item) =>
            item.product_id === input.product_id &&
            item.variant_id === input.variant_id
        );

        if (existingItemIndex !== -1) {
          // 같은 상품이 있으면 수량 증가
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + input.quantity,
            // 가격이나 배송방법이 변경되었을 수 있으므로 업데이트
            unit_price: input.unit_price,
            delivery_method: input.delivery_method,
            // 검증 정보도 업데이트
            moq: input.moq,
            stock_quantity: input.stock_quantity,
          };

          set({ items: updatedItems });
        } else {
          // 같은 상품이 없으면 새 아이템 추가
          const newItem: CartItem = {
            id: generateCartItemId(),
            ...input,
          };

          set({ items: [...items, newItem] });
        }
      },

      /**
       * 장바구니 아이템 수정
       *
       * @param input 수정할 아이템 정보 (id 필수, 나머지는 선택)
       */
      updateCartItem: (input: UpdateCartItemInput) => {
        const { items } = get();

        const itemIndex = items.findIndex((item) => item.id === input.id);

        if (itemIndex === -1) {
          console.warn(`장바구니 아이템을 찾을 수 없습니다: ${input.id}`);
          return;
        }

        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          ...(input.quantity !== undefined && { quantity: input.quantity }),
          ...(input.unit_price !== undefined && {
            unit_price: input.unit_price,
          }),
          ...(input.delivery_method !== undefined && {
            delivery_method: input.delivery_method,
          }),
        };

        set({ items: updatedItems });
      },

      /**
       * 장바구니에서 아이템 삭제
       *
       * @param itemId 삭제할 아이템 ID
       */
      removeFromCart: (itemId: string) => {
        const { items } = get();

        const filteredItems = items.filter((item) => item.id !== itemId);

        set({ items: filteredItems });
      },

      /**
       * 장바구니 전체 비우기
       */
      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "retailer-cart", // 로컬 스토리지 키
      version: 1, // 스키마 버전 (나중에 마이그레이션 시 사용)
      // 함수를 제외하고 items만 로컬 스토리지에 저장
      partialize: (state) => ({ items: state.items }),
    }
  )
);

