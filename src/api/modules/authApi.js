/**
 * ============================================================
 * [API 모듈] 인증 관련 API
 * ============================================================
 *
 * 역할:
 * - 로그인, 토큰 갱신, 비밀번호 변경 등 인증 관련 API
 * - RSA Public Key 조회
 * - 초기 비밀번호 변경
 *
 * 사용 예시:
 * import { authApi } from '@/api/authApi'
 * const result = await authApi.login(encryptedData, encryptedAesKey, iv)
 *
 * Vue2 vs Vue3:
 * - Vue2: 별도의 auth 서비스 클래스 사용
 * - Vue3: 함수형 API 모듈 (더 간단하고 트리샤킹 용이)
 *
 * 환경 자동 감지:
 * - 로컬 개발: Vite proxy 사용 (상대 경로 /api/...)
 * - 배포 환경: Vercel 프록시 사용 (/api/auth/... → api/auth/login-payload.js)
 */

import { http } from "../http";
import { API_BASE_URL, ENV } from "@/utils/constants"; // ← 여기서만 import

/**
 * ============================================================
 * 🔧 내부 함수: 환경에 따라 올바른 엔드포인트 반환
 * ============================================================
 *
 * 동작 원리:
 * 1. 로컬 개발 (npm run dev):
 *    - isDevelopment = true
 *    - 원본 백엔드 직접 호출 (/api/auth/test/generate-login-payload)
 *
 * 2. 배포 환경 (Vercel):
 *    - isDevelopment = false
 *    - Vercel 프록시 함수 사용 (/api/auth/login-payload → api/auth/login-payload.js)
 *
 * @param {string} localPath - 로컬/원본 백엔드 경로
 * @param {string} proxyPath - Vercel 프록시 경로
 * @returns {string} 환경에 맞는 최종 엔드포인트
 */
function getEndpoint(localPath, proxyPath) {
  if (ENV.IS_DEVELOPMENT) {
    // ← 변경
    return localPath;
  } else {
    return `${API_BASE_URL}${proxyPath}`;
  }
}

/**
 * ============================================================
 * 1️⃣ RSA Public Key 조회
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/public-key
 * 엔드포인트 (배포): POST /api/auth/public-key (Vercel 프록시)
 * 인증: 불필요
 *
 * 역할:
 * - 로그인 시 사용할 RSA Public Key를 조회합니다
 * - 조회한 Public Key로 AES Key를 암호화하여 전송합니다
 *
 * 응답 데이터 구조:
 * {
 *   success: true,
 *   data: {
 *     publicKey: "Base64로_인코딩된_RSA_Public_Key",
 *     algorithm: "RSA",
 *     keySize: 3072,
 *     format: "X.509"
 *   }
 * }
 *
 * @returns {Promise<Object>} RSA Public Key 정보
 */
async function getPublicKey() {
  // 🔀 환경별 엔드포인트 자동 선택
  const endpoint = getEndpoint(
    "/api/auth/public-key", // 로컬/원본 백엔드
    "/api/auth/public-key", // Vercel 프록시
  );

  console.log(`📤 [RSA Public Key 조회] ${endpoint}`);
  return http.post(endpoint, {});
}

/**
 * ============================================================
 * 2️⃣ 로그인 (하이브리드 암호화)
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/login
 * 엔드포인트 (배포): POST /api/auth/login (Vercel 프록시)
 * 인증: 불필요 (로그인 전이므로)
 *
 * 암호화 방식:
 * 1. 비밀번호를 SHA-256으로 해싱
 * 2. JSON {email, hashedPassword}을 AES로 암호화
 * 3. AES Key를 RSA Public Key로 암호화
 * 4. 암호화된 데이터, AES Key, IV를 전송
 *
 * 응답 헤더:
 * - Authorization: Bearer {accessToken}
 * - RefreshToken: {refreshToken}
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {
 *     accessToken: "JWT_TOKEN",
 *     refreshToken: "REFRESH_TOKEN",
 *     tokenType: "Bearer",
 *     expiresIn: 3600,
 *     isInitialPassword: false
 *   }
 * }
 *
 * @param {string} encryptedData - AES로 암호화된 JSON 데이터 (Base64)
 * @param {string} encryptedAesKey - RSA로 암호화된 AES Key (Base64)
 * @param {string} iv - AES IV (12 bytes, Base64)
 * @returns {Promise<Object>} 로그인 응답 (accessToken, refreshToken 등)
 */
async function login(encryptedData, encryptedAesKey, iv) {
  // 🔀 환경별 엔드포인트 자동 선택
  const endpoint = getEndpoint(
    "/api/auth/login", // 로컬/원본 백엔드
    "/api/auth/login", // Vercel 프록시
  );

  console.log(`📤 [로그인] ${endpoint}`);
  return http.post(endpoint, {
    encryptedData,
    encryptedAesKey,
    iv,
  });
}

/**
 * ============================================================
 * 3️⃣ 토큰 갱신
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/refresh
 * 엔드포인트 (배포): POST /api/auth/refresh (Vercel 프록시)
 * 인증: 필요 (Bearer Token)
 *
 * 역할:
 * - Refresh Token을 사용하여 새로운 Access Token 발급
 * - Access Token 만료 시 사용
 *
 * 응답 헤더:
 * - Authorization: Bearer {newAccessToken}
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {}
 * }
 *
 * @returns {Promise<Object>} 갱신된 토큰 정보
 */
async function refresh() {
  // 🔀 환경별 엔드포인트 자동 선택
  const endpoint = getEndpoint(
    "/api/auth/refresh", // 로컬/원본 백엔드
    "/api/auth/refresh", // Vercel 프록시
  );

  console.log(`📤 [토큰 갱신] ${endpoint}`);
  return http.post(endpoint, {});
}

/**
 * ============================================================
 * 4️⃣ 비밀번호 변경
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/change-password
 * 엔드포인트 (배포): POST /api/auth/change-password (Vercel 프록시)
 * 인증: 필요 (Bearer Token)
 *
 * 역할:
 * - 로그인한 사용자의 비밀번호 변경
 * - 현재 비밀번호 확인 후 변경
 *
 * 요청 데이터:
 * {
 *   currentPassword: "SHA256_해시된_현재_비밀번호",
 *   newPassword: "새로운_비밀번호",
 *   confirmPassword: "새로운_비밀번호_확인",
 *   passwordMatch: true
 * }
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {
 *     success: true,
 *     message: "비밀번호가 변경되었습니다"
 *   }
 * }
 *
 * @param {Object} passwordData - 비밀번호 변경 데이터
 * @param {string} passwordData.currentPassword - SHA256 해시된 현재 비밀번호
 * @param {string} passwordData.newPassword - 새로운 비밀번호 (최소 8자)
 * @param {string} passwordData.confirmPassword - 새로운 비밀번호 확인
 * @returns {Promise<Object>} 비밀번호 변경 결과
 */
async function changePassword(passwordData) {
  // 필수 필드 검증
  if (!passwordData.currentPassword || !passwordData.newPassword) {
    throw new Error("currentPassword와 newPassword는 필수입니다");
  }

  // 비밀번호 길이 검증
  if (passwordData.newPassword.length < 8) {
    throw new Error("새 비밀번호는 최소 8자 이상이어야 합니다");
  }

  // 비밀번호 일치 검증
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    throw new Error("새 비밀번호가 일치하지 않습니다");
  }

  // 🔀 환경별 엔드포인트 자동 선택
  const endpoint = getEndpoint(
    "/api/auth/change-password", // 로컬/원본 백엔드
    "/api/auth/change-password", // Vercel 프록시
  );

  console.log(`📤 [비밀번호 변경] ${endpoint}`);
  return http.post(endpoint, {
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword,
    passwordMatch: true,
  });
}

/**
 * ============================================================
 * 5️⃣ 초기 비밀번호 변경
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/change-initial-password
 * 엔드포인트 (배포): POST /api/auth/change-initial-password (Vercel 프록시)
 * 인증: 불필요 (초기 로그인 후 비밀번호 변경 시)
 *
 * 역할:
 * - 초기(임시) 비밀번호를 새 비밀번호로 변경
 * - 로그인 후 isInitialPassword가 true일 때 사용
 *
 * 요청 데이터:
 * {
 *   email: "user@example.com",
 *   currentPassword: "SHA256_해시된_초기_비밀번호",
 *   newPassword: "새로운_비밀번호",
 *   confirmPassword: "새로운_비밀번호_확인",
 *   passwordMatch: true
 * }
 *
 */
async function changeInitialPassword(passwordData) {
  // 필수 필드 검증
  if (
    !passwordData.email ||
    !passwordData.currentPassword ||
    !passwordData.newPassword
  ) {
    throw new Error("email, currentPassword, newPassword는 필수입니다");
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(passwordData.email)) {
    throw new Error("유효한 이메일 주소를 입력하세요");
  }

  // 비밀번호 길이 검증
  if (passwordData.newPassword.length < 8) {
    throw new Error("새 비밀번호는 최소 8자 이상이어야 합니다");
  }

  // 비밀번호 일치 검증
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    throw new Error("새 비밀번호가 일치하지 않습니다");
  }

  // 🔀 환경별 엔드포인트 자동 선택
  const endpoint = getEndpoint(
    "/api/auth/change-initial-password", // 로컬/원본 백엔드
    "/auth/change-initial-password", // Vercel 프록시
  );

  console.log(`📤 [초기 비밀번호 변경] ${endpoint}`);
  return http.post(endpoint, {
    email: passwordData.email,
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    confirmPassword: passwordData.confirmPassword,
    passwordMatch: true,
  });
}

/**
 * ============================================================
 * 6️⃣ 테스트용: 로그인 페이로드 생성
 * ============================================================
 *
 * 엔드포인트 (로컬): POST /api/auth/test/generate-login-payload
 * 엔드포인트 (배포): POST /api/auth/login-payload (Vercel 프록시)
 * 인증: 불필요
 *
 * 역할:
 * - 개발/테스트용 API
 * - 평문 이메일/비밀번호를 받아 암호화된 페이로드 자동 생성
 * - 실제 개발 시 이 API로 암호화된 데이터를 받아 login() 호출
 *
 * 요청 데이터:
 * {
 *   email: "user@example.com",
 *   password: "plainPassword123"
 * }
 *
 * 응답 바디:
 * {
 *   success: true,
 *   data: {
 *     encryptedData: "Base64...",
 *     encryptedAesKey: "Base64...",
 *     iv: "Base64..."
 *   }
 * }
 *
 * Vue2 vs Vue3:
 * - Vue2: 서비스 클래스에서 직접 http 호출
 * - Vue3: 함수형으로 간단하게 호출 (더 직관적)
 *
 * @param {Object} credentials - 로그인 정보 (평문)
 * @param {string} credentials.email - 이메일
 * @param {string} credentials.password - 비밀번호 (평문)
 * @returns {Promise<Object>} 암호화된 페이로드
 */
async function generateLoginPayload(credentials) {
  // 🔀 환경별 엔드포인트 자동 선택
  // ⚠️ 주의: 로컬과 배포의 경로가 다름!
  const endpoint = getEndpoint(
    "/api/auth/test/generate-login-payload", // 로컬/원본 백엔드
    "/api/auth/login-payload", // Vercel 프록시
  );

  console.log(`📤 [로그인 페이로드 생성] ${endpoint}`);
  console.log(`🌐 환경: ${ENV.IS_DEVELOPMENT ? "로컬" : "배포"}`); // ← 변경

  console.log(`📤 [로그인 페이로드 생성] ${endpoint}`);
  return http.post(endpoint, {
    email: credentials.email,
    password: credentials.password,
  });
}

// ============================================================
// Export
// ============================================================

export const authApi = {
  getPublicKey,
  login,
  refresh,
  changePassword,
  changeInitialPassword,
  generateLoginPayload,
};

export default authApi;
