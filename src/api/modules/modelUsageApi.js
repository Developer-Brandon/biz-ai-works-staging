/**
 * ============================================================
 * [API 모듈] 모델 사용량 조회 API
 * ============================================================
 *
 * 역할:
 * - 로그인한 사용자의 AI 모델 일일 사용량 조회
 * - 환경별로 다른 엔드포인트 자동 선택
 *   - 로컬: http://172.190.116.61:18080/api/model/daily-usage (직접 백엔드)
 *   - 배포: /api/model/daily-usage (Vercel 프록시)
 *
 * 사용 예시:
 * import { modelUsageApi } from '@/api/modules/modelUsageApi'
 * const result = await modelUsageApi.getModelDailyUsage()
 *
 * 반환 데이터 사용:
 * const models = result.data
 * models.forEach(model => {
 *   console.log(model.provider)    // "azure_openai"
 *   console.log(model.modelName)   // "gpt-4"
 *   console.log(model.currentUsage) // 15 (오늘 사용한 횟수)
 *   console.log(model.remainingCalls) // 85 (남은 호출 건수)
 * })
 */

import { http } from "@/api/http";
import { ENV } from "@/utils/constants";

/**
 * ============================================================
 * 🎯 환경별 엔드포인트 결정 함수
 * ============================================================
 *
 * 역할:
 * - 현재 환경 (로컬/배포)에 따라 올바른 엔드포인트 반환
 *
 * 🔑 동작 원리:
 * - 로컬 개발: ENV.IS_DEVELOPMENT === true
 *   → 직접 백엔드로 요청
 *   → http.js의 API_BASE_URL이 "http://172.190.116.61:18080"이면 자동 추가
 *   → 최종 URL: "http://172.190.116.61:18080/api/model/daily-usage"
 *
 * - 배포 (Vercel): ENV.IS_DEVELOPMENT === false
 *   → Vercel의 프록시 함수로 요청
 *   → http.js의 API_BASE_URL이 없거나 현재 호스트 기준
 *   → 최종 URL: "https://example.vercel.app/api/model/daily-usage"
 *
 * 💡 주의:
 * http.post()를 호출하면 http.js에서:
 * 1. 상대 경로 URL을 인식
 * 2. API_BASE_URL이 있으면 자동으로 붙임
 * 3. requestInterceptor에서 Authorization 헤더 자동 추가
 *
 * @param {string} localPath - 로컬 상대 경로
 * @param {string} proxyPath - 배포 상대 경로 (보통 동일)
 * @returns {string} 올바른 엔드포인트
 *
 * @example
 * const endpoint = getEndpoint(
 *   "/api/model/daily-usage",  // 로컬
 *   "/api/model/daily-usage"   // 배포 프록시
 * );
 * // 로컬이면 "/api/model/daily-usage" 반환 (http.js에서 API_BASE_URL 추가)
 * // 배포면 "/api/model/daily-usage" 반환 (Vercel 프록시 호출)
 */
function getEndpoint(localPath, proxyPath) {
  if (ENV.IS_DEVELOPMENT) {
    console.log("🔨 로컬 환경: 직접 백엔드로 요청", localPath);
    return localPath;
  } else {
    console.log("🚀 배포 환경: Vercel 프록시로 요청", proxyPath);
    return proxyPath;
  }
}

/**
 * ============================================================
 * 1️⃣ 모델 일일 사용량 조회
 * ============================================================
 */
async function getModelDailyUsage() {
  const endpoint = getEndpoint(
    "/api/model/daily-usage", // 로컬: 상대 경로 (http.js에서 API_BASE_URL 추가)
    "/api/model/usage", // 배포: Vercel 프록시 경로
  );
  console.group("📊 [모델 사용량 API] 요청 시작");
  console.log("엔드포인트:", endpoint);
  console.log("환경:", ENV.IS_DEVELOPMENT ? "로컬" : "배포");
  console.groupEnd();
  return http.post(endpoint, {});
}

// ============================================================
// Export
// ============================================================

export const modelUsageApi = {
  getModelDailyUsage,
};

export default modelUsageApi;
