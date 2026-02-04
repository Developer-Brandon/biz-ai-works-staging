<!-- src/components/chat/inner/ErrorBanner.vue -->
<!-- 
  역할: 에러 메시지 배너
  추출 부분: .error-banner
  
  Props:
    - errorMessage: 표시할 에러 메시지
  
  Emits:
    - close: 배너 닫기
-->

<template>
  <div v-if="errorMessage" class="error-banner">
    <p class="error-message">{{ errorMessage }}</p>
    <button class="error-close-btn" @click="$emit('close')">✕</button>
  </div>
</template>

<script setup>
/**
 * ErrorBanner.vue - 에러 메시지 배너
 *
 * ChatInputArea.vue에서 추출된 컴포넌트
 * .error-banner 섹션을 독립 컴포넌트화
 */

// ==================== Props ====================
defineProps({
  errorMessage: {
    type: String,
    default: "",
  },
});

// ==================== Emits ====================
defineEmits(["close"]);
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-3 $spacing-4;
  background-color: #ffebee;
  border: 1px solid #ef5350;
  border-radius: $border-radius-lg;
  animation: slideDown 0.3s ease-out;

  .error-message {
    margin: 0;
    color: #c62828;
    font-size: $font-size-sm;
    font-weight: 500;
  }

  .error-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #c62828;
    font-size: 20px;
    padding: 0;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
