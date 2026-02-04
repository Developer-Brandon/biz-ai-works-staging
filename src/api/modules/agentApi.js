/**
 * ============================================================
 * [API 모듈] AI Agent 조회 API
 * ============================================================
 */

import { http } from "@/api/http";
import { ENV } from "@/utils/constants";

/**
 * ============================================================
 * 환경별 엔드포인트 결정 함수
 * ============================================================
 *
 * 역할:
 * - 현재 환경 (로컬/배포)에 따라 올바른 엔드포인트 반환
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

// ============================================================
// 1️⃣ AI Agent 목록 조회
// ============================================================

async function getAgentList(options = {}) {
  // 🔀 환경별 엔드포인트 자동 선택
  // ✅ 배포 시 /api/agent/status로 프록시 함수 호출
  const endpoint = getEndpoint(
    "/api/chat/agents/list", // 로컬: 직접 백엔드
    "/api/agent/status", // 배포: Vercel 프록시 → 백엔드로 자동 전달
  );

  try {
    console.group("🔄 [Agent List API] 요청 시작");

    // 요청 파라미터 설정 (기본값 포함)
    const requestData = {
      mode: options.mode || "agent",
      status: options.status || "normal",
      search: options.search || "", // 빈 문자열이면 검색 없음
    };

    console.log("📤 요청 파라미터:", requestData);

    // API 호출
    const response = await http.post(endpoint, requestData);

    console.log("📥 API 응답:", response);

    // 응답 검증
    if (!response.success) {
      throw new Error(
        response.message || "에이전트 목록을 불러올 수 없습니다.",
      );
    }

    console.log("✅ 에이전트 목록 조회 성공:", response.data);
    console.groupEnd();

    return response; // { agents: Array, total: number }
  } catch (error) {
    console.error("❌ [Agent List API] 오류 발생:", error);
    console.groupEnd();
    throw error;
  }
}

// ============================================================
// 2️⃣ AI Agent 상세 조회
// ============================================================

async function getAgentDetail(agentId) {
  // 🔀 환경별 엔드포인트 자동 선택
  // ✅ 배포 시 /api/agent/status로 프록시 함수 호출 (detail 감지)
  const endpoint = getEndpoint(
    "/api/chat/agents/detail", // 로컬: 직접 백엔드
    "/api/agent/status?type=detail", // 배포: Vercel 프록시 → 백엔드로 자동 전달
  );

  try {
    console.group("🔄 [Agent Detail API] 요청 시작");

    const requestData = { agentId };

    console.log("📤 요청 파라미터:", requestData);

    const response = await http.post(endpoint, requestData);

    console.log("📥 API 응답:", response);

    if (!response.success) {
      throw new Error(
        response.message || "에이전트 정보를 불러올 수 없습니다.",
      );
    }

    console.log("✅ 에이전트 상세 조회 성공:", response.data);
    console.groupEnd();

    return response.data;
  } catch (error) {
    console.error("❌ [Agent Detail API] 오류 발생:", error);
    console.groupEnd();
    throw error;
  }
}

export const agentApi = {
  getAgentList,
  getAgentDetail,
};

export default agentApi;
