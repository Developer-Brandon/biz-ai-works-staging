<!--
  PrimaryPopup.vue
  
  재사용 가능한 기본 팝업 컴포넌트
  - 타이틀, 내용, 확인 버튼
  - 배경 클릭 시 닫힘
  - ESC 키로 닫힘
  
  Props:
  - title: 팝업 제목
  - message: 팝업 내용
  - confirmText: 확인 버튼 텍스트
  
  Events:
  - confirm: 확인 버튼 클릭
  - close: 팝업 닫기
  
  사용 예시:
  <PrimaryPopup
    title="알림"
    message="계정 생성은 관리자에게 문의해주세요."
    confirmText="확인"
    @confirm="handleClose"
    @close="handleClose"
  />
-->
<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="isVisible"
        class="popup-overlay"
        @click="handleBackgroundClick"
      >
        <Transition name="popup-scale">
          <div v-if="isVisible" class="popup-container" @click.stop>
            <!-- 팝업 헤더 -->
            <div class="popup-header">
              <h3 class="popup-title">{{ title }}</h3>
            </div>
            <!-- 팝업 내용 -->
            <div class="popup-content">
              <p class="popup-message">{{ message }}</p>
            </div>
            <!-- 팝업 푸터(확인 버튼) -->
            <div class="popup-footer">
              <Button
                variant="primary"
                size="md"
                fullWidth
                @click="handleConfirm"
              >
                {{ confirmText }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * PrimaryPopup 컴포넌트
 *
 * 기본 알림/확인 팝업
 * Teleport를 사용하여 body에 직접 렌더링
 */

import { ref, onMounted, onUnmounted } from "vue";
import Button from "@/components/common/Button.vue";

/* ==================== Props ==================== */
const props = defineProps({
  /* 팝업 제목 */
  title: {
    type: String,
    default: "제목",
  },
  /* 팝업 내용 */
  message: {
    type: String,
    required: true,
    default: "내용",
  },
  /* 확인 버튼 */
  confirmText: {
    type: String,
    default: "확인",
  },
});

/* ==================== Emits ==================== */
const emit = defineEmits(["confirm", "close"]);

/* ==================== State ==================== */
const isVisible = ref(false);

/* ==================== Methods ==================== */
/* 팝업 표시 */
function show() {
  isVisible.value = true;
  document.body.style.overflow = "hidden"; // 배경 스크롤 방지
}

/* 팝업 숨기기 */
function hide() {
  isVisible.value = false;
  document.body.style.overflow = ""; // 배경 스크롤 복원
}

/* 확인 버튼 이벤트 */
function handleConfirm() {
  emit("confirm");
  hide();
}

/* 배경 클릭시 닫기 */
function handleBackgroundClick(event) {
  emit("close");
  hide();
}

/* ESC키로 닫기 */
function handleEscapeKey(event) {
  // 1. Escape - "키보드 이벤트에서 눌린 키가 ESC 키인지 확인하는 조건문"
  // 2. isVisible.value - "팝업이 현재 표시되고 있는지 확인하는 상태 변수"
  if (event.key === "Escape" && isVisible.value) {
    emit("close");
    hide();
  }
}

/* ==================== Lifecycle ==================== */
onMounted(() => {
  show();
  window.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  hide();
  window.removeEventListener("keydown", handleEscapeKey);
});

/* ==================== Expose ==================== */

/**
 * 부모 컴포넌트에서 직접 호출 가능하도록 노출
 */
defineExpose({
  show,
  hide,
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== 팝업 오버레이 ==================== */

.popup-overlay {
  /* 전체 화면 덮기 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-modal;

  /* 반투명 배경 */
  background-color: rgba($black, 0.5);

  /* 중앙 정렬 */
  display: flex;
  align-items: center;
  justify-content: center;

  /* 패딩 (모바일에서 여백 확보) */
  padding: $spacing-4;
}

/* ==================== 팝업 컨테이너 ==================== */

.popup-container {
  /* 크기 */
  width: 100%;
  max-width: 500px;

  /* 배경 및 테두리 */
  background-color: $white;
  border-radius: $border-radius-popup;
  box-shadow: $shadow-xl;

  /* 내부 여백 */
  padding: $spacing-8;

  /* 애니메이션 */
  animation: scaleIn 0.3s ease-out;

  /* 반응형 */
  @media (max-width: $breakpoint-phone) {
    max-width: 90%;
    padding: $spacing-6;
  }
}

/* ==================== 팝업 헤더 ==================== */

.popup-header {
  margin-bottom: $spacing-6;
  text-align: center;
}

.popup-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $primary-text;
  margin: 0;
}

/* ==================== 팝업 내용 ==================== */

.popup-content {
  margin-bottom: $spacing-8;
  text-align: center;
}

.popup-message {
  font-size: $font-size-base;
  color: $secondary-text;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line; /* 줄바꿈 지원 */
}

/* ==================== 팝업 푸터 ==================== */

.popup-footer {
  /* 버튼 영역 */
}

/* ==================== 트랜지션 애니메이션 ==================== */

/* 배경 페이드 */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity $transition-base;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

/* 팝업 스케일 */
.popup-scale-enter-active,
.popup-scale-leave-active {
  transition: all $transition-base;
}

.popup-scale-enter-from,
.popup-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
