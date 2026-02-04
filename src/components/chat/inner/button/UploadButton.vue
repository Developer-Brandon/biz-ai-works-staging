<template>
  <button
    class="icon-button"
    :class="{ 'icon-button__has-file': attachedFiles.length > 0 }"
    title="파일 첨부"
    @click="toggleUploadDropdown"
  >
    <!-- ==================== 클립 아이콘 ==================== -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5 12.6667V7C5 4.23858 7.23858 2 10 2V2C12.7614 2 15 4.23858 15 7V14.6667C15 16.5076 13.5076 18 11.6667 18V18C9.82572 18 8.33333 16.5076 8.33333 14.6667V7.22222C8.33333 6.30175 9.07953 5.55556 10 5.55556V5.55556C10.9205 5.55556 11.6667 6.30175 11.6667 7.22222V14.4444"
        :stroke="
          attachedFiles.length > 0 ? configStore.mainColorHexCode : defaultColor
        "
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>

    <!-- ==================== 파일 업로드 드롭다운 ==================== -->
    <transition name="upload-dropdown-fade">
      <div v-if="isUploadDropdownOpen" class="upload-dropdown" @click.stop>
        <!-- 드롭다운 옵션 -->
        <div
          v-for="uploadOption in uploadOptionList"
          :key="uploadOption.id"
          class="dropdown-option"
          @click="selectUploadOption(uploadOption.id)"
        >
          <!-- 좌측: 아이콘 -->
          <div class="dropdown-option__icon">
            <img :src="uploadOption.icon" :alt="uploadOption.title" />
          </div>

          <!-- 중앙: 텍스트 (제목 + 설명) -->
          <div class="dropdown-option__info">
            <p class="dropdown-option__info__title">{{ uploadOption.title }}</p>
            <p class="dropdown-option__info__explain">
              {{ uploadOption.explain }}
            </p>
          </div>
        </div>
      </div>
    </transition>
  </button>

  <!-- ==================== 숨겨진 파일 input ==================== -->
  <input
    ref="fileInputEl"
    type="file"
    multiple
    style="display: none"
    @change="handleFileSelect"
  />

  <!-- ==================== ë“œë¡­ë‹¤ìš´ ë‹«ê¸°ìš© ì˜¤ë²„ë ˆì´ ==================== -->
  <div
    v-if="isUploadDropdownOpen"
    class="upload-dropdown-overlay"
    @click="closeUploadDropdown"
  ></div>
</template>

<script setup>
/**
 * UploadButton.vue - 파일 첨부 버튼
 *
 * 기능:
 * - 파일 선택 드롭다운 메뉴 (아이콘 + 텍스트)
 * - 문서 업로드 / 이미지 업로드 옵션
 * - 선택된 파일 개수 표시
 * - 드롭다운 자동 닫기 (외부 클릭)
 *
 * Props:
 *   - attachedFiles: 첨부된 파일 배열 (부모 컴포넌트에서 관리)
 *
 * Emits:
 *   - attach-file: 파일 선택 시 발생 (선택된 파일 배열을 부모로 전달)
 *
 * 🎯 Vue3 vs Vue2 차이점:
 * - Vue2: methods에 정의하고 this.emit() 사용
 * - Vue3: defineEmits()로 먼저 정의하고 emit() 함수로 발생
 * - Vue2: this.$props로 props 접근
 * - Vue3: props 객체로 직접 접근
 *
 * Vue3 Composition API 사용
 */

import { useConfigStore } from "@/stores/useConfigStore";
import docUploadIcon from "@/assets/images/icon/file_attach.png";
import imageUploadIcon from "@/assets/images/icon/chat-image-upload.png";
import { ref, computed, onMounted } from "vue";

/* ==================== 상태 관리 ==================== */

/**
 * isUploadDropdownOpen: 드롭다운 메뉴 열림/닫힘 상태
 *
 * - true: 드롭다운 메뉴 표시
 * - false: 드롭다운 메뉴 숨김
 */
const isUploadDropdownOpen = ref(false);
const fileInputEl = ref(null);
const configStore = useConfigStore();
const defaultColor = "#868e96";

/* ==================== Props ==================== */

const props = defineProps({
  attachedFiles: {
    type: Array,
    default: () => [],
  },
});

/* ==================== 데이터 ==================== */

/**
 * uploadOptionList: 파일 업로드 옵션 목록
 *
 * 구조:
 * - id: 옵션 고유 ID
 * - icon: 옵션 아이콘 이미지 경로
 * - title: 옵션 제목
 * - explain: 옵션 설명 (지원 형식)
 * - accept: input accept 속성값
 *
 * 📌 추후 서버 API에서 동적으로 받아올 데이터
 */
const uploadOptionList = computed(() => [
  // {
  //   id: "document",
  //   icon: docUploadIcon,
  //   title: "문서 업로드",
  //   explain: "txt, pdf, doc, csv, excel, md, html",
  //   accept: ".txt,.pdf,.doc,.docx,.csv,.xls,.xlsx,.md,.html",
  // },
  {
    id: "image",
    icon: imageUploadIcon,
    title: "이미지 업로드",
    explain: "png, jpeg, jpg, gif",
    accept: ".png,.jpg,.jpeg,.gif,.webp",
  },
]);

const emit = defineEmits(["attach-file"]);

const toggleUploadDropdown = () => {
  isUploadDropdownOpen.value = !isUploadDropdownOpen.value;
  console.log(
    `ðŸ”„ ì—…ë¡œë“œ ë“œë¡­ë‹¤ìš´ í† ê¸€: ${
      isUploadDropdownOpen.value ? "ì—´ìŒ" : "ë‹«ìŒ"
    }`,
  );
};

const closeUploadDropdown = () => {
  isUploadDropdownOpen.value = false;
  console.log("âŒ ì—…ë¡œë“œ ë“œë¡­ë‹¤ìš´ ë‹«ìŒ");
};

const selectUploadOption = (optionId) => {
  const selectedOption = uploadOptionList.value.find(
    (opt) => opt.id === optionId,
  );

  if (selectedOption && fileInputEl.value) {
    fileInputEl.value.accept = selectedOption.accept;
    fileInputEl.value.click();
    console.log(`âœ… ì—…ë¡œë“œ ì˜µì…˜ ì„ íƒ: ${selectedOption.title}`);
  }

  closeUploadDropdown();
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);

  if (files.length > 0) {
    emit("attach-file", files);
    console.log(`ðŸ“ íŒŒì¼ ì„ íƒë¨: ${files.length}ê°œ`, files);
  }

  e.target.value = "";
};

onMounted(() => {
  const handleDocumentClick = (event) => {
    const clickedElement = event.target;
    const isInsideIconButton = clickedElement.closest(".icon-button");
    const isInsideUploadDropdown = clickedElement.closest(".upload-dropdown");

    // ë“œë¡­ë‹¤ìš´ ì˜ì—­ì´ ì•„ë‹ˆë©´ ë‹«ê¸°
    if (!isInsideIconButton && !isInsideUploadDropdown) {
      isUploadDropdownOpen.value = false;
    }
  };

  document.addEventListener("click", handleDocumentClick);

  // âœ… Vue3 Composition API: onUnmountedì—ì„œ ë¦¬ìŠ¤ë„ˆ ì œê±°
  // ë©”ëª¨ë¦¬ ëˆ„ìˆ˜ ë°©ì§€!
  return () => {
    document.removeEventListener("click", handleDocumentClick);
  };
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/* ==================== ì•„ì´ì½˜ ë²„íŠ¼ ==================== */

/**
 * .icon-button: íŒŒì¼ ì²¨ë¶€ ì•„ì´ì½˜ ë²„íŠ¼
 *
 * ì—­í• :
 * - íŒŒì¼ ì²¨ë¶€ ë“œë¡­ë‹¤ìš´ ë©”ë‰´ íŠ¸ë¦¬ê±°
 * - íŒŒì¼ ì²¨ë¶€ ìƒíƒœ ì‹œê°í™”
 *
 * íŠ¹ì§•:
 * - position: relative (ë“œë¡­ë‹¤ìš´ ê¸°ì¤€ì )
 * - í˜¸ë²„ ì‹œ: ë°°ê²½ìƒ‰ ë³€ê²½ + ìŠ¤ì¼€ì¼ í™•ëŒ€
 * - íŒŒì¼ ì²¨ë¶€ ì‹œ: ìƒ‰ìƒ ë³€ê²½ + íŽ„ìŠ¤ ì• ë‹ˆë©”ì´ì…˜
 */
.icon-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: $spacing-1;
  border-radius: $border-radius-base;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  /* í˜¸ë²„ ìƒíƒœ */
  &:hover {
    background-color: $gray-100;
  }

  /* í™œì„±í™” ìƒíƒœ */
  &:active {
    // transform: scale(0.95);
  }

  /* íŒŒì¼ ì²¨ë¶€ ì‹œ ìƒíƒœ */
  &__has-file {
    color: var(--primary-color);
  }
}

/* ==================== íŒŒì¼ ì—…ë¡œë“œ ë“œë¡­ë‹¤ìš´ ==================== */

/**
 * .upload-dropdown: íŒŒì¼ ì—…ë¡œë“œ ë“œë¡­ë‹¤ìš´ ë©”ë‰´
 *
 * ìœ„ì¹˜:
 * - position: absolute (ì•„ì´ì½˜ ë²„íŠ¼ ê¸°ì¤€ì ì—ì„œ ì ˆëŒ€ ìœ„ì¹˜)
 * - bottom: 100% (ë²„íŠ¼ ìœ„ìª½ì— ë°°ì¹˜)
 * - left: 50%, transform: translateX(-50%) (ì¤‘ì•™ ì •ë ¬)
 * - z-index: $z-popover (ë‹¤ë¥¸ ìš”ì†Œ ìœ„ì— í‘œì‹œ)
 * - margin-bottom: 8px (ë²„íŠ¼ê³¼ì˜ ê°„ê²©)
 *
 * ìŠ¤íƒ€ì¼:
 * - ë°°ê²½: í°ìƒ‰
 * - í…Œë‘ë¦¬: ì—°í•œ íšŒìƒ‰
 * - ê·¸ë¦¼ìž: ë“œë¡­ë‹¤ìš´ íš¨ê³¼
 * - border-radius: ë¶€ë“œëŸ¬ìš´ ëª¨ì„œë¦¬
 *
 * ì• ë‹ˆë©”ì´ì…˜:
 * - upload-dropdown-fade transition ì ìš© (Vue transition)
 */
.upload-dropdown {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  z-index: $z-popover;
  min-width: 240px;
  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
  animation: fadeIn $transition-base ease-out;
}

/**
 * .dropdown-option: ê°œë³„ ë“œë¡­ë‹¤ìš´ ì˜µì…˜
 *
 * êµ¬ì¡°:
 * - dropdown-option__icon: ì¢Œì¸¡ ì•„ì´ì½˜ (24px x 24px)
 * - dropdown-option__info: ì¤‘ì•™ í…ìŠ¤íŠ¸ (ì œëª© + ì„¤ëª…)
 *
 * ë ˆì´ì•„ì›ƒ:
 * - Flexë¡œ ì¢Œìš° ë°°ì¹˜
 * - gapìœ¼ë¡œ ì•„ì´ì½˜ê³¼ í…ìŠ¤íŠ¸ ì‚¬ì´ ê°„ê²© ì„¤ì •
 * - align-items: flex-start (í…ìŠ¤íŠ¸ì™€ ì•„ì´ì½˜ ìƒë‹¨ ì •ë ¬)
 *
 * ìŠ¤íƒ€ì¼:
 * - íŒ¨ë”©: $spacing-3 $spacing-4 (ìƒí•˜: 12px, ì¢Œìš°: 16px)
 * - í˜¸ë²„: ë°°ê²½ìƒ‰ ë³€ê²½
 * - í•˜ë‹¨ êµ¬ë¶„ì„  (ë§ˆì§€ë§‰ í•­ëª© ì œì™¸)
 *
 * ì• ë‹ˆë©”ì´ì…˜:
 * - ë¶€ë“œëŸ¬ìš´ í˜¸ë²„ ì• ë‹ˆë©”ì´ì…˜ ($transition-base)
 */
.dropdown-option {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  cursor: pointer;
  transition: all $transition-base;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  @media (max-width: 768px) {
    gap: $spacing-1;
  }
  &:last-child {
    border-bottom: none;
  }

  /* í˜¸ë²„ ìƒíƒœ */
  &:hover {
    background-color: var(--primary-hover-color);
  }
  // ì•„ì´ì½˜
  &__icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      @media (max-width: 768px) {
        margin-top: 2px;
      }
    }
  }
  // ì •ë³´
  &__info {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    flex: 1;
    min-width: 0; /* í…ìŠ¤íŠ¸ ì˜¤ë²„í”Œë¡œìš° ì²˜ë¦¬ í•„ìˆ˜ */

    /* ì˜µì…˜ ì œëª© */
    &__title {
      margin: 0;
      line-height: 1.5;
      text-align: start;
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $primary-text;
      transition: color $transition-base;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ì˜µì…˜ ì„¤ëª… */
    &__explain {
      margin: 0;
      line-height: 0.5;
      text-align: start;
      font-size: $font-size-xs;
      color: $gray-500;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

/* ==================== ë“œë¡­ë‹¤ìš´ ì˜¤ë²„ë ˆì´ ==================== */

/**
 * .upload-dropdown-overlay: ë“œë¡­ë‹¤ìš´ ë‹«ê¸°ìš© ì˜¤ë²„ë ˆì´
 *
 * ì—­í• :
 * - ë“œë¡­ë‹¤ìš´ ì™¸ë¶€ í´ë¦­ ê°ì§€
 * - ë“œë¡­ë‹¤ìš´ ìžë™ ë‹«ê¸°
 *
 * íŠ¹ì§•:
 * - position: fixed (í™”ë©´ ì „ì²´ ë®ìŒ)
 * - ë°°ê²½: íˆ¬ëª…
 * - z-index: $z-popover - 1 (ë“œë¡­ë‹¤ìš´ ì•„ëž˜ì— ìœ„ì¹˜)
 * - pointer-events: none (ë§ˆìš°ìŠ¤ ì´ë²¤íŠ¸ ë¬´ì‹œ, ë‹¤ë¥¸ ìš”ì†Œì— í†µê³¼)
 * - cursor: auto (ì»¤ì„œ ê¸°ë³¸ê°’)
 */
.upload-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-popover - 1;
  background-color: transparent;
  cursor: auto;
  pointer-events: none;
}

/* ==================== ì• ë‹ˆë©”ì´ì…˜ ==================== */

/**
 * fadeIn: íŽ˜ì´ë“œì¸ ì• ë‹ˆë©”ì´ì…˜
 *
 * ë™ìž‘:
 * - íˆ¬ëª…ë„: 0 â†’ 1
 * - Yì¶•: -8px â†’ 0px (ì‚´ì§ ìœ„ì—ì„œ ì•„ëž˜ë¡œ)
 * - Xì¶•: translateX(-50%) ìœ ì§€ (ì¤‘ì•™ ì •ë ¬ ìœ ì§€)
 *
 * ìš©ë„:
 * - ë“œë¡­ë‹¤ìš´ ë©”ë‰´ ë‚˜íƒ€ë‚˜ê¸°
 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}
/**
 * Vue transition: upload-dropdown-fade
 *
 * ì—­í• :
 * - ë“œë¡­ë‹¤ìš´ ë©”ë‰´ ì—´ë¦¼/ë‹«íž˜ ì• ë‹ˆë©”ì´ì…˜
 *
 * êµ¬ì„±:
 * - enter-active: ë‚˜íƒ€ë‚˜ëŠ” ì• ë‹ˆë©”ì´ì…˜
 * - leave-active: ì‚¬ë¼ì§€ëŠ” ì• ë‹ˆë©”ì´ì…˜
 * - enter-from: ì´ˆê¸° ìƒíƒœ
 * - leave-to: ìµœì¢… ìƒíƒœ
 */
.upload-dropdown-fade-enter-active,
.upload-dropdown-fade-leave-active {
  transition: all $transition-base ease-out;
}

.upload-dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) translateX(-50%);
}

.upload-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) translateX(-50%);
}
</style>
