/**
 * @file daum.d.ts
 * @description 카카오 우편번호 서비스 (Daum Postcode API) 타입 정의
 *
 * 카카오 우편번호 서비스는 API 키 없이 무료로 사용할 수 있는 주소 검색 서비스입니다.
 * https://postcode.map.daum.net/guide
 */

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: (state: "COMPLETE_CLOSE" | "FORCE_CLOSE") => void;
        width?: string;
        height?: string;
        maxSuggestItems?: number;
        theme?: {
          bgColor?: string;
          searchBgColor?: string;
          contentBgColor?: string;
          pageBgColor?: string;
          textColor?: string;
          queryTextColor?: string;
          postcodeTextColor?: string;
          emphTextColor?: string;
          outlineColor?: string;
        };
        focusInput?: boolean;
        focusContent?: boolean;
        autoMapping?: boolean;
        hideMapBtn?: boolean;
        hideEngBtn?: boolean;
        alwaysShowEngAddr?: boolean;
        submitMode?: boolean;
        shorthand?: boolean;
        pleaseReadGuide?: number;
        pleaseReadGuideTimer?: number;
        maxSuggestItems?: number;
        showMoreHName?: boolean;
        hideErrorMsg?: boolean;
      }) => {
        open: () => void;
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

/**
 * 카카오 우편번호 검색 결과 데이터
 */
export interface DaumPostcodeData {
  /** 우편번호 (5자리) */
  zonecode: string;
  /** 기본 주소 (도로명 주소 또는 지번 주소) */
  address: string;
  /** 도로명 주소 */
  roadAddress: string;
  /** 지번 주소 */
  jibunAddress: string;
  /** 사용자가 선택한 주소 타입 (R: 도로명, J: 지번) */
  userSelectedType: "R" | "J";
  /** 건물명 */
  buildingName: string;
  /** 법정동명 (법정리명) */
  bname: string;
  /** 법정동 코드 */
  bcode: string;
  /** 시/도 */
  sido: string;
  /** 시/군/구 */
  sigungu: string;
  /** 시/군/구 코드 */
  sigunguCode: string;
  /** 읍/면/동 */
  bname1: string;
  /** 리 */
  bname2: string;
  /** 도로명 */
  roadname: string;
  /** 도로명 코드 */
  roadnameCode: string;
  /** 건물번호 */
  buildingCode: string;
  /** 우편번호 (6자리, 구 우편번호) */
  postcode: string;
  /** 참고항목 */
  extraAddress: string;
  /** 참고항목 (건물명) */
  apartment: string;
  /** 참고항목 (법정동명) */
  jibunAddress1: string;
  /** 참고항목 (법정리명) */
  jibunAddress2: string;
  /** 참고항목 (도로명) */
  roadnameAddress: string;
  /** 참고항목 (건물번호) */
  roadnameAddress1: string;
  /** 참고항목 (건물명) */
  roadnameAddress2: string;
}

export {};

