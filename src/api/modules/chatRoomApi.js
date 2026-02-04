/**
 * ============================================================
 * [API 모듈] 대화방(Chat Room) 관련 API - SIMPLE
 * ============================================================
 *
 * 위치: /api/modules/chatRoomApi.js
 *
 * 역할:
 * - 클라이언트에서 백엔드의 /api/chat/rooms/* 엔드포인트 호출
 * - http.js 인터셉터 사용 (Authorization 헤더 자동 처리)
 * - multipart/form-data 처리는 하지 않음 (JSON 요청만)
 * - 응답 데이터를 그대로 반환
 *
 * 구조:
 * - 각 함수는 http.js를 통해 직접 API 호출
 * - 에러는 호출자에게 throw (프록시 계층에서 처리)
 * - console.log로 기본 로깅만 수행
 *
 * ============================================================
 *
 * chatApi는 SSE 스트리밍 응답을 processStreamingResponse()로 처리하지만,
 * chatRoomApi는 일반 JSON 응답을 다루므로 더 간단함
 */

import { API_BASE_URL, ENV } from "@/utils/constants";
import { requestInterceptor } from "../interceptor";

/**
 * API 엔드포인트 결정 함수
 *
 * @param {string} localPath - 로컬/개발 환경 경로
 * @param {string} proxyPath - 프로덕션 프록시 경로
 * @returns {string} 실제 사용할 경로
 *
 * 로직:
 * - 개발 환경: localPath 사용 (백엔드 직접 연결)
 * - 프로덕션: proxyPath 사용 (Vercel 프록시 함수 사용)
 */
function getEndpoint(localPath, proxyPath) {
  if (ENV.IS_DEVELOPMENT) {
    return localPath;
  } else {
    return proxyPath;
  }
}

/**
 * ============================================================
 * ✅ validateAgentIds - Agent 이름으로 필터링
 * ============================================================
 *
 * 역할:
 * - agents[].name에 제외할 문자열이 포함되면 → agents = []
 * - 예: "[RELEASE]OCI WEB Portal" → 일반 채팅이므로 agents = []
 *
 * 🔴 핵심:
 * - EXCLUDED_AGENT_NAMES 배열에 포함된 문자열이 agent.name에 있으면
 * - agents 배열 전체를 빈 배열로 변환
 * - 이렇게 하면 일반 채팅방으로 분류됨 (Agent 태그 안 나옴)
 *
 * @param {Array} agents - API 응답의 agents 배열
 * @returns {Array} 검증된 agents 배열 (없으면 빈 배열)
 */
function validateAgentIds(agents) {
  console.group("🔍 [validateAgentIds] Agent 이름 검증 시작");

  // 1️⃣ agents가 없으면 그냥 반환
  if (!agents || !Array.isArray(agents) || agents.length === 0) {
    console.log("📭 agents 배열이 비어있음");
    console.groupEnd();
    return agents;
  }

  console.log("📊 검증할 agents:", {
    count: agents.length,
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
    })),
  });

  // 🔴 제외할 문자열 리스트 (일반 채팅으로 분류될 Agent들)
  // 이 문자열이 agents[].name에 포함되면 agents = []로 변환
  const EXCLUDED_AGENT_NAMES = [
    "WEB Portal", // "[RELEASE]OCI WEB Portal" 필터링
  ];

  console.log("📋 제외할 Agent 이름 목록:", EXCLUDED_AGENT_NAMES);

  // 2️⃣ agents의 name에 제외 문자열이 포함되는지 확인
  const hasExcludedName = agents.some((agent) =>
    EXCLUDED_AGENT_NAMES.some((excludedName) =>
      agent.name.includes(excludedName),
    ),
  );

  if (hasExcludedName) {
    // ❌ 제외 문자열 포함 → agents = []
    console.log("❌ Agent 이름에 제외 문자열 포함됨");
    agents.forEach((agent) => {
      const isExcluded = EXCLUDED_AGENT_NAMES.some((excludedName) =>
        agent.name.includes(excludedName),
      );
      console.log(
        `   ${agent.name}: ${isExcluded ? "❌ 제외됨" : "✅ 포함됨"}`,
      );
    });
    console.log("🔴 → agents를 빈 배열로 변환 (일반 채팅으로 분류됨)");
    console.groupEnd();
    return [];
  }

  // ✅ 모든 검증 통과
  console.log("✅ 모든 Agent가 포함되어야 할 이름임 - agents 그대로 반환");
  console.groupEnd();
  return agents;
}

/**
 * ============================================================
 * 대화방 목록 조회
 * ============================================================
 */
async function getChatRoomList(params = {}) {
  console.log("📋 [chatRoomApi] getChatRoomList 호출");
  console.log("params:", params);

  try {
    // 1️⃣ 엔드포인트 결정
    const endpoint = getEndpoint(
      "/api/chat/rooms/list",
      "/api/chatRoom?endpoint=list",
    );

    // 2️⃣ URL 구성
    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL && !endpoint.startsWith("http")) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    console.log("🌐 fullUrl:", fullUrl);

    // 3️⃣ 요청 본문
    const requestBody = {
      page: params.page || 0,
      size: params.size || 20,
      ...(params.status && { status: params.status }),
    };

    console.log("📝 requestBody:", requestBody);

    // 4️⃣ Config 준비
    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    // 5️⃣ Interceptor 적용 (Authorization 헤더 자동 추가)
    const configAfterInterceptor = requestInterceptor(config);

    console.log(
      "✅ Authorization 헤더:",
      configAfterInterceptor.headers.Authorization
        ? configAfterInterceptor.headers.Authorization.substring(0, 30) + "..."
        : "없음",
    );

    // 6️⃣ fetch 호출
    console.log("📤 fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("📥 응답 상태:", response.status);

    // 7️⃣ 응답 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ getChatRoomList 성공");

    return data;
  } catch (error) {
    console.error("❌ getChatRoomList 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 상세 조회
 * ============================================================
 *
 * 수정사항:
 * - validateAgentIds()로 Agent 이름 검증
 * - "[RELEASE]OCI WEB Portal" 같은 일반 Agent는 agents = []로 변환
 * - MainPage.vue에서 agents.length로 일반/Agent 채팅 판단
 */
async function getChatRoomDetail(roomId, params = {}) {
  console.log("📖 [chatRoomApi] getChatRoomDetail 호출");
  console.log("roomId:", roomId);
  console.log("params:", params);

  try {
    const endpoint = getEndpoint(
      "/api/chat/rooms/detail",
      "/api/chatRoom?endpoint=detail",
    );

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL && !endpoint.startsWith("http")) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    const requestBody = {
      roomId: roomId,
      page: params.page || 0,
      size: params.size || 50,
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("📤 fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("📥 응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    let data = await response.json();
    console.log("✅ getChatRoomDetail 성공 (검증 전):", data);

    // ============================================================
    // 🔴 핵심: validateAgentIds() 호출!
    // ============================================================
    console.log("");
    console.log("═══════════════════════════════════════════");
    console.log("🔴 [getChatRoomDetail] Agent 이름 검증 시작");
    console.log("═══════════════════════════════════════════");

    // Agent 이름 검증
    const validatedAgents = validateAgentIds(data.agents || []);

    // 검증된 agents로 업데이트
    data = {
      ...data,
      agents: validatedAgents, // ← agents: [] 또는 유효한 배열
    };

    console.log("");
    console.log("📊 최종 응답 데이터:");
    console.log("   room:", data.room?.id);
    console.log("   messages:", data.messages?.length || 0);
    console.log("   agents (검증됨):", {
      count: data.agents?.length || 0,
      agents: data.agents,
    });
    console.log("");

    return data;
  } catch (error) {
    console.error("❌ getChatRoomDetail 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 생성
 * ============================================================
 */
async function createChatRoom(params = {}) {
  console.log("➕ [chatRoomApi] createChatRoom 호출");
  console.log("params:", params);

  try {
    const endpoint = getEndpoint(
      "/api/chat/rooms/create",
      "/api/chatRoom?endpoint=create",
    );

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL && !endpoint.startsWith("http")) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    const requestBody = {
      ...(params.title && { title: params.title }),
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("📤 fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("📥 응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ createChatRoom 성공");

    return data;
  } catch (error) {
    console.error("❌ createChatRoom 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 제목 수정
 * ============================================================
 */
async function updateChatRoomTitle(roomId, title) {
  console.log("✏️ [chatRoomApi] updateChatRoomTitle 호출");
  console.log("roomId:", roomId);
  console.log("title:", title);

  try {
    const endpoint = getEndpoint(
      "/api/chat/rooms/update-title",
      "/api/chatRoom?endpoint=update-title",
    );

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL && !endpoint.startsWith("http")) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    const requestBody = {
      roomId: roomId,
      title: title,
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("📤 fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("📥 응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ updateChatRoomTitle 성공");

    return data;
  } catch (error) {
    console.error("❌ updateChatRoomTitle 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * 대화방 삭제
 * ============================================================
 */
async function deleteChatRoom(roomId) {
  console.log("🗑️ [chatRoomApi] deleteChatRoom 호출");
  console.log("roomId:", roomId);

  try {
    const endpoint = getEndpoint(
      "/api/chat/rooms/delete",
      "/api/chatRoom?endpoint=delete",
    );

    let fullUrl = endpoint;
    if (ENV.IS_DEVELOPMENT && API_BASE_URL && !endpoint.startsWith("http")) {
      fullUrl = `${API_BASE_URL}${endpoint}`;
    }

    const requestBody = {
      roomId: roomId,
    };

    const config = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    };

    const configAfterInterceptor = requestInterceptor(config);

    console.log("📤 fetch() 호출");
    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log("📥 응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ 에러 응답:", errorText);
      throw new Error(
        `API 에러: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();
    console.log("✅ deleteChatRoom 성공");

    return data;
  } catch (error) {
    console.error("❌ deleteChatRoom 실패:", error.message);
    throw error;
  }
}

/**
 * ============================================================
 * Export
 * ============================================================
 *
 * 사용 방식:
 * import { getChatRoomList, createChatRoom, ... } from "@/api/modules/chatRoomApi";
 *
 * 또는:
 * import * as chatRoomApi from "@/api/modules/chatRoomApi";
 * chatRoomApi.getChatRoomList()
 */

export {
  getChatRoomList,
  getChatRoomDetail,
  createChatRoom,
  updateChatRoomTitle,
  deleteChatRoom,
};

export default {
  getChatRoomList,
  getChatRoomDetail,
  createChatRoom,
  updateChatRoomTitle,
  deleteChatRoom,
};
