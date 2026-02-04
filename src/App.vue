<template>
  <!-- 
    설정 로딩 중: 로딩 화면 표시
  -->
  <LoadingOverlay
    :isLoading="isLoading"
    :loadingText="`화면을 구성하고 있습니다`"
    :primaryColor="configStore.mainColorHexCode"
    :hoverColor="configStore.mainHoverColorHexCode"
  />
  <!-- 
    설정 로드 완료: 실제 앱 렌더링
    동적으로 layout을 변경합니다.
    route.meta.layout에 따라:
    - "AuthLayout" -> AuthLayout 컴포넌트 렌더링
    - "MainLayout" -> MainLayout 컴포넌트 렌더링
    - 없음 -> router-view만 렌더링
  -->
  <component :is="currentLayout" v-if="currentLayout">
    <router-view />
  </component>
  <!-- layout이 없는 경우 -->
  <router-view v-else />
</template>

<script setup>
/**
 * App.vue - 루트 컴포넌트
 */
import { onBeforeMount, computed, onMounted, ref, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";

// ==================== layout 컴포넌트 import ====================
import AuthLayout from "@/layout/AuthLayout.vue";
import MainLayout from "@/layout/MainLayout.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
// ==================== router 및 store ====================
const route = useRoute();
const authStore = useAuthStore();
const configStore = useConfigStore();
const isLoading = ref(false);
// ==================== layout 매핑 객체 ====================
/**
 * layoutComponents: 레이아웃 매핑
 *
 * meta.layout의 값을 여기서 컴포넌트로 변환합니다.
 * 예: "AuthLayout" -> AuthLayout 컴포넌트
 *
 * 새로운 layout을 추가할 때:
 * 1. import로 컴포넌트 불러오기
 * 2. 이 객체에 추가
 * 3. router/index.js의 meta.layout에 이름 지정
 */
const layoutComponents = {
  AuthLayout,
  MainLayout,
};

// ==================== 계산된 속성: 현재 layout ====================
/**
 * currentLayout: 현재 route에 필요한 layout 컴포넌트
 *
 * 동작:
 * - route.meta.layout의 값을 읽어서
 * - layoutComponents에서 해당 컴포넌트를 반환
 * - route가 변경되면 자동으로 재계산
 */
const currentLayout = computed(() => {
  const layoutName = route.meta.layout;
  console.log("📍 현재 route:", route.path);
  console.log("🎨 현재 layout:", layoutName);
  console.log("🔒 로그인 상태:", authStore.isLoggedIn);
  return layoutComponents[layoutName];
});

/**
 * Open Graph 이미지 동적 변경
 *
 * Open Graph란?
 * - SNS(카카오톡, 페이스북, 링크드인 등)에서 페이지를 공유할 때 표시되는 이미지
 * - og:image 메타 태그로 제어됨
 * - 서버에서 받은 이미지 URL을 동적으로 적용하여 공유 시 브랜드 이미지 표시
 *
 * 동작 방식:
 * 1. configStore에서 opengraphImageUrl 가져오기
 * 2. <meta property="og:image"> 태그 찾기
 * 3. content 속성에 이미지 URL 설정
 * 4. 태그가 없으면 새로 생성
 *
 * Vue2 vs Vue3:
 * - Vue2: this.updateOpengraphImage() 메서드 형식
 * - Vue3: 함수형 방식으로 직접 호출 (더 간단함)
 */
/**
 * Open Graph 정보 동적 변경 (이미지 + 설명)
 *
 * Open Graph란?
 * - SNS(카카오톡, 페이스북, 링크드인 등)에서 페이지를 공유할 때 표시되는 정보
 * - og:image: 공유 시 표시될 이미지
 * - og:description: 공유 시 표시될 설명 텍스트
 * - 서버에서 받은 데이터를 동적으로 적용하여 브랜드 이미지 유지
 *
 * 동작 방식:
 * 1. configStore에서 opengraphImageUrl, opengraphDescription 가져오기
 * 2. <meta property="og:image">, <meta property="og:description"> 태그 찾기
 * 3. content 속성에 값 설정
 * 4. 태그가 없으면 새로 생성
 *
 * Vue2 vs Vue3:
 * - Vue2: this.updateOpengraphInfo() 메서드 형식
 * - Vue3: 함수형 방식으로 직접 호출 (더 간단함)
 */
async function updateOpengraphInfo(opengraphImageUrl, opengraphDescription) {
  console.log("🌐 Open Graph 정보 업데이트 시작");

  // ==================== og:image 설정 ====================
  if (opengraphImageUrl) {
    let ogImageMeta = document.querySelector('meta[property="og:image"]');

    // 메타 태그가 없으면 새로 생성
    if (!ogImageMeta) {
      ogImageMeta = document.createElement("meta");
      ogImageMeta.setAttribute("property", "og:image");
      document.head.appendChild(ogImageMeta);
      console.log("✅ og:image 메타 태그 생성됨");
    }

    // ✅ 캐시 방지를 위해 timestamp 추가
    const timestampUrl = `${opengraphImageUrl}?t=${Date.now()}`;
    ogImageMeta.setAttribute("content", timestampUrl);
    console.log("🖼️ Open Graph 이미지 업데이트:", timestampUrl);
  } else {
    console.warn("⚠️ opengraphImageUrl이 없습니다");
  }

  // ==================== og:description 설정 ====================
  if (opengraphDescription) {
    let ogDescriptionMeta = document.querySelector(
      'meta[property="og:description"]',
    );

    // 메타 태그가 없으면 새로 생성
    if (!ogDescriptionMeta) {
      ogDescriptionMeta = document.createElement("meta");
      ogDescriptionMeta.setAttribute("property", "og:description");
      document.head.appendChild(ogDescriptionMeta);
      console.log("✅ og:description 메타 태그 생성됨");
    }

    // content 속성에 설명 텍스트 설정
    ogDescriptionMeta.setAttribute("content", opengraphDescription);
    console.log("📝 Open Graph 설명 업데이트:", opengraphDescription);
  } else {
    console.warn("⚠️ opengraphDescription이 없습니다");
  }

  console.log("✅ Open Graph 정보 업데이트 완료");
}

/**
 * Favicon 동적 변경
 */
function updateFavicon(faviconUrl) {
  if (!faviconUrl) return;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

/* 라이프 사이클 */

onBeforeMount(() => {
  isLoading.value = true;
});

onMounted(async () => {
  console.log("🚀 ============================================");
  console.log("🚀 App.vue 초기화 시작");
  console.log("🚀 ============================================");
  console.log("📡서버 설정 로드 시작...");
  await configStore.fetchConfig("/api/app/info/bypass");
  console.log("✅서버 설정 로드 완료!");
  console.log("🚀 ============================================");
  console.log("📡 Open Graph 이미지 설정 시작...");
  await updateOpengraphInfo(
    configStore.opengraphImageUrl,
    configStore.opengraphDescription,
  );
  console.log("✅ Open Graph 이미지 로딩 완료!");
  console.log("📡파비콘 설정 로드 시작...");
  await updateFavicon(configStore.faviconImageUrl);
  console.log("✅ 파비콘 로딩 완료!");
  // ============================================================
  // 초기화 완료 로그
  // ============================================================
  console.log("🎉 ============================================");
  console.log("🎉 앱 초기화 완료!");
  console.log("📦 설정 데이터:", configStore.serverConfig);
  console.log("🏢 회사명:", configStore.office);
  console.log("🎨 로고:", configStore.logoImageUrl);
  console.log("🎨 오픈그래프 이미지 주소:", configStore.opengraphImageUrl);
  console.log("🎨 판넬:", configStore.loginPannelImageUrl);
  console.log("🎨 메인 색상:", configStore.mainColorHexCode);
  console.log("🔒 로그인 상태:", authStore.isLoggedIn);
  console.log("👤 사용자:", authStore.user);
  console.log("🎨 현재 layout:", currentLayout.value?.name || "none");

  // ✅ 앱 시작 시 가장 먼저 세션 복구
  await authStore.restoreSession();
  await nextTick();
  isLoading.value = false;

  console.log("✅ 앱 초기화 완료");
  console.log("🔑 세션 상태:", authStore.isLoggedIn);
  console.log("👤 사용자:", authStore.user);
  console.log("🎨 현재 layout:", currentLayout.value?.name || "none");
});
</script>
