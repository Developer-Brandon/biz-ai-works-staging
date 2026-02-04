/**
 * ============================================================
 * [Interceptor] HTTP 요청/응답 인터셉터 (Pinia Persistence 적용)
 * ============================================================
 *
 * 변경사항:
 * 1. localStorage 직접 접근 제거
 * 2. authStore에서 토큰 읽기 (Pinia Persistence 자동 관리)
 * 3. 401 에러 시 authStore reset 호출
 *
 * Vue2 vs Vue3:
 * - Vue2: this.$api 등으로 접근
 * - Vue3: import로 직접 사용 ✅
 *
 * 🔑 주의사항 (FormData 호환성):
 * - multipart/form-data는 Content-Type을 설정하지 않음
 * - 브라우저가 자동으로 boundary를 포함하여 설정
 * - requestInterceptor는 Authorization 헤더만 추가
 */

import { useAuthStore } from "@/stores/useAuthStore";

/**
 * ============================================================
 * 📤 요청 인터셉터 - 모든 요청에 Authorization 헤더 추가
 * ============================================================
 *
 * 변경사항:
 * - localStorage.getItem() 제거
 * - authStore.accessToken 사용 (Pinia Persistence 자동 복원)
 *
 * 역할:
 * 1. authStore에서 토큰 읽기
 * 2. Authorization 헤더에 추가
 * 3. FormData인 경우 Content-Type 설정 안 함 ✅
 *
 * 🔑 주의:
 * - FormData 요청: Content-Type 설정 금지 ❌
 * - JSON 요청: Content-Type 설정 필요 ✅
 * - 현재는 모두 fetch() 직접 사용하므로 Content-Type 처리 필요 없음
 *
 * @param {Object} config - 요청 설정 객체
 *   - method: string (GET, POST, etc)
 *   - headers: Object (요청 헤더)
 *   - body: FormData | JSON string | etc
 *
 * @returns {Object} 수정된 config 객체
 */
export function requestInterceptor(config) {
  console.group("📤 [requestInterceptor] Authorization 헤더 처리");
  console.log("📍 입력 config:", {
    method: config.method,
    headers: config.headers,
    bodyType: config.body?.constructor?.name || typeof config.body,
  });

  // ✅ authStore에서 토큰 가져오기 (Pinia Persistence 자동 복원됨)
  const authStore = useAuthStore();
  const token = authStore.accessToken;

  if (!token) {
    console.warn(
      "⚠️ 토큰이 없습니다. Authorization 헤더를 추가할 수 없습니다.",
    );
    console.warn(
      "💡 사용자가 로그인하지 않았거나 세션이 만료되었을 수 있습니다.",
    );
    console.groupEnd();
    return config;
  }

  // ✅ 토큰 정보 확인
  console.log("✅ 토큰 정보:", {
    exists: "✅",
    length: token.length,
    preview: token.substring(0, 30) + "...",
  });

  // ========== Authorization 헤더 추가 ==========
  // 🎯 headers 객체 초기화 (없으면 생성)
  if (!config.headers) {
    config.headers = {};
  }

  config.headers["Authorization"] = `Bearer ${token}`;

  console.log("✅ Authorization 헤더 추가됨:", {
    value: config.headers["Authorization"].substring(0, 50) + "...",
  });

  // ========== FormData 체크 ==========
  // 🔍 FormData인 경우 Content-Type을 설정하지 않음
  // (브라우저가 자동으로 boundary를 포함하여 설정)
  if (config.body instanceof FormData) {
    console.log("📎 FormData 감지됨:");
    console.log("   ✅ Content-Type 설정 스킵 (브라우저가 자동 처리)");

    // ❌ Content-Type을 설정하지 않음 (중요!)
    // 만약 설정되어 있다면 제거
    if (
      config.headers["Content-Type"] &&
      config.headers["Content-Type"].includes("multipart/form-data")
    ) {
      console.log("⚠️ FormData 요청인데 Content-Type이 명시되어 있음");
      console.log("   → 제거 예정 (브라우저 자동 처리)");
      // delete config.headers["Content-Type"]; // 필요시 주석 해제
    }
  } else {
    console.log("📄 FormData 아님:", {
      contentType: config.headers["Content-Type"] || "(설정되지 않음)",
    });
  }

  console.log("📍 반환 config:", {
    method: config.method,
    headers: config.headers,
    bodyType: config.body?.constructor?.name || typeof config.body,
  });

  console.groupEnd();

  return config;
}

/**
 * ============================================================
 * 📥 응답 인터셉터 - 응답 상태별 처리
 * ============================================================
 *
 * 변경사항:
 * - localStorage.removeItem() 제거
 * - authStore.logout() 호출 (상태 초기화 + localStorage 자동 정리)
 *
 * 역할:
 * 1. 2xx 성공: 데이터 반환
 * 2. 401 Unauthorized: 토큰 갱신 시도 또는 로그아웃
 * 3. 4xx, 5xx 에러: 에러 처리
 *
 * 🔑 주의:
 * - SSE 스트리밍 응답은 responseInterceptor를 우회함
 * - 따라서 이 인터셉터는 일반 JSON 응답에만 적용
 *
 * @param {Response} response - fetch() Response 객체
 * @returns {Promise<Object>} 처리된 응답 객체
 */
export async function responseInterceptor(response) {
  // ========== 응답 복제 (body는 한 번만 읽을 수 있음) ==========
  const clonedResponse = response.clone();

  // JSON 파싱 시도 (실패하면 빈 객체)
  let data = {};
  try {
    data = await clonedResponse.json();
  } catch (error) {
    console.warn("⚠️ JSON 파싱 실패:", error.message);
  }

  console.group("📥 [responseInterceptor] 응답 처리");
  console.log("📍 응답 정보:", {
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get("content-type"),
  });

  // ========== 상태별 처리 ==========
  if (response.ok) {
    console.log("✅ [2xx] 요청 성공");
    console.groupEnd();
    return handleSuccess(data, response.status);
  } else if (response.status === 401) {
    // ============================================================
    // 🔐 401 Unauthorized 처리
    // ============================================================
    console.log("🔐 [401] 인증 실패 - 토큰 갱신 또는 로그아웃 필요");

    const authStore = useAuthStore();

    // TODO: 토큰 갱신 시도 로직 추가하기
    // 현재는 즉시 로그아웃 처리
    console.log(
      "🔄 authStore.logout() 호출 - 상태 초기화 및 localStorage 정리",
    );
    authStore.logout();

    console.log("➡️ 로그인 페이지로 리다이렉트");
    window.location.href = "/"; // main page 경로

    console.groupEnd();
    return handleError(data, response.status);
  } else {
    // ❌ 4xx, 5xx 에러
    console.log(`❌ [${response.status}] 요청 실패`);
    if (response.status === 403) {
      console.log("🚫 권한 부족 (Forbidden)");
    } else if (response.status === 500) {
      console.log("⚠️ 서버 에러 (Internal Server Error)");
    }
    console.groupEnd();
    return handleError(data, response.status);
  }
}

/**
 * ============================================================
 * ✅ 성공 응답 처리
 * ============================================================
 *
 * @param {Object} data - 응답 데이터
 * @param {number} status - HTTP 상태 코드
 * @returns {Object} 정규화된 응답 객체
 */
function handleSuccess(data, status) {
  console.log(`✅ [${status}] 요청 성공, 응답 데이터 반환`);

  return {
    success: true,
    status,
    data: data.data || data, // data.data 또는 전체 응답
    message: data.message || "Success",
  };
}

/**
 * ============================================================
 * ❌ 에러 응답 처리
 * ============================================================
 *
 * @param {Object} data - 응답 데이터
 * @param {number} status - HTTP 상태 코드
 * @returns {Object} 정규화된 에러 객체
 */
function handleError(data, status) {
  console.error(`❌ [${status}] 요청 실패, 에러 정보 반환`);

  return {
    success: false,
    status,
    data: null,
    message: data.message || `Error ${status}`,
  };
}
