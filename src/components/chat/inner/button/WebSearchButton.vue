<template>
  <!-- 언어 아이콘 -->
  <button
    class="icon-button"
    title="웹 검색"
    @click="handleLanguage"
    style="display: none"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 20 20"
      fill="none"
    >
      <circle
        cx="10"
        cy="10"
        r="7.25"
        :stroke="
          isOpenAIWebSearchMode ? configStore.mainColorHexCode : defaultColor
        "
        stroke-width="1.5"
      />
      <line
        x1="3"
        y1="9.75"
        x2="17"
        y2="9.75"
        :stroke="
          isOpenAIWebSearchMode ? configStore.mainColorHexCode : defaultColor
        "
        stroke-width="1.5"
      />
      <path
        d="M9.7735 3L9.41369 3.55793C6.75234 7.6847 6.89519 13.0215 9.7735 17V17"
        :stroke="
          isOpenAIWebSearchMode ? configStore.mainColorHexCode : defaultColor
        "
        stroke-width="1.5"
      />
      <path
        d="M10.7265 3L11.0694 3.59398C13.4819 7.77244 13.3494 12.9503 10.7265 17V17"
        :stroke="
          isOpenAIWebSearchMode ? configStore.mainColorHexCode : defaultColor
        "
        stroke-width="1.5"
      />
    </svg>
  </button>
</template>

<script setup>
import { useConfigStore } from "@/stores/useConfigStore";

const configStore = useConfigStore();
const defaultColor = "#868e96"; // TODO: 추후 defaultUseConfigStore()랑 통일하기

/**
 * handleLanguage
 * 언어 선택 (TODO)
 */
const handleLanguage = () => {
  console.log("🌐 언어 선택");
};
</script>

<style type="scss"></style>
