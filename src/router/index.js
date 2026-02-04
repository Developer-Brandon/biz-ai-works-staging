/**
 * * Vue3 라우터 설정 파일
 * 주요 특징
 * 1. createRouter & createWebHistory 사용
 * 2. routes 배열에 경로 정의
 * 3. 동적 impoort로 코드 스플리팅
 * 4. route guard(beforeEach)로 권한 관리 가능
 * 4-(1). 사용자 시나리오
 * - 로그인 하지 않은 사용자가 / 에 접근 시도 -> /login 으로 redirect
 * - 로그인한 사용자가 / 에 접근 시도 -> /main 으로 redirect
 * - 로그인 하지 않은 사용자가 /chat에 접근 시도 -> /login으로 redirect
 * - 로그인한 사용자가 /login에 접근 시도 -> /main 으로 redirect
 * 5. route 구조
 * 5-(1). 기본 구조
 *  * {
 *   path: '/url-경로',
 *   name: '라우트 이름',
 *   component: () => import('페이지 경로'),
 *   meta: { 메타 정보 }
 * }
 * 라우트 이름은 잘 명시해주면 나중에 path 기반으로 동적 routing안해도 되니까, name을 잘 지정하는게 좋음
 * 5-(2). 구조에 의거한 attribute
 * path: 사용자가 접근하는 URL
 * name: 프로그래밍 방식으로 이동할 때 사용
 * component: 동적 import로 코드 스플리팅 (성능 최적화) - 처음 app 실행 시 모든 component를 불러오지 않기 때문에 초기 bundle size가 확 준다.
 * meta: 라우트 메타데이터 (권한, 레이아웃 등)
 **/
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/model/dataStore";

// ==================== 라우트 정의 ====================
const routes = [
  // 1.auth route
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: {
      requiresAuth: false, // 로그인 필수 X
      layout: "AuthLayout", // 인증 레이아웃 사용
      title: "Biz.AI", // 페이지 제목
    },
  },
  // 2. main route - 채팅 페이지
  {
    path: "/",
    redirect: "/main", // / 접근 시 /main으로 리다이렉트
  },
  {
    path: "/main",
    name: "Main",
    component: () => import("@/pages/MainPage.vue"),
    meta: {
      requiresAuth: true, // 로그인 필수 O
      layout: "MainLayout", // 메인 레이아웃 사용
      title: "Biz.AI",
    },
  },
  // 3. notfound page - 404 페이지
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFound.vue"),
    meta: {
      requiresAuth: false,
      layout: "AuthLayout", // 인증 레이아웃 사용
      title: "페이지를 찾을 수 없습니다",
    },
  },
];

// ==================== 라우트 정의 후 인스턴스 생성 ====================
export const router = createRouter({
  // histroy mode : 깔끔한 URL 사용
  history: createWebHistory(import.meta.env.BASE_URL),
  // 배열 routes
  routes,
  // 페이지 전환 시 항상 최상단으로 스크롤
  scrollBehavior() {
    return { top: 0 };
  },
});

// ==================== 라우트 가드 - 이동 전 ====================
/**
 * router.beforeEach: 모든 라우트 전환 전에 실행
 *
 * 용도:
 * 1. 인증 확인 (로그인 필수 페이지 보호)
 * 2. 권한 확인
 * 3. 페이지 제목 설정
 * 4. 분석(Analytics) 기록
 */
router.beforeEach((to, from, next) => {
  console.group("🔐 [Router Guard] beforeEach");
  document.title = to.meta.title;
  const authStore = useAuthStore(); // Pinia 스토어
  const dataStore = useDataStore();
  const isAuthenticated = authStore.isLoggedIn;
  console.log("✅ 로그인 상태체크:", isAuthenticated);

  console.log("🔄 세션 필드 초기화 시작");
  dataStore.initializeSessionFields();

  // 1. 어디에서 접근하는지는모르지만, 로그인을 하지 않았는데 인증한 페이지로 접근한다면?
  // -> /login 페이지로 강제 이동
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.warn("🔒 인증 필요: /login으로 redirect");
    next("/login");
    return;
  }
  // 2. 어디서 접근하는지는 모르지만, 이미 로그인을 했는데 /login 페이지로 접근했다면?
  // -> /main 페이지로 강제이동
  if (isAuthenticated && to.path === "/login") {
    console.log("✅ 이미 로그인됨: /main으로 redirect");
    next("/main");
    return;
  }
  // 3.모든 조건 통과
  // -> 현재의 route에서 그냥 머무르기
  next();
});
// ==================== 라우트 가드 - 이동 후 ====================
/**
 * router.afterEach: 라우트 전환 완료 후 실행
 * 용도:
 * - 로딩 스피너 종료
 * - Analytics 이벤트 기록
 * - 스크롤 복원
 */
router.afterEach((to, from) => {
  console.log(`📍 페이지 이동: ${from.path} → ${to.path}`);

  // 개발 환경에서만 라우트 정보 출력
  if (import.meta.env.DEV || import.meta.env.PROD) {
    console.log("이전 라우트:", from.name);
    console.log("현재 라우트:", to.name);
    console.log("이전 경로:", from.path);
    console.log("현재 경로:", to.path);
    console.log("라우트 파라미터:", to.params);
    console.log("라우트 쿼리:", to.query);
  }
});
export default router;
