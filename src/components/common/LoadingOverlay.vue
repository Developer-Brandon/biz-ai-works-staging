<!-- src/components/common/LoadingOverlay.vue -->

<template>
  <!-- 
    ============================================================
    Loading Overlay 컴포넌트
    ============================================================
    
    역할:
    - isLoading 상태에 따라 로딩 화면 표시
    - 트렌디한 애니메이션 효과 제공
    - 커스텀 텍스트 지원
    - Props로 유연한 설정 가능
    
    특징:
    - Toss 스타일의 점 애니메이션 추가
    - 부드러운 그래디언트 배경 애니메이션
    - 스케일 및 회전 애니메이션 조합
    - 모바일 반응형 디자인
    
    Props:
    - isLoading (Boolean): 로딩 표시 여부
    - loadingText (String): 로딩 텍스트 (기본값: "로딩 중...")
    - primaryColor (String): 그래디언트 메인 색상
    - hoverColor (String): 그래디언트 호버 색상
  -->

  <transition name="fade">
    <!-- v-if로 조건부 렌더링: 로딩 상태에 따라 표시/숨김 -->
    <div v-if="isLoading" class="loading-overlay">
      <!-- 로딩 콘텐츠 래퍼 -->
      <div class="loading-wrapper">
        <!-- 
          ==================== 로딩 스피너 ====================
          
          다층 구조로 복잡한 애니메이션 효과 구현:
          1. 외부 원: 회전 애니메이션
          2. 중간 원: 역방향 회전
          3. 내부 원: 스케일 애니메이션
          
          결과: 동적이고 현대적인 로딩 표현
        -->
        <div class="loading-spinner-container">
          <!-- 외부 회전 원 (시계방향) -->
          <div class="spinner-ring spinner-ring-1"></div>

          <!-- 중간 회전 원 (반시계방향) -->
          <div class="spinner-ring spinner-ring-2"></div>

          <!-- 중심 점 -->
          <div class="spinner-center"></div>
        </div>

        <!-- 
          ==================== 로딩 텍스트 ====================
          
          Toss 스타일의 점 애니메이션:
          "로딩 중." → "로딩 중.." → "로딩 중..." 반복
          
          각 점이 순차적으로 나타났다 사라짐
          (button.vue와 동일한 애니메이션 패턴 사용)
        -->
        <p class="loading-text">
          {{ loadingText }}
          <span class="loading-dots">
            <span class="dot dot-1">·</span>
            <span class="dot dot-2">·</span>
            <span class="dot dot-3">·</span>
          </span>
        </p>

        <!-- 선택적: 로딩 진행률 표시 (시각적 피드백) -->
        <div class="loading-progress"></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
/**
 * ============================================================
 * Vue3 Composition API - Script Setup
 * ============================================================
 *
 * defineProps:
 * - isLoading: 로딩 표시 여부 (필수)
 * - loadingText: 커스텀 로딩 텍스트
 * - primaryColor: 그래디언트 메인 색상
 * - hoverColor: 그래디언트 호버 색상
 *
 * Vue2 vs Vue3 (중요!):
 * ─────────────────────────────────────────────────
 * Vue2 방식:
 * export default {
 *   props: {
 *     isLoading: {
 *       type: Boolean,
 *       required: true
 *     }
 *   }
 * }
 *
 * Vue3 방식 (Composition API + <script setup>):
 * const props = defineProps({
 *   isLoading: {
 *     type: Boolean,
 *     required: true
 *   }
 * })
 *
 * 장점:
 * 1. 타입 안정성 향상 (TypeScript 호환성)
 * 2. 자동완성 지원 (IDE 인텔리센스)
 * 3. 번들 크기 감소 (treeshaking 가능)
 * 4. 더 직관적인 코드 구조
 * ─────────────────────────────────────────────────
 */
defineProps({
  /**
   * 로딩 상태
   * - true: 로딩 화면 표시
   * - false: 로딩 화면 숨김
   *
   * 사용 예시:
   * <LoadingOverlay :isLoading="isLoading" />
   */
  isLoading: {
    type: Boolean,
    required: true,
  },

  /**
   * 로딩 텍스트
   * 예: "OCI Biz.AI를 준비하고 있습니다..."
   *
   * 사용 예시:
   * <LoadingOverlay
   *   :isLoading="true"
   *   loadingText="데이터를 불러오는 중"
   * />
   */
  loadingText: {
    type: String,
    default: "로딩 중입니다",
  },

  /**
   * 그래디언트 메인 색상 (HEX)
   *
   * CSS 변수 또는 직접 지정 가능:
   * - CSS 변수: "var(--primary-color)"
   * - 직접 지정: "#D0021B"
   *
   * v-bind()를 통해 CSS에 직접 적용됨
   */
  primaryColor: {
    type: String,
    default: "var(--primary-color)",
  },

  /**
   * 그래디언트 호버 색상 (HEX)
   * 그래디언트 라이트 톤
   *
   * 예: "#FFF3F3" (연분홍)
   */
  hoverColor: {
    type: String,
    default: "var(--primary-hover-color)",
  },
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;

/**
 * ============================================================
 * 메인 로딩 오버레이 컨테이너
 * ============================================================
 * 
 * 역할:
 * - 전체 화면 덮기 (fixed positioning)
 * - 그래디언트 배경 애니메이션
 * - 중앙 정렬 (flexbox)
 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  /* Flexbox 중앙 정렬 */
  display: flex;
  justify-content: center;
  align-items: center;

  /* 
    그래디언트 배경 애니메이션
    v-bind()를 통해 props의 색상을 CSS에 바인딩
    
    gradient-shift 애니메이션으로 부드러운 변화 표현
  */
  background: linear-gradient(
    135deg,
    v-bind("primaryColor") 0%,
    v-bind("primaryColor") 25%,
    v-bind("hoverColor") 75%,
    v-bind("hoverColor") 100%
  );
  background-size: 200% 200%;
  animation: gradient-shift 4s ease-in-out infinite;

  /* 모든 요소 위에 표시 */
  z-index: 9999;

  /* 터치 입력 차단 (로딩 중 클릭 방지) */
  touch-action: none;

  /**
   * ============================================================
   * 로딩 래퍼 (콘텐츠 컨테이너)
   * ============================================================
   * 
   * 역할:
   * - 스피너, 텍스트, 프로그레스 바를 수직 정렬
   * - 스케일 애니메이션 적용
   * - 부드러운 페이드 인 효과
   */
  .loading-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;

    /* 스케일 애니메이션: 아래에서 올라오는 느낌 */
    animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

    /**
     * ============================================================
     * 로딩 스피너 컨테이너
     * ============================================================
     * 
     * 다층 회전 애니메이션으로 역동성 표현:
     * 1. spinner-ring-1: 시계방향 회전
     * 2. spinner-ring-2: 반시계방향 회전 (대조 효과)
     * 3. spinner-center: 중심에 고정된 점
     * 
     * 이 구조로 복잡하고 현대적인 로딩 효과 구현
     */
    .loading-spinner-container {
      position: relative;
      width: 80px;
      height: 80px;

      /* 중앙 정렬 기준점 */
      display: flex;
      justify-content: center;
      align-items: center;

      /**
       * ════════════════════════════════════════════════════
       * spinner-ring: 회전하는 원의 테두리
       * ════════════════════════════════════════════════════
       * 
       * 구조:
       * - border: 투명한 테두리 (일부만 색상 지정)
       * - border-top-color: 색상이 있는 부분 (흰색)
       * 
       * 효과:
       * - 회전하면서 색상이 있는 부분이 도는 것처럼 보임
       * - 마치 회전하는 바퀴처럼 보이는 착시 효과
       */
      .spinner-ring {
        position: absolute;
        border: 5px solid rgba($white, 0.15);
        border-radius: 50%;

        /* 상단만 흰색으로 표시 (회전 효과 생성) */
        border-top-color: $white;
        border-right-color: rgba($white, 0.3);
      }

      /**
       * 외부 원 (spinner-ring-1)
       * 
       * - 크기: 80px
       * - 회전 방향: 시계방향 (rotate)
       * - 회전 속도: 1.2초
       * - 애니메이션: spin-clockwise
       */
      .spinner-ring-1 {
        width: 80px;
        height: 80px;
        animation: spin-clockwise 1.2s linear infinite;
      }

      /**
       * 중간 원 (spinner-ring-2)
       * 
       * - 크기: 60px (외부보다 작음)
       * - 회전 방향: 반시계방향 (rotate reverse)
       * - 회전 속도: 1.8초 (느린 속도로 대조 효과)
       * - 애니메이션: spin-counter-clockwise
       * 
       * 설명:
       * 두 원이 반대 방향으로 회전하면서
       * 복잡하고 역동적인 느낌 전달
       */
      .spinner-ring-2 {
        width: 60px;
        height: 60px;
        animation: spin-counter-clockwise 1.8s linear infinite;
      }

      /**
       * 중심 점 (spinner-center)
       * 
       * 역할:
       * - 회전 중심점 표시
       * - 시각적 안정감 제공
       * - 스케일 애니메이션으로 부드러운 효과
       */
      .spinner-center {
        position: absolute;
        width: 16px;
        height: 16px;
        background-color: $white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba($white, 0.5);

        /* 중심점이 살짝 커졌다 작아지는 효과 */
        animation: pulse-scale 2s ease-in-out infinite;

        /* z-index로 위에 표시 */
        z-index: 10;
      }
    }

    /**
     * ============================================================
     * 로딩 텍스트 (Toss 스타일 점 애니메이션)
     * ============================================================
     * 
     * 특징:
     * - 텍스트와 점이 함께 표시
     * - 각 점이 순차적으로 나타났다 사라짐
     * - "로딩 중." → "로딩 중.." → "로딩 중..." 반복
     * 
     * Button.vue와 동일한 패턴으로 일관성 유지
     * (서비스 전체에서 로딩 애니메이션의 톤 앤 매너 통일)
     */
    .loading-text {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: $white;
      text-align: center;

      /* 텍스트 깊이감 추가 */
      text-shadow: 0 2px 8px rgba($black, 0.2);

      /* 문자 사이 간격 조정 */
      letter-spacing: 0.3px;

      /* 반응형: 모바일에서 작아짐 */
      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      /**
       * ════════════════════════════════════════════════════
       * loading-dots: 점 애니메이션 컨테이너
       * ════════════════════════════════════════════════════
       * 
       * 구조:
       * <span class="loading-dots">
       *   <span class="dot dot-1">·</span>
       *   <span class="dot dot-2">·</span>
       *   <span class="dot dot-3">·</span>
       * </span>
       * 
       * 동작:
       * 1. 각 점이 독립적인 애니메이션을 가짐
       * 2. 시간차(200ms)를 두고 순차적으로 실행
       * 3. opacity 변화로 나타났다 사라짐
       * 
       * 결과:
       * - 부드러운 로딩 표현
       * - 사용자가 대기 중임을 명확히 표시
       * - 너무 지루하지 않은 UI
       */
      .loading-dots {
        display: inline-flex;
        align-items: center;
        gap: 0.15rem;
        margin-left: 0.3rem;
        vertical-align: middle;
      }

      /**
       * 각 점(.)의 애니메이션
       * 
       * 특징:
       * - 가로 길이: 0.3em (글자 크기에 따라 변함)
       * - 세로 길이: 1em (텍스트 높이와 동일)
       * - 애니메이션: dot-opacity (opacity 변화)
       * - 지속 시간: 1.2초
       * 
       * 시간차 (animation-delay):
       * - 점 1: 0ms (즉시 시작)
       * - 점 2: 200ms (첫 번째 점 후 시작)
       * - 점 3: 400ms (두 번째 점 후 시작)
       */
      .dot {
        display: inline-block;
        width: 0.3em;
        height: 1em;
        line-height: 1;
        animation-duration: 1.2s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;

        /* 
          점 1번: 가장 먼저 시작
          0% → 100% → 0% (fade out → fade in)
        */
        &.dot-1 {
          animation-name: dot-fade;
          animation-delay: 0ms;
        }

        /* 
          점 2번: 첫 번째 점 후 200ms 뒤에 시작
          스테거 효과로 물결 느낌
        */
        &.dot-2 {
          animation-name: dot-fade;
          animation-delay: 200ms;
        }

        /* 
          점 3번: 두 번째 점 후 200ms 뒤에 시작
          마지막 점이 가장 늦게 사라짐
        */
        &.dot-3 {
          animation-name: dot-fade;
          animation-delay: 400ms;
        }
      }
    }

    /**
     * ============================================================
     * 로딩 진행률 표시 (선택적 요소)
     * ============================================================
     * 
     * 역할:
     * - 시각적 진행 상황 표시
     * - 사용자에게 시스템이 작동 중임을 보여줌
     * - 하단에 가로 막대 형태로 표시
     * 
     * 특징:
     * - width: 0% → 90%로 변화 (100%에 도달하지 않음)
     * - 부드러운 ease-in-out 이징
     * - 반복 없음 (한 번만 실행)
     */
    .loading-progress {
      width: 200px;
      height: 3px;
      background: linear-gradient(
        90deg,
        rgba($white, 0.2) 0%,
        rgba($white, 0.8) 50%,
        rgba($white, 0.2) 100%
      );
      border-radius: 2px;
      overflow: hidden;

      /* 
        pseudo-element로 진행률 표시
        ::before 요소가 왼쪽에서 오른쪽으로 이동
      */
      &::before {
        content: "";
        display: block;
        height: 100%;
        width: 30%;
        background: linear-gradient(
          90deg,
          rgba($white, 0.3) 0%,
          $white 50%,
          rgba($white, 0.3) 100%
        );
        animation: progress-move 2s ease-in-out infinite;
      }
    }
  }
}

/**
 * ============================================================
 * Transition: fade 애니메이션
 * ============================================================
 * 
 * Vue3 <transition> 컴포넌트와 함께 사용
 * v-if 변경 시 fade-in/fade-out 효과
 * 
 * 클래스 이름 규칙:
 * - {name}-enter-active: 진입 중 (0ms ~ 300ms)
 * - {name}-leave-active: 퇴출 중 (0ms ~ 300ms)
 * - {name}-enter-from: 진입 시작 (opacity: 0)
 * - {name}-leave-to: 퇴출 완료 (opacity: 0)
 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/**
 * ============================================================
 * 키프레임 애니메이션 정의
 * ============================================================
 * 
 * 각 애니메이션의 작동 원리를 상세히 설명합니다.
 * 이들은 로딩 오버레이의 다양한 요소에 적용됩니다.
 */

/**
 * gradient-shift: 그래디언트 배경 애니메이션
 * 
 * 동작:
 * 1. 배경을 200% 크기로 설정 (background-size: 200%)
 * 2. 배경 위치를 변경하면서 애니메이션
 * 3. 큰 배경에서 다른 부분이 보여지는 효과
 * 
 * 시각적 효과:
 * - 그래디언트가 부드럽게 흐르는 느낌
 * - 딱딱한 색상 변화가 아닌 유연한 변화
 * 
 * 사용처: .loading-overlay 배경
 */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/**
 * spin-clockwise: 시계방향 회전
 * 
 * 동작:
 * - 0° → 360° 회전
 * - linear 이징으로 일정한 속도 유지
 * 
 * 사용처: spinner-ring-1 (외부 원)
 */
@keyframes spin-clockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/**
 * spin-counter-clockwise: 반시계방향 회전
 * 
 * 동작:
 * - 0° → -360° 회전 (음수 각도)
 * - spin-clockwise와 반대 방향
 * 
 * 사용처: spinner-ring-2 (중간 원)
 * 
 * 효과:
 * spin-clockwise와 함께 사용하면
 * 복잡하고 역동적인 로딩 애니메이션 구성
 */
@keyframes spin-counter-clockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

/**
 * pulse-scale: 중심점 스케일 애니메이션
 * 
 * 동작:
 * - scale(1) → scale(1.2) → scale(1) 반복
 * - 중심점이 살짝 커졌다 작아지는 효과
 * 
 * 시각적 효과:
 * - 중심이 살아 움직이는 느낌
 * - 정적이지 않은 동적 로딩 표현
 * 
 * 사용처: spinner-center (중심 점)
 */
@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.8;
  }
}

/**
 * scale-in: 래퍼 스케일 애니메이션
 * 
 * 동작:
 * - scale(0.8) → scale(1) 확대
 * - 투명도: 0 → 1 페이드 인
 * 
 * 이징:
 * cubic-bezier(0.34, 1.56, 0.64, 1)
 * 
 * 효과:
 * - 아래에서 올라오는 '튀는' 느낌
 * - 부드럽고 현대적인 진입 애니메이션
 * 
 * 사용처: .loading-wrapper
 */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/**
 * dot-fade: 점 투명도 애니메이션
 * 
 * 동작:
 * - opacity: 1 → 0.3 → 1 반복
 * - 점이 흐려졌다 또렷해짐
 * 
 * 시각적 효과:
 * - 각 점이 순차적으로 fade in/out
 * - Toss 스타일의 부드러운 로딩 표현
 * 
 * 사용처:
 * - .loading-dots .dot-1
 * - .loading-dots .dot-2
 * - .loading-dots .dot-3
 * 
 * 주의:
 * animation-delay 조합으로 순차 실행
 */
@keyframes dot-fade {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/**
 * progress-move: 진행률 표시 애니메이션
 * 
 * 동작:
 * - translateX: -100% → 400%
 * - 진행 바가 왼쪽에서 오른쪽으로 이동
 * 
 * 시각적 효과:
 * - 로딩 진행 상황을 시각적으로 표시
 * - 사용자에게 진행 중임을 보여줌
 * 
 * 사용처: .loading-progress::before
 */
@keyframes progress-move {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(400%);
  }
}
</style>
