/**
 * ============================================================
 * [API 모듈] 유틸리티 API
 * ============================================================
 *
 * 역할:
 * - 데이터 암호화/복호화 (Jasypt)
 * - DB 접속 정보 등 민감 정보 암호화 도구
 *
 * 사용 예시:
 * import { utilApi } from '@/api/modules/utilApi'
 * const encrypted = await utilApi.encrypt("민감한_정보")
 *
 * 주의사항:
 * - 이 API는 보안이 중요한 정보를 암호화하기 위한 도구입니다
 * - 프론트엔드에서는 일반적으로 사용하지 않으며,
 *   백엔드 환경 설정이나 테스트 목적으로 사용됩니다
 */

import { http } from "../http";

/**
 * ============================================================
 * 1️⃣ 데이터 암호화
 * ============================================================
 *
 * 엔드포인트: POST /api/utils/jasypt/encrypt
 * 인증: 불필요 (공개 유틸리티)
 *
 * 역할:
 * - 평문 데이터를 Jasypt로 암호화합니다
 * - 결과는 ENC(...) 포맷으로 반환됩니다
 * - DB 설정 파일(application.yml) 등에 사용할 수 있습니다
 *
 * 요청 데이터:
 * "평문_문자열"  // JSON 문자열 형식
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: "ENC(암호화된_문자열)"
 * }
 *
 * 사용 예시:
 * const encrypted = await utilApi.encrypt("db_password_123")
 * console.log(encrypted.data)  // "ENC(xKjF8kSl2...)"
 *
 * @param {string} plainText - 암호화할 평문 문자열
 * @returns {Promise<Object>} 암호화된 데이터 (ENC(...) 포맷)
 */
async function encrypt(plainText) {
  // 평문 검증
  if (!plainText) {
    throw new Error("암호화할 텍스트가 없습니다");
  }

  return http.post("/api/utils/jasypt/encrypt", plainText);
}

/**
 * ============================================================
 * 2️⃣ 데이터 복호화
 * ============================================================
 *
 * 엔드포인트: POST /api/utils/jasypt/decrypt
 * 인증: 불필요 (공개 유틸리티)
 *
 * 역할:
 * - 암호화된 데이터를 복호화하여 평문으로 변환합니다
 * - ENC(...) 포맷의 암호화된 문자열을 입력받습니다
 *
 * 요청 데이터:
 * "ENC(암호화된_문자열)"  // JSON 문자열 형식
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: "복호화된_평문_문자열"
 * }
 *
 * 사용 예시:
 * const decrypted = await utilApi.decrypt("ENC(xKjF8kSl2...)")
 * console.log(decrypted.data)  // "db_password_123"
 *
 * @param {string} encryptedText - 복호화할 암호화된 문자열 (ENC(...) 포맷)
 * @returns {Promise<Object>} 복호화된 평문 데이터
 */
async function decrypt(encryptedText) {
  // 암호화된 텍스트 검증
  if (!encryptedText) {
    throw new Error("복호화할 텍스트가 없습니다");
  }

  // ENC(...) 포맷 검증 (선택사항)
  if (!encryptedText.startsWith("ENC(")) {
    console.warn("⚠️ 입력이 ENC(...) 포맷이 아닙니다");
  }

  return http.post("/api/utils/jasypt/decrypt", encryptedText);
}

// ============================================================
// Export
// ============================================================

export const utilApi = {
  encrypt,
  decrypt,
};

export default utilApi;
