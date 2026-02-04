<!-- src/components/main/sections/GreetingSection.vue -->
<template>
  <section class="greeting-section">
    <div class="greeting-container no-drag">
      <h1 class="greeting-title">안녕하세요. 홍길동님!</h1>
      <p class="greeting-description">오늘은 어떤 업무를 시작해볼까요?</p>
    </div>
  </section>
</template>

<script setup>
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;

.greeting-section {
  animation: fadeInDown 1s ease-out;

  .greeting-container {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    text-align: center;
    user-select: none;
  }

  .greeting-title {
    font-size: 2.3rem;
    font-weight: 350;
    color: $primary-text;
    margin: 0;
    letter-spacing: -0.02em;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .greeting-description {
    font-size: 1.3rem;
    font-weight: 400;
    color: $secondary-text;
    margin: 0;
    line-height: 1.5;
    opacity: 0.8;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
