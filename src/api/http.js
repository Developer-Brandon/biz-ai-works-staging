/**
 * ============================================================
 * [공통 API 클라이언트] HTTP 요청 관리
 * ============================================================
 */

import {
  API_BASE_URL,
  TIMEOUTS,
  DEFAULT_HEADERS,
  ENV,
} from "@/utils/constants";
import { requestInterceptor, responseInterceptor } from "./interceptor";

/**
 * 통합 fetch 함수
 *
 * 🎯 중요:
 * requestInterceptor의 반환값을 반드시 사용해야 함!
 */
async function request(url, options = {}) {
  let fullUrl = url;

  if (!url.startsWith("http")) {
    if (API_BASE_URL) {
      fullUrl = `${API_BASE_URL}${url}`;
    }
  }

  console.log(`📡 [HTTP ${options.method || "GET"}] ${fullUrl}`);

  // ============================================================
  // 🎯 기본 설정 병합
  // ============================================================
  const config = {
    method: "GET",
    headers: { ...DEFAULT_HEADERS },
    ...options,
  };

  console.log("📌 config (인터셉터 적용 전):", config);
  console.log("   config.headers:", config.headers);

  // ============================================================
  // 🎯 requestInterceptor 호출 - 반환값을 사용해야 함!
  // ============================================================

  const configAfterInterceptor = requestInterceptor(config);

  console.log("📌 config (인터셉터 적용 후):", configAfterInterceptor);
  console.log("   config.headers:", configAfterInterceptor.headers);
  console.log(
    "   Authorization 헤더:",
    configAfterInterceptor.headers["Authorization"] ? "✅ 있음" : "❌ 없음"
  );

  try {
    // 🌐 실제 API 호출
    console.log("📤 fetch 호출 직전 config:", configAfterInterceptor);

    const response = await fetch(fullUrl, configAfterInterceptor);

    console.log(`📥 응답 받음 (상태: ${response.status})`);

    // 응답 인터셉터
    const result = await responseInterceptor(response);

    return result;
  } catch (error) {
    console.error("❌ [Network Error]", error);

    return {
      success: false,
      status: 0,
      code: "NETWORK_ERROR",
      data: null,
      message: error.message || "Network error",
    };
  }
}

/**
 * GET 요청
 */
async function get(url, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  console.log("🔍 GET 파라미터:", params);

  return request(fullUrl, {
    method: "GET",
  });
}

/**
 * POST 요청
 */
async function post(url, data = {}) {
  console.log("📝 POST 바디:", data);

  return request(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT 요청
 */
async function put(url, data = {}) {
  console.log("✏️ PUT 바디:", data);

  return request(url, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 요청
 */
async function deleteRequest(url) {
  return request(url, {
    method: "DELETE",
  });
}

/**
 * PATCH 요청
 */
async function patch(url, data = {}) {
  console.log("🔧 PATCH 바디:", data);

  return request(url, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================================
// Export
// ============================================================

export const http = {
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
  request,
};

export default http;
