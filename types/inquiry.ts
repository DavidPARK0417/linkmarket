/**
 * @file inquiry.ts
 * @description 문의 타입 정의
 *
 * 이 파일은 문의(inquiries) 관련 타입을 정의합니다.
 * 문의 작성, 조회, 답변 등을 포함합니다.
 *
 * @dependencies
 * - types/database.ts
 */

import type { InquiryStatus } from "./database";

/**
 * 문의 테이블 타입
 * inquiries 테이블과 일치
 */
export interface Inquiry {
  id: string;
  user_id: string; // profiles 테이블 참조
  title: string;
  content: string;
  status: InquiryStatus;
  admin_reply: string | null;
  created_at: string;
  replied_at: string | null;
}

/**
 * 문의 생성 요청 타입
 */
export interface CreateInquiryRequest {
  user_id: string;
  title: string;
  content: string;
}

/**
 * 문의 업데이트 요청 타입 (사용자용)
 */
export interface UpdateInquiryRequest {
  title?: string;
  content?: string;
}

/**
 * 문의 답변 요청 타입 (관리자용)
 */
export interface ReplyInquiryRequest {
  inquiry_id: string;
  admin_reply: string;
}

/**
 * 문의 목록 조회 필터 타입
 */
export interface InquiryFilter {
  user_id?: string;
  status?: InquiryStatus;
  start_date?: string; // ISO 8601 형식
  end_date?: string; // ISO 8601 형식
  search?: string; // 제목 또는 내용 검색
}

/**
 * 문의 상세 정보 타입
 * 필요시 프로필 정보 등 추가 가능
 */
export interface InquiryDetail extends Inquiry {
  // 추가 정보가 필요한 경우 여기에 확장
  // 예: user_name, user_email 등
}
