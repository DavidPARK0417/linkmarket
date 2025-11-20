-- 트리거 함수 생성: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 테이블 생성 및 제약조건 적용

CREATE TABLE "retailers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "wholesalers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "business_name" TEXT NOT NULL,
    "business_number" TEXT NOT NULL,
    "representative" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "bank_account" TEXT NOT NULL,
    "anonymous_code" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "approved_at" TIMESTAMPTZ
);

CREATE TABLE "products" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "wholesaler_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specification" TEXT,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "moq" INTEGER NOT NULL,
    "shipping_fee" INTEGER NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL,
    "standardized_name" TEXT,
    "ai_suggested_category" TEXT,
    "ai_keywords" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "product_variants" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "retailer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "wholesaler_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "order_number" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "shipping_fee" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "request_note" TEXT,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "orders"."status" IS 'pending, confirmed, shipped, completed, cancelled';

CREATE TABLE "settlements" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "wholesaler_id" UUID NOT NULL,
    "order_amount" INTEGER NOT NULL,
    "platform_fee_rate" DECIMAL(5,4) NOT NULL,
    "platform_fee" INTEGER NOT NULL,
    "wholesaler_amount" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "scheduled_payout_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL -- 추가됨 (트리거 작동을 위해 필요)
);
COMMENT ON COLUMN "settlements"."status" IS 'pending, completed';

CREATE TABLE "cart_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "retailer_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL -- 추가됨 (트리거 작동을 위해 필요)
);

CREATE TABLE "cs_threads" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT DEFAULT 'open' NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "closed_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL -- 추가됨 (트리거 작동을 위해 필요)
);
COMMENT ON COLUMN "cs_threads"."status" IS 'open, bot_handled, escalated, closed';

CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "settlement_id" UUID NOT NULL,
    "method" VARCHAR(50) NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_key" VARCHAR(255),
    "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);
COMMENT ON COLUMN "payments"."status" IS 'pending';

CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" UUID,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "ai_product_suggestions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "wholesaler_id" UUID NOT NULL,
    "original_name" TEXT NOT NULL,
    "suggested_name" TEXT NOT NULL,
    "suggested_category" TEXT,
    "suggested_keywords" TEXT,
    "confidence_score" DECIMAL(5,4),
    "accepted" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "cs_messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "cs_thread_id" UUID NOT NULL,
    "sender_type" TEXT NOT NULL,
    "sender_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "inquiries" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT DEFAULT 'open' NOT NULL,
    "admin_reply" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "replied_at" TIMESTAMPTZ
);

CREATE TABLE "profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT DEFAULT 'active' NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clerk_id" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" VARCHAR(20) DEFAULT 'user',
    "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS 비활성화 (개발 환경용)
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON TABLE "users" TO anon;
GRANT ALL ON TABLE "users" TO authenticated;
GRANT ALL ON TABLE "users" TO service_role;

-- 외래키 제약조건과 인덱스 추가

ALTER TABLE "orders" ADD CONSTRAINT fk_orders_retailer FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT fk_orders_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;
ALTER TABLE "orders" ADD CONSTRAINT fk_orders_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;
ALTER TABLE "orders" ADD CONSTRAINT fk_orders_variant FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;

ALTER TABLE "settlements" ADD CONSTRAINT fk_settlements_order FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "settlements" ADD CONSTRAINT fk_settlements_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;

ALTER TABLE "cart_items" ADD CONSTRAINT fk_cart_retailer FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT fk_cart_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;
ALTER TABLE "cart_items" ADD CONSTRAINT fk_cart_variant FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;

ALTER TABLE "cs_threads" ADD CONSTRAINT fk_cs_threads_user FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT fk_products_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;

ALTER TABLE "payments" ADD CONSTRAINT fk_payments_order FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT fk_payments_settlement FOREIGN KEY ("settlement_id") REFERENCES "settlements"("id") ON DELETE CASCADE;

ALTER TABLE "product_variants" ADD CONSTRAINT fk_product_variants_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;

ALTER TABLE "retailers" ADD CONSTRAINT fk_retailers_user FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT fk_audit_logs_user FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "ai_product_suggestions" ADD CONSTRAINT fk_ai_products_product FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
ALTER TABLE "ai_product_suggestions" ADD CONSTRAINT fk_ai_products_wholesaler FOREIGN KEY ("wholesaler_id") REFERENCES "wholesalers"("id") ON DELETE RESTRICT;

ALTER TABLE "cs_messages" ADD CONSTRAINT fk_cs_messages_thread FOREIGN KEY ("cs_thread_id") REFERENCES "cs_threads"("id") ON DELETE CASCADE;

ALTER TABLE "wholesalers" ADD CONSTRAINT fk_wholesalers_user FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "inquiries" ADD CONSTRAINT fk_inquiries_user FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- 인덱스 추가

CREATE INDEX idx_orders_retailer_id ON "orders" ("retailer_id");
CREATE INDEX idx_orders_product_id ON "orders" ("product_id");
CREATE INDEX idx_orders_wholesaler_id ON "orders" ("wholesaler_id");
CREATE INDEX idx_orders_variant_id ON "orders" ("variant_id");

CREATE INDEX idx_settlements_order_id ON "settlements" ("order_id");
CREATE INDEX idx_settlements_wholesaler_id ON "settlements" ("wholesaler_id");

CREATE INDEX idx_cart_retailer_id ON "cart_items" ("retailer_id");
CREATE INDEX idx_cart_product_id ON "cart_items" ("product_id");
CREATE INDEX idx_cart_variant_id ON "cart_items" ("variant_id");

CREATE INDEX idx_cs_threads_user_id ON "cs_threads" ("user_id");

CREATE INDEX idx_products_wholesaler_id ON "products" ("wholesaler_id");
CREATE INDEX idx_products_category ON "products" ("category");
CREATE INDEX idx_products_is_active ON "products" ("is_active");

CREATE INDEX idx_payments_order_id ON "payments" ("order_id");
CREATE INDEX idx_payments_settlement_id ON "payments" ("settlement_id");

CREATE INDEX idx_product_variants_product_id ON "product_variants" ("product_id");

CREATE INDEX idx_retailers_user_id ON "retailers" ("user_id");

CREATE INDEX idx_audit_logs_user_id ON "audit_logs" ("user_id");

CREATE INDEX idx_ai_product_suggestions_product_id ON "ai_product_suggestions" ("product_id");
CREATE INDEX idx_ai_product_suggestions_wholesaler_id ON "ai_product_suggestions" ("wholesaler_id");

CREATE INDEX idx_cs_messages_cs_thread_id ON "cs_messages" ("cs_thread_id");

CREATE INDEX idx_wholesalers_user_id ON "wholesalers" ("user_id");
CREATE INDEX idx_wholesalers_status ON "wholesalers" ("status");

CREATE INDEX idx_inquiries_user_id ON "inquiries" ("user_id");
CREATE INDEX idx_inquiries_status ON "inquiries" ("status");

CREATE INDEX idx_profiles_clerk_user_id ON "profiles" ("clerk_user_id");
CREATE INDEX idx_profiles_status ON "profiles" ("status");

CREATE INDEX idx_users_clerk_id ON "users" ("clerk_id");

-- 각 테이블에 updated_at 트리거 적용

CREATE TRIGGER trg_update_orders_updated_at BEFORE UPDATE ON "orders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_settlements_updated_at BEFORE UPDATE ON "settlements" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_cart_items_updated_at BEFORE UPDATE ON "cart_items" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_cs_threads_updated_at BEFORE UPDATE ON "cs_threads" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_products_updated_at BEFORE UPDATE ON "products" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_payments_updated_at BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_product_variants_updated_at BEFORE UPDATE ON "product_variants" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_profiles_updated_at BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();