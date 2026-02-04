<template>
  <button class="send-button" title="전송">
    <CommonIcon :src="whiteArrow" :size="35" />
  </button>
</template>

<script setup>
import CommonIcon from "@/components/icon/CommonIcon.vue";
import whiteArrow from "@/assets/images/icon/send_button_white_arrow.png";
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

.send-button {
  padding: 5px;
  border-radius: 100%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  background-color: var(--primary-color);

  &:hover:not(:disabled) {
    transform: scale(1.2);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
