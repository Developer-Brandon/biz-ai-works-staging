<!--
  InputField.vue
  
  재사용 가능한 입력 필드 컴포넌트
  로그인, 회원가입, 검색 등 다양한 곳에서 재사용됩니다.
  
  Vue2 (Slots 사용):
  ```vue
  <InputField
    v-model="email"
    type="email"
    placeholder="Enter email"
  >
    <MailIcon />
  </InputField>
  ```
  
  Vue3 변화점:
  1. v-model 더 간결 (이전: :value @input)
  2. 네임드 슬롯 개선
  3. emit 타입 정의 가능
  4. Composition API로 더 명확한 로직
  
  Props:
  - v-model: 입력값 (양방향 바인딩)
  - type: 'text', 'email', 'password' 등
  - placeholder: 플레이스홀더 텍스트
  - icon: 좌측 아이콘 (문자 또는 emoji)
  - disabled: 비활성화
  - error: 에러 메시지
  
  Slots:
  - default: 좌측 아이콘 영역
  - rightIcon: 우측 아이콘 영역 (비밀번호 토글 등)
-->

<template>
  <!-- 
    입력 필드를 감싸는 컨테이너
    상태(포커스, 에러)에 따라 클래스를 동적으로 추가
  -->
  <div class="input-wrapper" :class="{ 'has-error': error }">
    <!-- 좌측 아이콘 슬롯 -->
    <div v-if="$slots.default" class="input-icon-left">
      <slot></slot>
    </div>

    <!-- 
      실제 입력 필드
      
      v-model 대신 :value와 @input을 쓰는 이유:
      - v-model은 상위 컴포넌트에서만 사용
      - 컴포넌트 내부에서는 :value와 @input 분리
      - 더 명확한 데이터 흐름
    -->
    <input
      :value="modelValue"
      :type="inputType"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-field"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <!-- 우측 아이콘 슬롯 (비밀번호 토글, 검색 버튼 등) -->
    <div
      v-if="$slots.rightIcon || type === 'password'"
      class="input-icon-right"
    >
      <!-- 비밀번호 표시/숨기 토글 -->
      <button
        v-if="type === 'password'"
        type="button"
        class="toggle-password"
        @click="showPassword = !showPassword"
        :title="showPassword ? '비밀번호 숨기' : '비밀번호 표시'"
      >
        <span v-if="showPassword">
          <CommonIcon
            :src="eyeOffIconPath"
            width="16"
            height="16"
            alt="비밀번호 숨기기 아이콘"
          />
        </span>
        <span v-else>
          <CommonIcon
            :src="eyeIconPath"
            width="16"
            height="16"
            alt="비밀번호 표시 아이콘"
          />
        </span>
      </button>

      <!-- 커스텀 우측 아이콘 -->
      <slot v-else name="rightIcon"></slot>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
/**
 * Vue3 <script setup> 설명
 *
 * Vue2:
 * ```javascript
 * export default {
 *   props: ['modelValue', 'type'],
 *   emits: ['update:modelValue'],
 *   data() {
 *     return { showPassword: false }
 *   }
 * }
 * ```
 *
 * Vue3 (<script setup>):
 * - props와 emits를 함수로 정의
 * - 리액티브 변수는 ref()로 감싸기
 * - 자동으로 템플릿에 노출 (return 필요 없음)
 * - 훨씬 간결하고 가독성 좋음
 */

import { ref, computed } from "vue";
import CommonIcon from "@/components/icon/CommonIcon.vue";
/* ==================== Props (부모에서 받는 데이터) ==================== */

/**
 * defineProps: 이 컴포넌트가 받을 props 정의
 *
 * Vue2와 차이점:
 * - Vue2: props: { modelValue: String }
 * - Vue3: defineProps({ modelValue: String })
 *
 * withDefaults: 기본값 설정
 */
const props = defineProps({
  modelValue: {
    type: String,
    required: true, // 필수 props
  },
  type: {
    type: String,
    default: "text", // 'text', 'email', 'password' 등
  },
  placeholder: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

/* ==================== Emits (자식이 부모에게 보내는 이벤트) ==================== */

/**
 * defineEmits: 이 컴포넌트가 발생시킬 이벤트 정의
 *
 * Vue2:
 * emits: ['update:modelValue']
 *
 * Vue3:
 * defineEmits(['update:modelValue'])
 */
defineEmits(["update:modelValue"]);

/* ==================== Data (리액티브 상태) ==================== */

/**
 * ref(): 리액티브 변수 생성
 *
 * Vue2:
 * ```
 * data() {
 *   return { showPassword: false }
 * }
 * ```
 *
 * Vue3:
 * const showPassword = ref(false)
 * 템플릿에서: {{ showPassword }} ← 자동으로 unwrap (값으로 접근)
 * 스크립트에서: showPassword.value ← .value 필요
 */

// 비밀번호 표시 여부
const showPassword = ref(false);

// 포커스 상태 (입력 중인지 여부)
const isFocused = ref(false);

const eyeIconPath = new URL("@/assets/images/icon/eye.png", import.meta.url)
  .href;
const eyeOffIconPath = new URL(
  "@/assets/images/icon/eye-off.png",
  import.meta.url
).href;

/* ==================== Computed (파생 데이터) ==================== */

/**
 * computed(): 다른 리액티브 값을 기반으로 계산된 값
 *
 * Vue2와 동일 개념이지만, Vue3에서는 함수 형태로 더 간단합니다.
 *
 * Vue2:
 * computed: { inputType() { return ... } }
 *
 * Vue3:
 * const inputType = computed(() => ...)
 */

// 비밀번호 표시 여부에 따라 입력 타입 결정
const inputType = computed(() => {
  // 비밀번호 필드이고 보이지 않으면 'password', 아니면 'text'
  return props.type === "password" && !showPassword.value ? "password" : "text";
});
</script>

<style scoped lang="scss">
/**
 * scoped: 이 스타일은 현재 컴포넌트에만 적용
 * 다른 컴포넌트의 .input-field 클래스에 영향 없음
 * 
 * lang="scss": SCSS 문법 사용 (변수, 믹스인 등)
 */

// 변수 import (globals.scss, variables.scss의 전역 변수 사용)
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  /* 
    기본 테두리와 라운드 처리
    추후 포커스/에러 상태로 변함
  */
  border: 2px solid $gray-200;
  border-radius: $border-radius-full;
  background-color: $white;
  transition: all $transition-base;

  /* 
    에러 상태: 빨간 테두리
  */
  &.has-error {
    border-color: $red;
    border-radius: $border-radius-full;
    background-color: rgba($red, 0.05);
  }

  /* 
    포커스 상태: 보라색 테두리 + 그림자
  */
  &:has(.input-field:focus) {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.1);
  }

  /* 비활성화 상태: 흐린 배경 */
  &:has(.input-field:disabled) {
    background-color: $gray-100;
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.input-icon-left {
  /* 좌측 아이콘 영역 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 35px;
  height: 45px;
  padding-left: 5px;
  /* 아이콘 색상 (주로 회색) */
  color: $gray-400;

  /* 포커스 시 아이콘 색상 변경 */
  .input-wrapper:has(.input-field:focus) & {
    color: var(--primary-color);
    transition: color $transition-base;
  }
}

.input-field {
  /* 
    실제 입력 필드
    
    중요: flex: 1 을 사용하여 전체 너비를 차지하도록 설정
  */
  flex: 1;
  height: 45px;
  padding: 0 $spacing-2;
  border: none;
  background: transparent;
  font-size: $font-size-base;
  color: $primary-text;
  font-family: $font-primary;

  /* 
    포커스 시 아웃라인 제거 (테두리에서 처리)
  */
  outline: none;

  /* 
    플레이스홀더 스타일
  */
  &::placeholder {
    color: $gray-400;
    font-weight: $font-weight-normal;
  }

  /* 
    자동완성 배경색 제거 (Chrome)
    :autofill 시 노란 배경이 생기는 것을 방지
  */
  &:-webkit-autofill {
    -webkit-box-shadow: inset 0 0 0 1000px $white;
    -webkit-text-fill-color: $primary-text;
  }

  /* 
    커서 색상
  */
  caret-color: var(--primary-color);

  /* 
    비활성화 상태
  */
  &:disabled {
    color: $gray-400;
    cursor: not-allowed;
  }
}

.input-icon-right {
  /* 
    우측 아이콘 영역 (비밀번호 토글, 검색 버튼 등)
  */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 35px;
  height: 45px;

  /* 
    우측 여백 (아이콘 위치 조정)
  */
  padding-right: $spacing-xs;
}

.toggle-password {
  /* 
    비밀번호 표시/숨기 버튼
  */
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: $gray-400;
  transition: all $transition-base;
  padding: $spacing-xs;

  /* 
    호버 효과: 색상 변경 및 확대
  */
  &:hover {
    color: var(--primary-color);
    transform: scale(1.1);
  }

  /* 
    포커스 효과 (키보드 접근성)
  */
  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 4px;
  }
}

.error-message {
  /* 
    에러 메시지 표시
    
    위치: 입력 필드 아래 (절대 위치)
  */
  position: absolute;
  bottom: -24px;
  left: $spacing-4;
  font-size: $font-size-sm;
  color: $red;

  /* 
    애니메이션: 부드러운 등장
  */
  animation: slideDown 0.3s ease-out;

  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.error-icon {
  /* 에러 아이콘 */
  font-size: 0.9rem;
}
</style>
