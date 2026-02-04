/**
 * ============================================================
 * [API 모듈] 앱 설정 관련 API
 * ============================================================
 *
 * 역할:
 * - 서버 설정(/api/app/info) 요청
 * - 엔드포인트별 함수 그룹화
 * - 요청/응답 데이터 구조 정의
 *
 * 사용 예시:
 * import { appConfigApi } from '@/api/modules/appConfigApi'
 * const result = await appConfigApi.fetchAppInfo()
 */
import { http } from "../http";

/**
 * 서버 설정 정보 조회
 *
 * 엔드포인트: GET /api/app/info
 *
 * 응답 예시:
 * {
 *   success: true,
 *   status: 200,
 *   data: {
 *     info: {
 *       common: { ... },
 *       login: { ... },
 *       main: { ... }
 *     }
 *   }
 * }
 *
 * @returns {Promise<Object>} 앱 설정 데이터
 */
async function fetchAppInfo() {
  return http.get("/api/app/info");
}

/**
 * AI 모델 목록 조회
 * 엔드포인트: GET /api/app/models
 * @returns {Promise<Object>}
 */
async function fetchAiModels() {
  return http.get("/api/app/models");
}

/**
 * AI 에이전트 카드 목록 조회 (예시)
 * 엔드포인트: GET /api/app/agents
 * @returns {Promise<Object>}
 */
async function fetchAiAgents() {
  return http.get("/api/app/agents");
}

// ============================================================
// Export
// ============================================================
export const appConfigApi = {
  fetchAppInfo,
  fetchAiModels,
  fetchAiAgents,
};

export default appConfigApi;
