<!-- src/components/chat/inner/ActionIconsArea.vue -->
<!-- 
  역할: 웹서치, 업로드, 전송 버튼 그룹
  추출 부분: .action-icons-area
  
  Props:
    - canSend: 전송 가능 여부
  
  Emits:
    - send-message: 메시지 전송
    - attach-file: 파일 첨부 (UploadButton에서 전달)
    
  ✨ Vue3 Composition API 사용
-->

<template>
  <div class="action-icons-area">
    <div class="action-icons-group">
      <!-- 1. web search button -->
      <WebSearchButton />

      <!-- 2. upload button -->
      <UploadButton
        @attach-file="handleAttachFile"
        :attachedFiles="dataStore.attachedFiles"
      />

      <!-- 3. send message button -->
      <SendMessageButton @click="$emit('send-message')" :disabled="!canSend" />
    </div>
  </div>
</template>

<script setup>
/**
 * ActionIconsArea.vue - 우측 아이콘 버튼 그룹
 *
 * ChatInputArea.vue에서 추출된 컴포넌트
 * .action-icons-area 섹션을 독립 컴포넌트화
 *
 * Vue2 vs Vue3:
 * - Vue2: methods, emits 없이 this.$emit() 직접 호출
 * - Vue3: defineEmits로 emit 선언 ✅ (현재)
 */

import { useDataStore } from "@/stores/model/dataStore";
import WebSearchButton from "./button/WebSearchButton.vue";
import UploadButton from "@/components/chat/inner/button/UploadButton.vue"; // ✅ 올바른 경로
import SendMessageButton from "./button/SendMessageButton.vue";

// ==================== Props ====================
const props = defineProps({
  canSend: {
    type: Boolean,
    default: true,
  },
});

// ==================== Emits ====================
/**
 * 🎯 emit 선언
 *
 * send-message: 메시지 전송 이벤트
 * attach-file: 파일 첨부 이벤트 (UploadButton에서 전달)
 *
 * Vue2 vs Vue3:
 * - Vue2: emits: ['send-message', 'attach-file'] (옵션)
 * - Vue3: defineEmits(['send-message', 'attach-file']) ✅
 */
const emit = defineEmits(["send-message", "attach-file"]);

// ==================== Stores ====================
const dataStore = useDataStore();

// ==================== Methods ====================

/**
 * 🎯 handleAttachFile: UploadButton에서 파일 첨부 이벤트 수신
 *
 * 동작:
 * 1. UploadButton에서 @attach-file 이벤트 수신
 * 2. dataStore.handleAttachFile()로 파일 저장
 * 3. 부모(ChatInputArea)에게 attach-file 이벤트 전달
 *
 * @param {File[]} files - 선택된 파일 배열
 *
 * @example
 * UploadButton → @attach-file="$event" (files 배열)
 *               → handleAttachFile(files)
 *               → dataStore.handleAttachFile(files)
 *               → emit('attach-file', files)
 *               → ChatInputArea의 @attach-file 리스너 호출
 */
const handleAttachFile = (files) => {
  console.log("📎 [ActionIconsArea] UploadButton에서 파일 수신:", files);

  // 1️⃣ dataStore에 파일 저장
  dataStore.handleAttachFile(files);

  // 2️⃣ 부모(ChatInputArea)에게 이벤트 전달
  emit("attach-file", files);

  console.log(
    "✅ [ActionIconsArea] 파일 저장 및 이벤트 전달 완료:",
    dataStore.attachedFiles
  );
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;

.action-icons-area {
  display: flex;
  justify-content: flex-end;
  width: 100%;

  .action-icons-group {
    display: flex;
    gap: $spacing-2;

    .icon-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.25rem;
      padding: $spacing-1;
      border-radius: $border-radius-base;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover:not(:disabled) {
        background-color: $gray-100;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
