# 👨‍💼 관리자 페이지 개발 TODO 리스트

> **프로젝트**: AI 기반 B2B 도매-소매 중개 플랫폼  
> **개발 방식**: 커서 AI 바이브 코딩  
> **최종 업데이트**: 2025-01-27  
> **참고 문서**: [관리자 페이지 가이드라인](./admin.md)

---

## 🎯 목표

도매사업자 가입승인 기능을 최우선으로 구현하여, 도매사업자가 회원가입 후 관리자의 승인을 받을 수 있도록 합니다.

---

## 📋 구현 순서 (도매사업자 가입승인 우선)

### 1단계: 관리자 계정 생성 (수동) 🔴 최우선 ✅ 완료

**목적**: 관리자 페이지에 접근할 수 있는 계정 생성

- [x] **Clerk에서 관리자 계정 생성**

  - [x] Clerk 대시보드 접속
  - [x] Users 메뉴에서 새 사용자 생성
  - [x] 이메일/비밀번호로 계정 생성
  - [x] 생성된 사용자의 `User ID` 복사 (예: `user_2abc123...`)
  - [x] 관리자 이메일 및 비밀번호 기록 (보안 관리)

- [x] **Supabase에서 프로필 생성**

  - [x] Supabase 대시보드의 SQL Editor 접속
  - [x] 다음 SQL 실행:
    ```sql
    INSERT INTO profiles (clerk_user_id, email, role, status)
    VALUES (
      'clerk_사용자_ID',  -- 위에서 복사한 Clerk User ID
      'admin@example.com',  -- 관리자 이메일
      'admin',
      'active'
    );
    ```
  - [x] 프로필 생성 확인 (profiles 테이블 조회)

- [x] **관리자 계정 접근 테스트**
  - [x] `/admin` 경로로 접속 시도
  - [x] Clerk 로그인 화면 표시 확인
  - [x] 관리자 계정으로 로그인
  - [x] 관리자 페이지 접근 확인 (관리자 페이지 생성 완료)

---

### 2단계: 관리자 권한 체크 함수 추가 ✅ 완료

**목적**: 관리자만 접근할 수 있도록 권한 체크 함수 구현

**파일**: `lib/clerk/auth.ts`

- [x] **requireAdmin() 함수 추가**
  - [x] `requireAuth()`를 먼저 호출하여 인증 확인
  - [x] `role`이 `'admin'`이 아니면 홈(`'/'`)으로 리다이렉트
  - [x] 관리자인 경우 `ProfileWithDetails` 반환
  - [x] JSDoc 주석 추가
  - [x] 에러 처리 및 로깅

**커서 AI 프롬프트:**

```
lib/clerk/auth.ts 파일에 관리자 권한 체크 함수를 추가해줘.

요구사항:
- requireAdmin() 함수 추가
- requireAuth()를 먼저 호출하여 인증 확인
- role이 'admin'이 아니면 홈('/')으로 리다이렉트
- 관리자인 경우 ProfileWithDetails 반환
- JSDoc 주석 추가
```

**테스트:**

- [ ] 관리자 계정으로 로그인 시 함수가 정상 작동하는지 확인
- [ ] 비관리자 계정으로 접근 시 홈으로 리다이렉트되는지 확인

---

### 3단계: 관리자 레이아웃 생성 ✅ 완료

**목적**: 모든 관리자 페이지를 보호하는 레이아웃 생성

**파일**: `app/admin/layout.tsx`

- [x] **레이아웃 기본 구조 생성**

  - [x] `requireAdmin()`으로 관리자 권한 체크
  - [x] 헤더 컴포넌트 (관리자 페이지 타이틀)
  - [x] 네비게이션 메뉴 (도매 승인 대기 링크)
  - [x] 메인 컨텐츠 영역 (`{children}`)

- [x] **네비게이션 메뉴**
  - [x] "도매 승인 대기" 링크 (`/admin/wholesalers/pending`)
  - [x] "감사 로그" 링크 (`/admin/audit-logs`) - 선택사항
  - [x] 깔끔한 UI 스타일링

**커서 AI 프롬프트:**

```
관리자 페이지 레이아웃을 만들어줘.

요구사항:
- requireAdmin()으로 관리자 권한 체크
- 관리자 전용 네비게이션 (사이드바 또는 헤더)
- 도매 승인 대기 목록 링크
- 감사 로그 링크 (선택)
- 깔끔한 관리자 UI

파일: app/admin/layout.tsx
```

**테스트:**

- [ ] 관리자 계정으로 `/admin` 접근 시 레이아웃이 표시되는지 확인
- [ ] 비관리자 계정으로 접근 시 홈으로 리다이렉트되는지 확인

---

### 4단계: 도매 승인 대기 목록 페이지 ✅ 완료

**목적**: 승인 대기 중인 도매사업자 목록을 조회하고 표시

**파일**: `app/admin/wholesalers/pending/page.tsx`

- [x] **페이지 기본 구조**

  - [x] `requireAdmin()`으로 권한 체크
  - [x] 페이지 타이틀 ("도매 승인 대기 목록")

- [x] **데이터 조회**

  - [x] `wholesalers` 테이블에서 `status='pending'` 조회
  - [x] `profiles` 테이블과 조인하여 이메일 정보 포함
  - [x] 정렬: `created_at DESC` (최신순)
  - [x] 에러 처리

- [x] **UI 구현**
  - [x] 테이블 형태로 표시
    - [x] 상호명
    - [x] 사업자번호
    - [x] 대표자
    - [x] 이메일
    - [x] 신청일 (날짜 포맷팅)
    - [x] 액션 (상세보기 링크)
  - [x] 빈 목록 처리 ("승인 대기 중인 도매사업자가 없습니다.")
  - [ ] 로딩 상태 처리 (선택사항)

**커서 AI 프롬프트:**

```
도매 승인 대기 목록 페이지를 만들어줘.

요구사항:
- status='pending'인 도매사업자 목록 조회
- profiles 테이블과 조인하여 이메일 정보 포함
- 테이블 형태로 표시 (상호명, 사업자번호, 이메일, 신청일)
- 각 행 클릭 시 상세 페이지로 이동
- 정렬: created_at DESC (최신순)
- 로딩 상태 처리
- 빈 목록 처리

파일: app/admin/wholesalers/pending/page.tsx
```

**테스트:**

- [ ] 승인 대기 목록이 정상적으로 표시되는지 확인
- [ ] 빈 목록일 때 적절한 메시지가 표시되는지 확인
- [x] 상세보기 링크가 정상 작동하는지 확인

---

### 5단계: 도매 상세 페이지 ✅ 완료

**목적**: 도매사업자의 상세 정보를 확인하고 승인/반려 처리

**파일**: `app/admin/wholesalers/[id]/page.tsx`

- [x] **페이지 기본 구조**

  - [x] `requireAdmin()`으로 권한 체크
  - [x] Next.js 15 동적 라우트 파라미터 처리 (`await params`)
  - [x] "목록으로" 링크

- [x] **데이터 조회**

  - [x] 도매사업자 ID로 전체 정보 조회
  - [x] `profiles` 테이블과 조인하여 이메일 정보 포함
  - [x] 이미 승인/반려된 경우 목록으로 리다이렉트
  - [x] 존재하지 않는 경우 `notFound()` 처리

- [x] **사업자 정보 표시**

  - [x] 상호명
  - [x] 사업자번호
  - [x] 대표자
  - [x] 연락처
  - [x] 이메일
  - [x] 주소
  - [x] 계좌정보
  - [x] 익명 코드
  - [x] 신청일

- [x] **승인/반려 폼 컴포넌트 연결**
  - [x] `WholesalerApprovalForm` 컴포넌트 사용
  - [x] `wholesalerId`, `adminId` props 전달

**커서 AI 프롬프트:**

```
도매사업자 상세 페이지를 만들어줘.

요구사항:
- 도매사업자 ID로 전체 정보 조회
- 사업자 정보 전체 표시 (상호명, 사업자번호, 대표자, 연락처, 주소, 계좌정보)
- 승인 버튼 (Server Action)
- 반려 버튼 (반려 사유 입력 모달)
- 승인/반려 후 목록 페이지로 리다이렉트
- 감사 로그 기록

파일: app/admin/wholesalers/[id]/page.tsx
```

**테스트:**

- [ ] 도매사업자 상세 정보가 정상적으로 표시되는지 확인
- [ ] 존재하지 않는 ID로 접근 시 404 페이지가 표시되는지 확인
- [ ] 이미 승인/반려된 경우 목록으로 리다이렉트되는지 확인

---

### 6단계: 승인/반려 Server Action ✅ 완료

**목적**: 도매사업자 승인/반려 처리 및 감사 로그 기록

**파일**: `actions/admin/wholesaler-approval.ts`

- [x] **IP 주소 추출 함수**

  - [x] `headers()`에서 IP 주소 추출
  - [x] `x-forwarded-for` 또는 `x-real-ip` 헤더 확인
  - [x] 프록시 환경 고려

- [x] **approveWholesaler() 함수**

  - [x] `wholesalers.status`를 `'approved'`로 업데이트
  - [x] `approved_at` 현재 시간으로 설정
  - [x] `rejection_reason`을 `null`로 설정
  - [x] `audit_logs` 테이블에 기록
    - [x] `action`: `'wholesaler_approve'`
    - [x] `target_type`: `'wholesaler'`
    - [x] `target_id`: `wholesalerId`
    - [x] `details`: JSONB (wholesaler_id, approved_at)
    - [x] `ip_address`: 추출한 IP 주소
  - [x] 에러 처리 및 로깅
  - [x] `revalidatePath()`로 캐시 무효화
  - [x] 목록 페이지로 리다이렉트

- [x] **rejectWholesaler() 함수**
  - [x] 반려 사유 유효성 검증 (최소 10자)
  - [x] `wholesalers.status`를 `'rejected'`로 업데이트
  - [x] `rejection_reason` 저장
  - [x] `approved_at`을 `null`로 설정
  - [x] `audit_logs` 테이블에 기록
    - [x] `action`: `'wholesaler_reject'`
    - [x] `target_type`: `'wholesaler'`
    - [x] `target_id`: `wholesalerId`
    - [x] `details`: JSONB (wholesaler_id, rejection_reason, rejected_at)
    - [x] `ip_address`: 추출한 IP 주소
  - [x] 에러 처리 및 로깅
  - [x] `revalidatePath()`로 캐시 무효화
  - [x] 목록 페이지로 리다이렉트

**커서 AI 프롬프트:**

```
도매사업자 승인/반려 Server Action을 만들어줘.

요구사항:
- approveWholesaler() 함수: status='approved', approved_at 설정
- rejectWholesaler() 함수: status='rejected', rejection_reason 설정
- audit_logs 테이블에 기록 (액션, 대상, IP 주소)
- IP 주소는 headers()에서 추출
- 에러 처리 및 로깅

파일: actions/admin/wholesaler-approval.ts
```

**테스트:**

- [ ] 승인 기능이 정상 작동하는지 확인
- [ ] 반려 기능이 정상 작동하는지 확인
- [ ] 감사 로그가 정상적으로 기록되는지 확인
- [ ] IP 주소가 정상적으로 기록되는지 확인

---

### 7단계: 승인/반려 폼 컴포넌트 ✅ 완료

**목적**: 승인/반려 버튼 및 반려 사유 입력 폼 UI

**파일**: `components/admin/WholesalerApprovalForm.tsx`

- [x] **컴포넌트 기본 구조**

  - [x] Client Component (`"use client"`)
  - [x] `wholesalerId`, `adminId` props
  - [x] 로딩 상태 관리 (`isApproving`, `isRejecting`)

- [x] **승인 버튼**

  - [x] 확인 모달 (`confirm()` 또는 Dialog)
  - [x] `approveWholesaler()` Server Action 호출
  - [x] 로딩 상태 표시
  - [x] 에러 처리 및 알림

- [x] **반려 버튼 및 모달**
  - [x] Dialog 컴포넌트 사용
  - [x] react-hook-form으로 폼 관리
  - [x] zod 스키마 검증
    - [x] 반려 사유: 최소 10자, 최대 500자
  - [x] `rejectWholesaler()` Server Action 호출
  - [x] 로딩 상태 표시
  - [x] 에러 처리 및 알림
  - [x] 폼 리셋

**커서 AI 프롬프트:**

```
도매사업자 승인/반려 폼 컴포넌트를 만들어줘.

요구사항:
- 승인 버튼 (확인 모달 포함)
- 반려 버튼 (반려 사유 입력 모달)
- react-hook-form 사용
- zod 스키마 검증
- 에러 처리 및 토스트 알림

파일: components/admin/WholesalerApprovalForm.tsx
```

**테스트:**

- [ ] 승인 버튼 클릭 시 확인 모달이 표시되는지 확인
- [ ] 반려 버튼 클릭 시 모달이 열리는지 확인
- [ ] 반려 사유 입력 시 유효성 검증이 작동하는지 확인
- [ ] 승인/반려 후 목록 페이지로 리다이렉트되는지 확인

---

## ✅ 최종 테스트 체크리스트

### 기능 테스트

- [ ] 관리자 계정으로 로그인 시 관리자 페이지 접근 가능
- [ ] 비관리자 계정으로 접근 시 홈으로 리다이렉트
- [ ] 도매 승인 대기 목록이 정상적으로 표시됨
- [ ] 도매 상세 정보가 정상적으로 표시됨
- [ ] 승인 기능이 정상 작동함
- [ ] 반려 기능이 정상 작동함 (반려 사유 입력 포함)
- [ ] 승인/반려 후 목록 페이지로 리다이렉트됨

### 감사 로그 테스트

- [ ] 승인 시 `audit_logs` 테이블에 기록됨
- [ ] 반려 시 `audit_logs` 테이블에 기록됨
- [ ] IP 주소가 정상적으로 기록됨
- [ ] 액션 타입이 정확히 기록됨 (`wholesaler_approve`, `wholesaler_reject`)

### 보안 테스트

- [ ] 모든 `/admin/*` 경로가 `requireAdmin()`으로 보호됨
- [ ] Server Action에서도 권한 재확인됨
- [ ] 비관리자 접근 시 적절히 차단됨

### 통합 테스트

- [ ] 도매사업자가 회원가입 후 `status='pending'`으로 저장됨
- [ ] 관리자가 승인하면 도매사업자의 `status='approved'`로 변경됨
- [ ] 도매사업자가 로그인 시 승인 상태 확인 가능 (도매 레이아웃에서 처리)

---

## 📝 참고 사항

### 구현 시 주의사항

1. **관리자 계정은 수동으로만 생성**

   - 자동 생성 기능은 보안상 위험
   - 프로덕션에서는 반드시 수동 생성

2. **감사 로그는 필수**

   - 모든 관리자 액션 기록
   - 나중에 문제 발생 시 추적 가능

3. **에러 처리**

   - 사용자에게 친화적인 에러 메시지
   - 개발자용 상세 로그는 서버에만 기록

4. **프로덕션 배포 전**
   - 관리자 권한 체크 테스트
   - 승인/반려 기능 테스트
   - 감사 로그 기록 확인

### 다음 단계 (선택사항)

- [ ] 감사 로그 조회 페이지 (`/admin/audit-logs`)
- [ ] CS 티켓 관리 페이지 (`/admin/cs/tickets`)
- [ ] 계정 관리 페이지 (`/admin/users`)
- [x] 관리자 대시보드 (`/admin/dashboard`) ✅ 완료

---

## 🔗 관련 문서

- [관리자 페이지 가이드라인](./admin.md) - 상세 구현 가이드
- [도매 페이지 가이드라인](./WS_Guideline.md) - 도매 페이지 전체 가이드
- [PRD 문서](../../PRD.md) - 프로젝트 요구사항
- [데이터베이스 스키마](../../../supabase/migrations/mk_schema2.sql) - DB 구조

---

**작성일**: 2025-01-XX  
**최종 업데이트**: 2025-01-27
