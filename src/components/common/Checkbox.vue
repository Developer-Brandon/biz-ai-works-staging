<!--
  Checkbox.vue
  
  재사용 가능한 체크박스 컴포넌트
  "아이디 저장" 등 선택 항목에 사용합니다.
  
  Props:
  - v-model: 체크 여부 (boolean)
  - label: 라벨 텍스트
  - id: HTML id 속성 (accessibility)
  - disabled: 비활성화
  
  Events:
  - update:modelValue: 상태 변경 이벤트
  
  사용 예시:
  <Checkbox 
    v-model="rememberEmail"
    label="아이디 저장"
  />
-->

<template>
  <!-- 
    체크박스를 포함한 라벨 요소
    
    사용성 개선:
    1. 라벨을 클릭해도 체크박스 토글 됨
    2. for-id 바인딩으로 접근성 향상
  -->
  <div class="checkbox-wrapper">
    <!-- 
      실제 체크박스 (숨겨짐)
      
      이 요소는 보이지 않지만 기능은 유지합니다.
      CSS로 커스텀 스타일을 입히므로 숨김 처리.
    -->
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="checkbox-input"
      @change="$emit('update:modelValue', $event.target.checked)"
    />

    <!-- 
      커스텀 체크박스 아이콘
      
      :class 바인딩으로 체크 상태에 따라 변함
    -->
    <label :for="id" class="checkbox-label">
      <!-- 
        커스텀 체크박스 박스
        checked 상태일 때 다른 스타일 적용
      -->
      <span
        class="checkbox-box"
        :class="{ 'checkbox-box-checked': modelValue }"
      >
        <!-- 
          체크 마크
          checked 상태일 때만 표시
        -->
        <span v-if="modelValue" class="checkbox-mark">✓</span>
      </span>

      <!-- 라벨 텍스트 -->
      <span v-if="label" class="checkbox-text">
        {{ label }}
      </span>

      <!-- 
        라벨이 없으면 슬롯 사용
        (더 복잡한 라벨은 슬롯으로 처리)
      -->
      <span v-else class="checkbox-text">
        <slot></slot>
      </span>
    </label>
  </div>
</template>

<script setup>
/**
 * Vue3 <script setup>로 작성된 체크박스 컴포넌트
 */

import { computed } from "vue";

/* ==================== Props ==================== */

const props = defineProps({
  /**
   * v-model 바인딩용 값
   * boolean 타입
   */
  modelValue: {
    type: Boolean,
    required: true,
  },

  /**
   * 체크박스 라벨 텍스트
   */
  label: {
    type: String,
    default: "",
  },

  /**
   * HTML id 속성
   * label의 for 속성과 매칭되어야 함
   * 기본값으로 자동 생성
   */
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).substr(2, 9)}`,
  },

  /**
   * 비활성화 여부
   */
  disabled: {
    type: Boolean,
    default: false,
  },
});

/* ==================== Emits ==================== */

/**
 * update:modelValue
 * 체크 상태가 변경될 때 발생
 */
defineEmits(["update:modelValue"]);
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

.checkbox-wrapper {
  /* 
    체크박스 전체를 감싸는 컨테이너
    
    display: flex로 아이콘과 텍스트를 정렬
  */
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  user-select: none;
}

/* 
  실제 체크박스 요소 (숨겨짐)
  
  opacity: 0으로 보이지 않지만, focus 상태는 유지
  (키보드 접근성을 위해 display: none 사용하지 않음)
*/
.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;

  /* 
    숨겨진 input을 포커스 할 때,
    라벨의 outline을 표시 (접근성)
  */
  &:focus + .checkbox-label {
    .checkbox-box {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }
}

/* 
  라벨 (클릭 가능 영역)
  
  input이 숨겨져 있으므로, label을 클릭하면
  input의 checked 상태가 토글됨
  (HTML의 for-id 바인딩 덕분)
*/
.checkbox-label {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  cursor: pointer;

  /* 
    비활성화 상태
  */
  .checkbox-input:disabled ~ & {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 
  커스텀 체크박스 박스
  
  기본 브라우저 체크박스 대신
  이 div로 커스텀 스타일 제공
*/
.checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;

  /* 
    크기: 20x20px
  */
  width: 20px;
  height: 20px;

  /* 
    테두리와 배경
  */
  border: 2px solid $gray-300;
  border-radius: 4px;
  background-color: $white;

  /* 
    부드러운 전환
  */
  transition: all $transition-base;

  /* 
    호버 효과 (마우스 오버)
  */
  .checkbox-label:hover & {
    border-color: var(--primary-color);
    background-color: rgba(var(--primary-color), 0.05);
  }

  /* 
    체크됨 상태
  */
  &.checkbox-box-checked {
    background: linear-gradient(
      135deg,
      var(--primary-color) 0%,
      var(--primary-color) 100%
    );
    border-color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(var(--primary-color), 0.3);

    /* 
      체크됨 상태에서 호버
    */
    .checkbox-label:hover & {
      box-shadow: 0 4px 12px rgba(var(--primary-color), 0.4);
    }
  }
}

/* 
  체크 마크 (✓)
*/
.checkbox-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  color: $white;
  font-size: 14px;
  font-weight: $font-weight-bold;

  /* 
    등장 애니메이션
  */
  animation: scaleIn 0.2s ease-out;
}

/* 
  라벨 텍스트
*/
.checkbox-text {
  color: $primary-text;
  font-size: $font-size-sm;
  font-weight: $font-weight-normal;

  /* 
    비활성화 상태: 회색
  */
  .checkbox-input:disabled ~ .checkbox-label & {
    color: $gray-400;
  }
}
</style>
