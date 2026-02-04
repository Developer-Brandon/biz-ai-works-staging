// src/components/main/composables/useTypingAnimation.js

/**
 * useTypingAnimation.js - 타이핑 애니메이션 로직
 *
 * 🎯 역할:
 * - displayedMessage 관리
 * - typeMessage 함수 제공
 * - 타이핑 인터벌 관리
 */

import { ref } from "vue";
import { nextTick } from "vue";

export function useTypingAnimation() {
  // ==================== State ====================

  /**
   * 타이핑되는 메시지 (점 → 글자로 자동 전환)
   */
  const displayedMessage = ref("");

  /**
   * 타이핑 속도
   */
  const TYPING_SPEED = 15;

  /**
   * 타이핑 인터벌 ID
   */
  let typingIntervalId = null;

  // ==================== Methods ====================

  /**
   * 타이핑 애니메이션 함수
   *
   * @param {string} message - 타이핑할 메시지
   * @param {Function} scrollCallback - 스크롤 콜백 (optional)
   * @returns {Promise<string>} 완성된 메시지
   */
  const typeMessage = async (message, scrollCallback = null) => {
    return new Promise((resolve) => {
      if (!message || typeof message !== "string") {
        console.warn("⚠️ Invalid message:", message);
        resolve();
        return;
      }

      console.log(
        `📝 타이핑 시작: ${message.length}자, 속도: ${TYPING_SPEED}ms`
      );

      let currentIndex = 0;
      displayedMessage.value = ""; // ✅ v-if로 점 표시됨

      const baseSpeed = TYPING_SPEED;
      let typingSpeed = baseSpeed;

      // 텍스트 길이에 따른 속도 조절
      if (message.length > 1000) {
        typingSpeed = 5;
      } else if (message.length > 500) {
        typingSpeed = Math.max(baseSpeed * 0.3, 5);
      } else if (message.length > 200) {
        typingSpeed = baseSpeed * 0.6;
      }

      const typeHandler = () => {
        if (currentIndex < message.length) {
          // ✅ 한 글자씩 추가
          displayedMessage.value += message[currentIndex];
          currentIndex++;

          // 자동 스크롤 (콜백 있을 경우)
          if (scrollCallback) {
            nextTick(() => scrollCallback()).catch(() => {});
          }
        } else {
          // ✅ 타이핑 완료
          if (typingIntervalId !== null) {
            clearInterval(typingIntervalId);
            typingIntervalId = null;
          }
          console.log(`✅ 타이핑 완료: ${message.length}자 모두 표시됨`);
          resolve(message);
        }
      };

      try {
        typingIntervalId = setInterval(typeHandler, typingSpeed);
      } catch (error) {
        console.error("❌ typeMessage 시작 실패:", error);
        displayedMessage.value = message;
        resolve(message);
      }
    });
  };

  // ==================== Return ====================

  return {
    displayedMessage,
    typeMessage,
  };
}
