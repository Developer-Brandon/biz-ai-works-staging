<template>
  <div class="not-found-container">
    <div class="content-wrapper">
      <!-- 404 숫자 애니메이션 -->
      <div class="error-code">
        <span class="digit" :style="{ animationDelay: '0s' }">4</span>
        <span class="digit" :style="{ animationDelay: '0.1s' }">0</span>
        <span class="digit" :style="{ animationDelay: '0.2s' }">4</span>
      </div>

      <!-- 메인 메시지 -->
      <h1 class="main-message">
        <span class="word" :style="{ animationDelay: '0.4s' }">Page</span>
        <span class="word" :style="{ animationDelay: '0.5s' }">Not</span>
        <span class="word" :style="{ animationDelay: '0.6s' }">Found</span>
      </h1>

      <!-- 서브 메시지 -->
      <p class="sub-message">
        요청하신 페이지를 찾을 수 없습니다.<br />
        URL을 다시 확인해주시거나 메인으로 돌아가주세요.
      </p>

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button @click="goBack" class="btn btn-back">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>이전 페이지</span>
        </button>
      </div>

      <!-- 장식 요소들 -->
      <div class="decoration-dots">
        <span
          class="dot"
          v-for="i in 12"
          :key="i"
          :style="{ animationDelay: `${i * 0.1}s` }"
        ></span>
      </div>
    </div>

    <!-- 배경 그리드 -->
    <div class="background-grid">
      <div class="grid-line" v-for="i in 20" :key="`line-${i}`"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push("/");
  }
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

.not-found-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%) !important;
  overflow: hidden;
  padding: 2rem;
}

/* 배경 그리드 */
.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  opacity: 0.03;
  pointer-events: none;
}

.grid-line {
  border-right: 1px solid $white;
  animation: gridPulse 3s ease-in-out infinite;
}

.grid-line:nth-child(even) {
  animation-delay: 1.5s;
}

@keyframes gridPulse {
  0%,
  100% {
    opacity: 0.03;
  }
  50% {
    opacity: 0.08;
  }
}

/* 메인 컨텐츠 */
.content-wrapper {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
}

/* 404 숫자 */
.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 800;
  line-height: 1;
}

.digit {
  color: $white;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
  text-shadow: 0 0 20px $border-color, 0 0 40px $border-color;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 메인 메시지 */
.main-message {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin: 0 0 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.word {
  color: $white;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  position: relative;
}

.word::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, $white, transparent);
  opacity: 0;
  animation: underlineSlide 0.8s ease-out forwards;
  animation-delay: inherit;
}

@keyframes underlineSlide {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.3;
    transform: scaleX(1);
  }
}

/* 서브 메시지 */
.sub-message {
  color: #999999;
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.8;
  margin: 0 0 3rem;
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.8s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 1s forwards;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
  color: $white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 2px solid #333333;
  border-radius: 25px;
}

.btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn:hover {
  border-color: #666666;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.btn svg {
  position: relative;
  z-index: 1;
  transition: transform 0.3s;
}

.btn:hover svg {
  transform: translateX(-3px);
}

.btn span {
  position: relative;
  z-index: 1;
}

/* 장식 점들 */
.decoration-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  pointer-events: none;
}

.dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: $white;
  border-radius: 50%;
  opacity: 0;
  animation: dotFloat 3s ease-in-out infinite;
}

.dot:nth-child(1) {
  top: 10%;
  left: 20%;
}
.dot:nth-child(2) {
  top: 20%;
  left: 80%;
}
.dot:nth-child(3) {
  top: 30%;
  left: 10%;
}
.dot:nth-child(4) {
  top: 40%;
  left: 90%;
}
.dot:nth-child(5) {
  top: 50%;
  left: 5%;
}
.dot:nth-child(6) {
  top: 60%;
  left: 95%;
}
.dot:nth-child(7) {
  top: 70%;
  left: 15%;
}
.dot:nth-child(8) {
  top: 80%;
  left: 85%;
}
.dot:nth-child(9) {
  top: 15%;
  left: 50%;
}
.dot:nth-child(10) {
  top: 85%;
  left: 50%;
}
.dot:nth-child(11) {
  top: 25%;
  left: 40%;
}
.dot:nth-child(12) {
  top: 75%;
  left: 60%;
}

@keyframes dotFloat {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translateY(-20px) scale(1.2);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .not-found-container {
    padding: 1.5rem;
  }

  .error-code {
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .main-message {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .sub-message {
    margin-bottom: 2rem;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .decoration-dots {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 5rem;
  }

  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
  }
}

/* 다크모드 대응 (선택사항) */
@media (prefers-color-scheme: light) {
  .not-found-container {
    background: linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%);
  }

  .digit,
  .zero-svg,
  .word,
  .btn {
    color: #0a0a0a;
  }

  .sub-message {
    color: #666666;
  }

  .btn {
    border-color: #cccccc;
  }

  .btn:hover {
    border-color: #999999;
  }

  .grid-line {
    border-color: #0a0a0a;
  }

  .dot {
    background: #0a0a0a;
  }
}
</style>
