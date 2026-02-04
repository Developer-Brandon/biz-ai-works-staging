import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import { router } from "@/router";

/**
 * 전역 스타일 import
 */
import "@/assets/styles/whole_variables.scss";
import "@/assets/styles/global/whole_globals.scss";

/* ==================== Vue 애플리케이션 초기화 ==================== */
const app = createApp(App);
const pinia = createPinia();
/* ==================== Pinia 스토어 설정 ==================== */
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
/* ==================== 전역 프로퍼티 설정 ==================== */

app.config.globalProperties.$appName = "Biz.AI";

/**
 * 추가 전역 프로퍼티 예시 (필요시 추가)
 */
// app.config.globalProperties.$apiBaseUrl = "https://api.example.com";
// app.config.globalProperties.$version = "1.0.0";

/* ==================== 애플리케이션 마운트 ==================== */

/**
 * #app 엘리먼트에 Vue 애플리케이션을 마운트합니다.
 *
 * public/index.html의 <div id="app"></div>에 마운트됩니다.
 */
app.mount("#app");

/**
 * 마운트 후 확인 (개발, 운영 환경)
 */
if (import.meta.env.DEV) {
  console.log("✅ [개발] Vue3 애플리케이션 초기화 완료");
  console.log("🎨 스타일 시스템: SCSS (@forward/@use)");
  console.log("🔧 상태관리: Pinia");
  console.log("📦 개발 서버: http://localhost:5173");
}

if (import.meta.env.PROD) {
  console.log("✅ [운영] Vue3 애플리케이션 초기화 완료");
  console.log("🎨 스타일 시스템: SCSS (@forward/@use)");
  console.log("🔧 상태관리: Pinia");
  console.log("📦 운영 서버: https://biz-ai-works.vercel.app/");
}
