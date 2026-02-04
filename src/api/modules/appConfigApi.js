/**
 * 앱 설정 관련 API
 */
import { http } from "../http";

/**
 * 서버 설정 정보 조회
 */
async function fetchAppInfo() {
  return http.get("/api/app/info");
}

export const appConfigApi = {
  fetchAppInfo,
};

export default appConfigApi;
