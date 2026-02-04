/**
 * Pinia 인증 스토어
 *
 * 주요 변경사항:
 * 1. import { saveData, getData, removeData } 제거
 * 2. import { STORAGE_KEYS } 제거
 * 3. 모든 saveData(), getData(), removeData() 호출 제거
 * 4. defineStore에 persist 옵션 추가
 * 5. 상태 변경만으로 자동 저장됨
 * 6. dataStore 호출을 module 최상단에서 함수 내부로 이동
 *
 * Vue2 vs Vue3:
 * [Vue2] Vuex: persist 플러그인 설정 후 modules별로 적용
 * [Vue3] Pinia: defineStore 바로 옆에 옵션으로 간단하게 적용
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useDataStore } from "@/stores/model/dataStore";

/**
 * useAuthStore: 인증 스토어
 *
 * 특징:
 * - 상태 변경 시 자동으로 localStorage에 저장됨
 * - 페이지 새로고침 시 자동으로 상태 복원됨
 * - localStorage.js 유틸 함수 불필요
 */
export const useAuthStore = defineStore(
  "auth",
  () => {
    /* ==================== State (상태) ==================== */

    /**
     * 현재 로그인한 사용자 정보
     *
     * 구조:
     * {
     *   id: string,
     *   email: string,
     *   name: string,
     *   role: string,
     *   accessToken: string,
     *   refreshToken: string,
     *   isInitialPassword: boolean
     * }
     */
    const user = ref(null);

    /**
     * 로그인 여부
     */
    const isLoggedIn = ref(false);

    /**
     * 로그인 처리 중 여부 (로딩)
     * 주의: persist에 포함하지 않음 (저장 불필요)
     */
    const isLoading = ref(false);

    /**
     * 에러 메시지
     * 주의: persist에 포함하지 않음
     */
    const error = ref(null);

    /**
     * "아이디 저장" 체크 여부
     */
    const rememberEmail = ref(false);

    /**
     * 저장된 이메일
     */
    const savedEmail = ref("");

    /**
     * 액세스 토큰
     */
    const accessToken = ref(null);

    /**
     * 리프레시 토큰
     */
    const refreshToken = ref(null);

    /* ==================== Getters (파생 데이터) ==================== */

    /**
     * 사용자 이름
     */
    const userName = computed(() => user.value?.name || "");

    /**
     * 사용자 이메일
     */
    const userEmail = computed(() => user.value?.email || "");

    /**
     * 사용자 직급
     */
    const userRole = computed(() => user.value?.role || "");

    /**
     * 토큰이 있는지 확인
     */
    const hasToken = computed(() => !!accessToken.value);

    /* ==================== Actions (메서드) ==================== */

    /**
     * ============================================================
     * 1️⃣ 인증 데이터 설정 (API 로그인 후)
     * ============================================================
     *
     * LoginPage.vue에서 authApi.login() 후 호출됩니다
     *
     * [변경사항]
     * - saveData() 호출 3개 제거
     * - 상태 변경만으로 Pinia가 자동 저장
     *
     * 사용 예시:
     * authStore.setAuthData({
     *   email: 'user@example.com',
     *   accessToken: 'jwt_token...',
     *   refreshToken: 'refresh_token...',
     *   isInitialPassword: false
     * })
     */
    function setAuthData(data) {
      try {
        console.log("🔐 [setAuthData] 인증 데이터 설정 중...");

        // 토큰 저장
        accessToken.value = data.accessToken;
        refreshToken.value = data.refreshToken;

        // 사용자 정보 구성
        const userData = {
          id: Date.now().toString(),
          email: data.email,
          name: extractNameFromEmail(data.email),
          role: "user",
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isInitialPassword: data.isInitialPassword || false,
        };

        // 상태 변경
        // ✅ 이 순간 Pinia Persistence가 자동으로 localStorage에 저장!
        user.value = userData;
        isLoggedIn.value = true;

        // ❌ 제거: saveData(STORAGE_KEYS.USER_SESSION, userData)
        // ❌ 제거: saveData(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken)
        // ❌ 제거: saveData(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)

        console.log("✅ [setAuthData] 완료:", userData.email);
      } catch (err) {
        console.error("❌ [setAuthData] 에러:", err);
        throw err;
      }
    }

    /**
     * ============================================================
     * 2️⃣ 로그인 처리 (기존 로컬 검증용)
     * ============================================================
     *
     * [변경사항]
     * - saveData() 호출 2개 제거
     * - removeData() 호출 1개 제거
     * - 상태 변경만으로 자동 저장
     */
    async function login(credentials) {
      isLoading.value = true;
      error.value = null;

      try {
        // 입력값 검증
        if (!credentials.email || !credentials.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        // 서버에 요청 (현재는 시뮬레이션: 1초 지연)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 시뮬레이션용 더미 사용자 데이터
        const mockUser = {
          id: Date.now().toString(),
          email: credentials.email,
          name: extractNameFromEmail(credentials.email),
          role: "admin",
          accessToken: "mock_token_" + Date.now(),
          refreshToken: "mock_refresh_token_" + Date.now(),
        };

        // 상태 변경
        // ✅ Pinia가 자동으로 저장
        user.value = mockUser;
        isLoggedIn.value = true;
        accessToken.value = mockUser.accessToken;
        refreshToken.value = mockUser.refreshToken;

        // "아이디 저장" 옵션 처리
        if (credentials.rememberEmail) {
          // ❌ 제거: saveData(STORAGE_KEYS.SAVED_EMAIL, credentials.email)
          savedEmail.value = credentials.email;
          rememberEmail.value = true;
        } else {
          // ❌ 제거: removeData(STORAGE_KEYS.SAVED_EMAIL)
          savedEmail.value = "";
          rememberEmail.value = false;
        }

        // ❌ 제거: saveData(STORAGE_KEYS.USER_SESSION, mockUser)
        // ❌ 제거: saveData(STORAGE_KEYS.ACCESS_TOKEN, mockUser.accessToken)
        // ❌ 제거: saveData(STORAGE_KEYS.REFRESH_TOKEN, mockUser.refreshToken)

        console.log("✅ [login] 로그인 성공:", mockUser.name);
        return true;
      } catch (err) {
        error.value = err.message || "로그인 실패";
        console.error("❌ [login] 에러:", error.value);
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * ============================================================
     * 3️⃣ 로그아웃
     * ============================================================
     *
     * [변경사항]
     * - removeData() 호출 3개 제거
     * - 상태를 null로 설정하면 Pinia가 자동 처리
     * - dataStore 호출을 함수 내부로 이동 (Pinia 초기화 문제 해결)
     */
    function logout() {
      console.log("🚪 [logout] 로그아웃 처리 중...");

      // Pinia가 이미 초기화된 상태에서 호출
      // 함수 내부에서 useDataStore() 호출 필요
      const dataStore = useDataStore();

      // 상태를 초기화
      // ✅ Pinia가 자동으로 localStorage 정리
      user.value = null;
      isLoggedIn.value = false;
      error.value = null;
      rememberEmail.value = false;
      savedEmail.value = "";
      accessToken.value = null;
      refreshToken.value = null;
      dataStore.aiAgentInfoList = [];

      // ❌ 제거: removeData(STORAGE_KEYS.USER_SESSION)
      // ❌ 제거: removeData(STORAGE_KEYS.ACCESS_TOKEN)
      // ❌ 제거: removeData(STORAGE_KEYS.REFRESH_TOKEN)

      console.log("✅ [logout] 로그아웃 완료");
    }

    /**
     * ============================================================
     * 4️⃣ 저장된 이메일 로드
     * ============================================================
     *
     * [변경사항]
     * - getData() 호출 제거
     * - Pinia가 이미 상태를 복원했으므로 불필요
     * - 하지만 명시적 처리를 위해 함수만 유지
     */
    function loadSavedEmail() {
      try {
        // Pinia Persistence가 이미 상태를 복원했으므로
        // 추가 처리는 불필요합니다
        if (savedEmail.value) {
          console.log("✅ [loadSavedEmail] 저장된 이메일:", savedEmail.value);
        }
      } catch (err) {
        console.warn("⚠️ [loadSavedEmail] 에러:", err);
      }
    }

    /**
     * ============================================================
     * 5️⃣ 이메일 저장 (수동)
     * ============================================================
     *
     * [변경사항]
     * - saveData() 호출 제거
     * - 상태 변경만 함
     */
    function saveEmail(email) {
      try {
        savedEmail.value = email;
        rememberEmail.value = true;
        // ❌ 제거: saveData(STORAGE_KEYS.SAVED_EMAIL, email)
        // ✅ 자동 저장
        console.log("✅ [saveEmail] 이메일 저장:", email);
      } catch (err) {
        console.error("❌ [saveEmail] 에러:", err);
      }
    }

    /**
     * ============================================================
     * 6️⃣ 저장된 이메일 초기화
     * ============================================================
     *
     * [변경사항]
     * - removeData() 호출 제거
     * - 상태를 초기값으로 변경
     */
    function clearSavedEmail() {
      try {
        savedEmail.value = "";
        rememberEmail.value = false;
        // ❌ 제거: removeData(STORAGE_KEYS.SAVED_EMAIL)
        // ✅ 자동 저장
        console.log("✅ [clearSavedEmail] 저장된 이메일 초기화");
      } catch (err) {
        console.error("❌ [clearSavedEmail] 에러:", err);
      }
    }

    /**
     * ============================================================
     * 7️⃣ 저장된 세션 복원
     * ============================================================
     *
     * [변경사항]
     * - getData() 호출 3개 제거
     * - Pinia Persistence가 자동으로 복원함
     * - 이 함수는 옵셔널 (호출해도 되고 안 해도 됨)
     */
    function restoreSession() {
      try {
        // Pinia Persistence가 이미 상태를 복원했으므로
        // 추가 처리는 불필요합니다
        if (isLoggedIn.value && user.value) {
          console.log("✅ [restoreSession] 세션 복원:", user.value.email);
        }
      } catch (err) {
        console.warn("⚠️ [restoreSession] 에러:", err);
      }
    }

    /**
     * ============================================================
     * 8️⃣ 토큰 갱신
     * ============================================================
     */
    function updateTokens(newAccessToken, newRefreshToken) {
      try {
        accessToken.value = newAccessToken;
        if (newRefreshToken) {
          refreshToken.value = newRefreshToken;
        }

        if (user.value) {
          user.value.accessToken = newAccessToken;
          if (newRefreshToken) {
            user.value.refreshToken = newRefreshToken;
          }
        }

        // ❌ 제거: saveData(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
        // ❌ 제거: saveData(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
        // ❌ 제거: saveData(STORAGE_KEYS.USER_SESSION, user.value)
        // ✅ 자동 저장

        console.log("✅ [updateTokens] 토큰 갱신 완료");
      } catch (err) {
        console.error("❌ [updateTokens] 에러:", err);
      }
    }

    /**
     * ============================================================
     * 9️⃣ 에러 메시지 초기화
     * ============================================================
     */
    function clearError() {
      error.value = null;
    }

    /**
     * ============================================================
     * 🔟 로그인 폼 초기화
     * ============================================================
     */
    function resetForm() {
      error.value = null;
    }

    /* ==================== 유틸리티 함수 ==================== */

    /**
     * 이메일에서 이름 추출
     * 예: "john.doe@example.com" → "John Doe"
     */
    function extractNameFromEmail(email) {
      try {
        const namePart = email.split("@")[0];
        const name = namePart
          .split(".")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return name;
      } catch (err) {
        return email;
      }
    }

    /* ==================== 반환 (Public API) ==================== */

    return {
      // ==================== State ====================
      user,
      isLoggedIn,
      isLoading,
      error,
      rememberEmail,
      savedEmail,
      accessToken,
      refreshToken,

      // ==================== Getters ====================
      userName,
      userEmail,
      userRole,
      hasToken,

      // ==================== Actions ====================
      setAuthData,
      login,
      logout,
      loadSavedEmail,
      saveEmail,
      clearSavedEmail,
      restoreSession,
      updateTokens,
      clearError,
      resetForm,
    };
  },
  {
    /**
     * ============================================================
     * 🔑 Pinia Persistence 설정
     * ============================================================
     *
     * 이 옵션으로 상태 저장 방식을 제어합니다.
     *
     * persist 옵션을 추가하면:
     * 1. 상태가 자동으로 localStorage에 저장됨
     * 2. 페이지 새로고침 시 자동으로 복원됨
     * 3. 보안상 필요한 상태만 선택 저장 가능
     */
    persist: {
      // 저장소 지정 (기본값: localStorage)
      // 필요시 sessionStorage로 변경 가능
      storage: localStorage,

      // 저장할 상태만 선택 (보안상 중요!)
      // 모든 상태를 저장하면 안 됨
      // isLoading, error는 저장하지 않음
      paths: [
        "user", // 사용자 정보
        "isLoggedIn", // 로그인 상태
        "accessToken", // 액세스 토큰
        "refreshToken", // 리프레시 토큰
        "rememberEmail", // 아이디 저장 여부
        "savedEmail", // 저장된 이메일
      ],

      // 브라우저 F12에서 노출되는 저장소 키 이름
      key: "biz-ai-works-auth",
    },
  },
);
