<!-- src/layouts/MainLayout.vue -->
<template>
  <div
    class="main-layout"
    :class="{ 'main-layout--sidebar-closed': !isSidebarOpen }"
  >
    <!-- ==================== PC/모바일 사이드바 토글 버튼 ==================== -->
    <button
      class="sidebar-toggle-btn"
      :class="{ 'sidebar-toggle-btn--active': isSidebarOpen }"
      @click="toggleSidebar"
      title="사이드바 토글"
      aria-label="사이드바 토글"
    >
      <img
        :src="isSidebarOpen ? sidebarCloseIcon : sidebarOpenIcon"
        :alt="isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'"
        class="sidebar-toggle-btn__icon"
      />
    </button>

    <!-- ==================== 사이드바 ==================== -->
    <MainSidebar
      class="main-sidebar"
      :is-open="isSidebarOpen"
      @close="closeSidebar"
      @refresh-main-page="dataStore.initializeSessionFields"
      @open-faq-popup="openFaqPopup"
    />

    <!-- ==================== 메인 콘텐츠 영역 ==================== -->
    <main
      class="content-area"
      :style="gradientObject"
      :class="{ 'content-area--full': !isSidebarOpen }"
    >
      <router-view />
    </main>

    <!-- ==================== 확장 사이드바 배경 오버레이 (배경 흐림처리) ==================== -->
    <Transition name="fade-overlay">
      <div
        v-if="isExpandSidebarOpen"
        class="expand-sidebar-overlay"
        @click="toggleExpandSidebar"
      ></div>
    </Transition>
    <!-- ==================== 확장 사이드바 ==================== -->
    <!-- ✅ 여기만 수정: :is-faq-popup-open → :is-open -->
    <ExpandSidebar
      class="expand-sidebar-component"
      :is-open="isExpandSidebarOpen"
      @toggle="toggleExpandSidebar"
      @open-faq-popup="openFaqPopup"
    />
    <!-- ==================== FAQ 팝업 오버레이 (배경 흐림처리) ==================== -->
    <FaqPopup :is-faq-popup-open="isFaqPopupOpen" @close="closeFaqPopup" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import MainSidebar from "@/components/sidebar/MainSidebar.vue";
import ExpandSidebar from "@/components/sidebar/ExpandSidebar.vue";
import FaqPopup from "@/components/modals/FaqPopup.vue";
import { useGradient } from "@/composables/useGradient.js";
import { useConfigStore } from "@/stores/useConfigStore";
import { useDataStore } from "@/stores/model/dataStore";

// ========== 아이콘 import ==========
import sidebarOpenIcon from "@/assets/images/icon/sidebar_toggle_open.png";
import sidebarCloseIcon from "@/assets/images/icon/sidebar_toggle_close.png";

// ========== Store 초기화 ==========
const configStore = useConfigStore();
const dataStore = useDataStore();

// ========== 반응형 State (Ref) ==========
const isSidebarOpen = ref(false);
const isExpandSidebarOpen = ref(false);
const isFaqPopupOpen = ref(false);

// ========== Composable ==========
const { gradientObject, setGradient } = useGradient();

// ========== 메서드 ==========
const initializeGradient = () => {
  console.log("🎨 MainLayout 그래디언트 초기화");
  setGradient(configStore.mainHoverColorHexCode, "#FFFFFF", 360);
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
  console.log("🔄 사이드바 토글:", isSidebarOpen.value ? "열음" : "닫음");
};

const closeSidebar = () => {
  // TODO: 해상도 변화 또는 채팅 시작 시 닫히는 로직 추가
};

const toggleExpandSidebar = () => {
  isExpandSidebarOpen.value = !isExpandSidebarOpen.value;
  console.log(
    "🔄 우측 패널 토글:",
    isExpandSidebarOpen.value ? "열음" : "닫음",
  );
};

const openFaqPopup = () => {
  isFaqPopupOpen.value = true;
  // document.body.style.overflow = "hidden";
};

const closeFaqPopup = () => {
  isFaqPopupOpen.value = false;
  // document.body.style.overflow = "auto";
};

// ========== 초기화 메서드 ==========
const initializeZoom = () => {
  if (window.innerWidth >= 768) {
    const contentArea = document.querySelector(".content-area");
    if (contentArea) {
      contentArea.style.overflowY = "hidden";
    } else {
      console.warn("⚠️ .content-area 요소를 찾을 수 없습니다");
    }
  }
};

const initializeMainSideBar = () => {
  if (window.innerWidth >= 768) {
    isSidebarOpen.value = true;
  }
};

const initializeScroll = () => {
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 3000);
};

// ========== 라이프사이클 ==========
onMounted(async () => {
  console.log("✅ MainLayout 마운트됨");

  await initializeGradient();
  await initializeZoom();
  await initializeMainSideBar();
  await initializeScroll();

  console.log("📐 초기 상태:", {
    isSidebarOpen: isSidebarOpen.value,
    isExpandSidebarOpen: isExpandSidebarOpen.value,
    isFaqPopupOpen: isFaqPopupOpen.value,
  });
});

onUnmounted(() => {
  console.log("🗑️ MainLayout 언마운트됨");
  document.body.style.overflow = "auto";
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/* ==================== MainLayout 전체 구조 ==================== */

.main-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 1fr;

  width: 100%;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  margin: 0;
  padding: 0;

  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &--sidebar-closed {
    grid-template-columns: 1fr;
  }
}

/* ==================== 사이드바 토글 버튼 ==================== */

.sidebar-toggle-btn {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1001;

  width: 40px;
  height: 40px;
  border-radius: $border-radius-md;
  background-color: $gray-200;
  border: 1px solid $gray-200;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  .main-layout:has(.sidebar--open) & {
    left: calc(250px + $spacing-4);
  }

  &:hover {
    box-shadow: $shadow-md;
    transform: scale(1.08);

    .sidebar-toggle-btn__icon {
      filter: brightness(0) invert(1);
    }
  }

  &--active {
    background-color: $gray-200;
    border-color: $gray-200;

    .sidebar-toggle-btn__icon {
      filter: brightness(0) invert(1);
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    transition: filter 0.3s ease;
  }
}

/* ==================== 메인 콘텐츠 영역 ==================== */

.content-area {
  grid-column: 2 / 3;
  grid-row: 1 / 2;

  overflow-y: auto;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  transition: grid-column 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: $gray-100;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-300;
    border-radius: 4px;
    transition: background 0.3s ease;

    &:hover {
      background: $gray-400;
    }
  }

  &--full {
    grid-column: 1 / -1;
  }
}

/* ==================== 확장 사이드바 배경 오버레이 ==================== */

.expand-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  cursor: pointer;

  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-overlay-enter-active {
  transition: opacity 0.3s ease-out;
}

.fade-overlay-leave-active {
  transition: opacity 0.2s ease-in;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

.fade-overlay-enter-to,
.fade-overlay-leave-from {
  opacity: 1;
}

/* Tablet/Mobile (768px 이하) */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 2fr;

    .main-sidebar {
      grid-column: 1 / 2;
    }
  }

  .content-area {
    grid-column: 2 / 2;
  }

  .expand-sidebar-overlay {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
}

/* 초소형 모바일 (640px 이하) */
@media (max-width: 640px) {
  .sidebar-toggle-btn {
    width: 36px;
    height: 36px;
    top: $spacing-3;
    left: $spacing-3;

    &__icon {
      width: 18px;
      height: 18px;
    }
  }
}

.popup-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popup-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95) translateY(-20px);
}

.popup-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95) translateY(20px);
}

.popup-slide-enter-to,
.popup-slide-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1) translateY(0);
}
</style>
