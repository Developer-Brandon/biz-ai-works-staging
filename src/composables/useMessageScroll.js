/**
 * useMessageScroll.js - 메시지 스크롤 로직
 *
 * 🎯 역할:
 * - 메시지 영역 자동 스크롤
 * - 스크롤 앵커 참조 관리
 */

import { nextTick } from "vue";

export function useMessageScroll(messagesEndRef) {
  // ==================== Methods ====================

  /**
   * 메시지 영역 하단으로 스크롤
   */
  const scrollToBottom = async () => {
    await nextTick();
    if (messagesEndRef.value) {
      messagesEndRef.value.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  // ==================== Return ====================

  return {
    scrollToBottom,
  };
}
