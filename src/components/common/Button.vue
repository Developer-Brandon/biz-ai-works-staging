<!--
  Button.vue
  
  재사용 가능한 버튼 컴포넌트
  로그인, 취소, 제출 등 다양한 버튼을 통일된 스타일로 제공합니다.
  
  Props:
  - variant: 'primary' (파랑), 'secondary' (흰색), 'danger' (빨강) 등
  - size: 'sm' (작음), 'md' (중간), 'lg' (큼)
  - disabled: 비활성화
  - loading: 로딩 중 (로딩 인디케이터 표시)
  - fullWidth: 부모 너비에 맞춤
  - type: 'button', 'submit', 'reset' 등 (form 요소용)
  - loadingText: 로딩 중 표시할 텍스트
  
  Slots:
  - default: 버튼 텍스트 또는 내용
  - loading: 로딩 중 표시할 텍스트 (loadingText prop이 우선)
  
  Events:
  - click: 버튼 클릭 이벤트
  
  사용 예시:
  <Button 
    variant="primary" 
    size="lg" 
    :loading="isLoading"
    loadingText="로그인 중"
    @click="handleLogin"
  >
    로그인
  </Button>
-->

<template>
  <!-- 
    버튼 요소
    
    :class 바인딩으로 variant, size 등에 따라 다른 클래스 적용
  -->
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-full-width': fullWidth },
      { 'btn-loading': loading },
    ]"
    @click="$emit('click')"
  >
    <!-- 
      로딩 중일 때: 로딩 스피너 표시
    -->
    <!-- 
      버튼 텍스트/내용
      로딩 중이면 loading 텍스트, 아니면 default 슬롯 사용
    -->
    <span v-if="loading" class="btn-loading-text">
      <span class="loading-dots">
        <span class="dot dot-1">·</span>
        <span class="dot dot-2">·</span>
        <span class="dot dot-3">·</span>
      </span>
    </span>
    <span v-else>
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
/* ==================== Props ==================== */

const props = defineProps({
  /**
   * 버튼 스타일 변형
   *
   * 'primary': 주요 버튼 (빨간색) - 로그인, 제출 등
   * 'secondary': 보조 버튼 (흰색) - 취소, 이전 등
   * 'danger': 위험 버튼 (빨강) - 삭제, 거절 등
   * 'link': 링크 스타일 버튼 (텍스트만)
   */
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "danger", "link"].includes(value),
  },

  /**
   * 버튼 크기
   *
   * 'sm': 작음 (32px)
   * 'md': 중간 (40px) - 기본값
   * 'lg': 큼 (50px) - 로그인 등 주요 버튼
   */
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },

  /**
   * 비활성화 여부
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * 로딩 상태
   * true이면 스피너 표시 및 클릭 불가
   *
   * Vue2 vs Vue3:
   * - Vue3는 reactive prop 처리가 더 효율적
   */
  loading: {
    type: Boolean,
    default: false,
  },

  /**
   * 부모 너비에 맞출지 여부
   *
   * true: width: 100%
   * false: width: 자동 (content 기반)
   */
  fullWidth: {
    type: Boolean,
    default: false,
  },

  /**
   * HTML button type 속성
   *
   * 'button': 일반 버튼
   * 'submit': form 제출
   * 'reset': form 초기화
   */
  type: {
    type: String,
    default: "button",
    validator: (value) => ["button", "submit", "reset"].includes(value),
  },

  /**
   * 로딩 중 표시할 텍스트
   *
   * 기본값: "로그인 중"
   * loadingText prop이 있으면 해당 텍스트 사용
   *
   * 예시:
   * <Button :loading="true" loadingText="저장 중">저장</Button>
   */
  loadingText: {
    type: String,
    default: "로그인 중",
  },
});

/* ==================== Emits ==================== */
defineEmits(["click"]);
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== 기본 버튼 스타일 ==================== */

.btn {
  /*
    기본 속성

    display: inline-flex는 텍스트와 아이콘을 정렬하기 좋음
  */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  /*
    테두리 및 라운드
  */
  border: none;
  border-radius: 8px;

  /*
    폰트 설정
  */
  font-weight: 600;
  font-size: 1rem;

  /*
    일반적인 전환 효과
  */
  transition: all 0.3s ease;

  /*
    커서
  */
  cursor: pointer;

  /*
    사용자 선택 방지 (드래그 방지)
  */
  user-select: none;

  /*
    포커스 스타일 (키보드 접근성)
  */
  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /*
    비활성화 상태
  */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    /*
      비활성화 시 호버/액티브 효과 제거
    */
    &:hover,
    &:active {
      transform: none;
      box-shadow: none;
    }
  }
}

/* ==================== 크기별 스타일 ==================== */

.btn-sm {
  /* 작은 버튼 (32px) */
  height: 32px;
  padding: 0 1rem;
  font-size: 0.875rem;
}

.btn-md {
  /* 중간 버튼 (40px) - 기본값 */
  height: 40px;
  padding: 0 1.5rem;
}

.btn-lg {
  /* 큰 버튼 (50px) - 주요 액션 */
  height: 50px;
  padding: 0 2rem;
  font-size: 1.125rem;
}

/* ==================== 전체 너비 ==================== */

.btn-full-width {
  width: 100%;
}

/* ==================== 변형별 스타일 ==================== */

/* Primary 버튼 (주요 - 빨간색) */
.btn-primary {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-color) 100%
  );
  color: white;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);

  &:hover:not(:disabled) {
    /*
      호버 시: 그림자 증가, 약간 확대
    */
    box-shadow: 0 8px 20px rgba(var(--primary-color-rgb), 0.4);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    /*
      클릭 시: 아래로 눌린 효과
    */
    transform: translateY(0);
  }
}

/* Secondary 버튼 (보조 - 흰색 테두리) */
.btn-secondary {
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);

  &:hover:not(:disabled) {
    background-color: rgba(var(--primary-color-rgb), 0.05);
  }

  &:active:not(:disabled) {
    background-color: rgba(var(--primary-color-rgb), 0.1);
  }
}

/* Danger 버튼 (위험 - 빨강) */
.btn-danger {
  background-color: #ff5252;
  color: white;

  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
    transform: translateY(-2px);
    background-color: #ff3333;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

/* Link 버튼 (링크 스타일 - 텍스트만) */
.btn-link {
  background-color: transparent;
  color: var(--primary-color);
  padding: 0;
}

/* ==================== 로딩 상태 ==================== */

.btn-loading {
  /*
    로딩 중: 포인터 이벤트 차단 (추가 보안)
  */
  pointer-events: none;
}

.btn-loading-text {
  /*
    로딩 중 텍스트 컨테이너
    display: flex를 사용하여 텍스트와 점들을 나란히 배치
  */
  display: flex;
  align-items: center;
  gap: 0;
}

/* ==================== 토스 스타일 움직이는 점 애니메이션 ==================== */

.loading-dots {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  min-width: fit-content;
}

.base-text {
  white-space: nowrap;
}

.dot {
  /*
    각 점(.)의 기본 스타일

    opacity 애니메이션을 통해 나타났다 사라짐
  */
  display: inline-block;
  width: 0.3em;
  height: 1em;
  line-height: 1;

  /*
    애니메이션 속성
    - animation-duration: 1.2초 (전체 사이클)
    - animation-timing-function: ease-in-out (부드러운 변화)
    - animation-iteration-count: infinite (무한 반복)
  */
  animation-duration: 1.2s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;

  /*
    점 1번: 0ms 딜레이 (즉시 시작)
    "." ← 가장 먼저 사라짐
  */
  &.dot-1 {
    animation-name: dot-1;
    animation-delay: 0ms;
  }

  /*
    점 2번: 200ms 딜레이
    첫 번째 점이 사라진 후 200ms 뒤에 시작
  */
  &.dot-2 {
    animation-name: dot-2;
    animation-delay: 200ms;
  }

  /*
    점 3번: 400ms 딜레이
    두 번째 점이 사라진 후 200ms 뒤에 시작
  */
  &.dot-3 {
    animation-name: dot-3;
    animation-delay: 400ms;
  }
}

/* ==================== 반응형 디자인 ==================== */

@media (max-width: 768px) {
  .btn-lg {
    height: 44px;
    padding: 0 1.5rem;
    font-size: 1rem;
  }

  .loading-dots {
    font-size: 0.95rem;
  }
}
</style>
