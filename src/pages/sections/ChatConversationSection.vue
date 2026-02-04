<template>
  <!-- ✨ LoadingOverlay.vue 스타일 적용 -->
  <div v-if="isLoadingChatRoom" class="loading-spinner-container">
    <!-- 로딩 스피너 (다층 원 + 중심점) -->
    <!--
    <div class="loading-spinner-wrapper">
      <div class="spinner-ring spinner-ring-1"></div>
      <div class="spinner-ring spinner-ring-2"></div>
      <div class="spinner-center"></div>
    </div>
  -->
    <!-- 로딩 텍스트 (Toss 스타일 점 애니메이션) -->
    <p class="loading-text">
      <!-- 이전 대화 불러오는 중 -->
      <span class="loading-dots">
        <span class="dot dot-1">·</span>
        <span class="dot dot-2">·</span>
        <span class="dot dot-3">·</span>
      </span>
    </p>
  </div>

  <!-- ✨ 로딩 완료: 메시지 있음 -> 메세지 영역 로딩 -->
  <section
    v-else-if="
      (Array.isArray(messages) && messages.length > 0 && !isStreaming) ||
      isStreaming
    "
    class="chat-messages-section"
  >
    <div
      ref="messagesContainerRef"
      class="messages-container"
      @scroll="handleScroll"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-group"
        :class="{ 'is-user': message.role === 'user' }"
      >
        <!-- 사용자 메시지 -->
        <template v-if="message.role === 'user'">
          <div class="user-message-wrapper">
            <img :src="defaultProfileImage" alt="프로필" class="user-avatar" />
            <div class="message-content-wrapper">
              <div class="message-bubble user-bubble">
                <p class="message-content-user">
                  {{ message.content }}
                </p>
              </div>
              <span class="message-time-user">{{
                formatTime(message.createdAt)
              }}</span>
            </div>
          </div>
        </template>

        <!-- AI 어시스턴트 메시지 부분 -->
        <template v-else>
          <div class="assistant-message-wrapper">
            <div class="assistant-content-wrapper">
              <div class="message-header no-drag">
                <span class="assistant-name">
                  AI assistant
                  <span v-if="currentAgentName" class="agent-badge">
                    ({{ currentAgentName }})
                  </span>
                </span>
              </div>

              <div class="message-bubble assistant-bubble">
                <!-- ✨ 마크다운 렌더링 영역 (v-html 사용) -->
                <div
                  class="message-content-assistant markdown-content"
                  v-html="parseMarkdown(message.content)"
                ></div>

                <!-- 메타데이터 & 액션 버튼 -->
                <div class="message-footer no-drag">
                  <div class="message-actions">
                    <button
                      class="action-btn"
                      @click="handleLike(message)"
                      :class="{ active: message.liked }"
                      title="좋아요"
                    >
                      <CommonIcon
                        class="up-thumb-icon"
                        :src="upThumbIconPath"
                        :size="16"
                        alt="좋아요 아이콘"
                      />
                    </button>
                    <button
                      class="action-btn"
                      @click="handleDislike(message)"
                      :class="{ active: message.disliked }"
                      title="싫어요"
                    >
                      <CommonIcon
                        class="down-thumb-icon"
                        :src="downThumbIconPath"
                        :size="16"
                        alt="싫어요 아이콘"
                      />
                    </button>
                    <button
                      class="action-btn"
                      @click="handleCopy(message.content)"
                      title="복사하기"
                    >
                      <CommonIcon
                        class="chat-copy-icon"
                        :src="chatCopyIconPath"
                        :size="16"
                        alt="복사 아이콘"
                      />
                    </button>
                    <button
                      class="action-btn"
                      @click="handleRefresh(message)"
                      title="새로고침"
                    >
                      <CommonIcon
                        class="chat-refresh-icon"
                        :src="chatRefreshIconPath"
                        :size="16"
                        alt="새로고침 아이콘"
                      />
                    </button>
                  </div>
                  <div class="message-metadata">
                    <span
                      v-if="message.metadata?.usage?.total_tokens"
                      class="token-info"
                    >
                      {{ message.metadata.usage.total_tokens }} tokens
                    </span>
                    <span
                      v-if="message.metadata?.usage?.latency"
                      class="latency-info"
                    >
                      {{ (message.metadata.usage.latency * 1000).toFixed(0) }}ms
                    </span>
                    <span class="message-time-assistant">{{
                      formatTime(message.createdAt)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ✨ 스트리밍 중인 메시지 -->
      <div v-if="isStreaming" class="message-group is-streaming">
        <div class="assistant-message-wrapper">
          <div class="assistant-content-wrapper">
            <div class="message-header">
              <span class="assistant-name">
                AI assistant
                <span v-if="currentAgentName">({{ currentAgentName }})</span>
              </span>
            </div>
            <div class="message-bubble assistant-bubble is-streaming">
              <div
                class="message-content-assistant typing-text markdown-content"
              >
                <template v-if="displayedMessage === ''">
                  <span class="loading-dots">• • •</span>
                  <span class="typing-cursor"></span>
                </template>
                <template v-else>
                  <span
                    v-html="parseMarkdown(displayedMessage) + getCursorSpan()"
                  ></span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref="messagesEndRef" class="messages-end"></div>
    </div>

    <!-- ✅ 스크롤 다운 버튼 -->
    <Transition name="scroll-down-btn">
      <button
        v-if="showScrollDownBtn"
        class="scroll-down-btn"
        @click="scrollToBottom"
        aria-label="아래로 스크롤"
        title="새 메시지를 확인하세요"
      >
        <CommonIcon :src="scrollDownIconPath" :size="25" alt="스크롤 다운" />
      </button>
    </Transition>
  </section>

  <!-- ✨ 메시지 없을 때: GreetingSection + CardListSection -->
  <section
    v-else-if="!isLoadingChatRoom && dataStore.aiAgentInfoList.length > 0"
    class="greeting-and-cards-section"
  >
    <!-- ✨ welcomeSnippet 배너 (채팅 상단에 위치) -->
    <transition name="slideDown">
      <div v-if="welcomeSnippet" class="welcome-message-banner">
        <div class="welcome-message-content">
          <span class="welcome-icon">🔔</span>
          <span class="welcome-text">{{ welcomeSnippet }}</span>
        </div>
        <button
          class="welcome-close-btn"
          @click="closewelcomeSnippet"
          title="닫기"
        >
          ✕
        </button>
      </div>
    </transition>
    <GreetingSection />
    <CardListSection
      :current-card-index="currentCardIndex"
      @update:current-card-index="currentCardIndex = $event"
      @agent-select="handleAgentSelect"
    />
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useConfigStore } from "@/stores/useConfigStore";
import { useDataStore } from "@/stores/model/dataStore";
import CommonIcon from "@/components/icon/CommonIcon.vue";
import chatCopyIconPath from "@/assets/images/icon/chat-copy.png";
import chatRefreshIconPath from "@/assets/images/icon/chat-refresh.png";
import upThumbIconPath from "@/assets/images/icon/up-thumb.png";
import downThumbIconPath from "@/assets/images/icon/down-thumb.png";
import GreetingSection from "./GreetingSection.vue";
import CardListSection from "./CardListSection.vue";
import { parseMarkdown, formatTime } from "@/api/util";
import scrollDownIconPath from "@/assets/images/icon/down-white-arrow.png";

// ==================== Store ====================
const configStore = useConfigStore();
const dataStore = useDataStore();
const { defaultProfileImage } = configStore;
const currentCardIndex = ref(0);
const currentAgentName = computed(() => dataStore.currentAgentName);

// ==================== Props ====================
const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    required: true,
  },
  displayedMessage: {
    type: String,
    required: true,
  },
  chatUiMode: {
    type: String,
    required: true,
  },
  isLoadingChatRoom: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "like-message",
  "dislike-message",
  "refresh-message",
  "agent-select",
]);

// ==================== State ====================
const messagesContainerRef = ref(null);
const messagesEndRef = ref(null);
const showScrollDownBtn = ref(false);
const scrollThreshold = 300; // 300px 이상 떨어지면 아이콘 표시

// ✨ welcomeSnippet 상태 추가 (안내글 표시용)
const welcomeSnippet = ref("");

// ==================== Expose ====================
defineExpose({
  messagesContainerRef,
  messagesEndRef,
});

// ==================== Methods ====================

/**
 * 🔄 스크롤 이벤트 핸들러
 * - 현재 스크롤 위치 확인
 * - 맨 아래에서 300px 이상 떨어지면 아이콘 표시
 */
const handleScroll = () => {
  if (!messagesContainerRef.value) return;

  const container = messagesContainerRef.value;
  const { scrollTop, scrollHeight, clientHeight } = container;

  // 스크롤이 맨 아래에서 얼마나 떨어져 있는지 계산
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

  console.log(
    `📊 스크롤 위치 - 하단까지 거리: ${Math.round(distanceFromBottom)}px`,
  );

  // 300px 이상 떨어지면 아이콘 표시
  showScrollDownBtn.value = distanceFromBottom > scrollThreshold;
};

/**
 * 🔽 맨 아래로 스크롤 이동
 */
const scrollToBottom = async () => {
  await nextTick(() => {
    if (messagesContainerRef.value) {
      const container = messagesContainerRef.value;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
        console.log("📜 맨 아래로 스크롤 이동");
      });
    }
  });
};

/**
 * 에이전트 선택 메소드 (CardListSection용)
 */
const handleAgentSelect = (payload) => {
  dataStore.setCurrentAgentName(payload.agentName);
  emit("agent-select", payload);
};

/**
 * 좋아요 버튼 클릭 핸들러
 */
const handleLike = (message) => {
  console.log("👍 좋아요 클릭:", message.id);
  message.liked = !message.liked;
  if (message.liked) {
    message.disliked = false;
  }
  emit("like-message", {
    messageId: message.id,
    liked: message.liked,
  });
};

/**
 * 싫어요 버튼 클릭 핸들러
 */
const handleDislike = (message) => {
  console.log("👎 싫어요 클릭:", message.id);
  message.disliked = !message.disliked;
  if (message.disliked) {
    message.liked = false;
  }
  emit("dislike-message", {
    messageId: message.id,
    disliked: message.disliked,
  });
};

/**
 * 복사하기 버튼 클릭 핸들러
 */
const handleCopy = async (content) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
      console.log("📋 복사 성공:", content.substring(0, 50) + "...");
      alert("메시지가 복사되었습니다!");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand("copy");
        console.log("📋 복사 성공 (fallback)");
        alert("메시지가 복사되었습니다!");
      } catch (err) {
        console.error("❌ 복사 실패:", err);
        alert("복사에 실패했습니다.");
      }

      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.error("❌ 복사 중 오류:", err);
    alert("복사 중 오류가 발생했습니다.");
  }
};

/**
 * 새로고침 버튼 클릭 핸들러
 */
const handleRefresh = (message) => {
  console.log("🔄 새로고침 클릭:", message.id);
  emit("refresh-message", {
    messageId: message.id,
  });
};

/**
 * ✨ getCursorSpan - 타이핑 커서 HTML 생성
 */
const getCursorSpan = () => {
  return '<span class="typing-cursor"></span>';
};

const shouldShowTags = (index) => {
  if (!dataStore.isFromCard) return false;
  const message = props.messages[index];
  if (message.role !== "assistant") return false;
  let assistantCount = 0;
  for (let i = 0; i <= index; i++) {
    if (props.messages[i].role === "assistant") assistantCount++;
  }
  return assistantCount === 1;
};

/**
 * ============================================================
 * 🎯 handleServiceAgentSelect: 서비스 에이전트 안내글 표시
 * ============================================================
 *
 * 역할:
 * 1. 에이전트 이름 저장 (dataStore)
 * 2. welcomeSnippet를 안내배너로 표시 (messages 추가 X)
 * 3. 화면에 자동으로 렌더링됨 ✨
 *
 * @param {object} agent - dataStore.selectedServiceAgent
 * @example
 * {
 *   agentName: "문서생성",
 *   type: "serviceCard",
 *   welcomeSnippet: "국정감사 관한 문의사항이 있다면...",
 *   agentData: { id, name, icon }
 * }
 *
 * ============================================================
 */
const handleServiceAgentSelect = (agent) => {
  console.group("🤖 [handleServiceAgentSelect] 시작");
  console.log("에이전트:", agent);

  // ✨ 1단계: 에이전트 이름을 dataStore에 저장
  if (agent.agentName) {
    dataStore.setCurrentAgentName(agent.agentName);
    console.log("✅ 에이전트 이름 저장:", agent.agentName);
  }

  // ✨ 2단계: welcomeSnippet를 배너로 표시 (messages 추가 X)
  if (agent.welcomeSnippet) {
    welcomeSnippet.value = agent.welcomeSnippet;
    console.log("✨ 안내메시지 배너 표시됨:", agent.welcomeSnippet);
  }

  console.groupEnd();
};

/**
 * ✨ closewelcomeSnippet: 안내배너 닫기
 */
const closewelcomeSnippet = () => {
  welcomeSnippet.value = "";
  console.log("✕ 안내메시지 배너 닫음");
};

// ==================== Watchers ====================

/**
 * 👀 메시지 추가 시 자동으로 맨 아래 확인
 */
watch(
  () => props.messages.length,
  () => {
    // 스트리밍 중이면 아이콘 숨김
    if (props.isStreaming) {
      showScrollDownBtn.value = false;
    }
  },
);

/**
 * 👀 스트리밍 상태 변경 시
 */
watch(
  () => props.isStreaming,
  (isStreaming) => {
    if (!isStreaming) {
      // 스트리밍 완료 시 스크롤 위치 다시 확인
      handleScroll();
    } else {
      // 스트리밍 중이면 아이콘 숨김
      showScrollDownBtn.value = false;
    }
  },
);

/**
 * 👀 displayedMessage 변경 시 자동 스크롤
 */
watch(
  () => props.displayedMessage,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
);

/**
 * 🎯 watch: selectedServiceAgent 모니터링
 */
watch(
  () => dataStore.selectedServiceAgent,
  (newAgent) => {
    if (newAgent && newAgent.type === "serviceCard") {
      console.log(
        "🎯 [ChatConversationSection] 서비스 에이전트 선택됨:",
        newAgent,
      );
      handleServiceAgentSelect(newAgent);
    }
  },
  { immediate: true, deep: true },
);
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;

/* ================================================================
 * ✨ 환영 메시지 배너 (옵션1: 채팅창 최상단)
 *
 * 📝 개선사항:
 * - 메시지가 있을 때도 보여지도록 수정
 * - 소박한 스타일로 기존 UI 해치지 않음
 * - 부드러운 슬라이드 다운 애니메이션
 * ================================================================ */

.welcome-message-banner {
  /* 👈 이 4줄 추가 */
  position: absolute;
  top: 540px;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
  width: 55%;
  padding: 12px 20px; /* 👈 세로 패딩 줄임 */
  background: linear-gradient(135deg, #fff8e1 0%, #fffacd 100%);
  border-bottom: 1px solid #ffc107; /* 👈 두께 줄임 */
  border-radius: 15px; /* 👈 라운드 줄임 */
  margin-bottom: 0; /* 👈 마진 조정 */
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 4px rgba(255, 193, 7, 0.15); /* 👈 그림자 약함 */
}

.welcome-message-content {
  display: flex;
  align-items: flex-start;
  gap: 0;
  flex: 1;
  min-width: 0;
}

.welcome-icon {
  font-size: 13px; /* 👈 크기 줄임 */
  flex-shrink: 0;
  margin-top: 1px;
}

.welcome-text {
  font-size: 13px; /* 👈 폰트 크기 줄임 */
  color: #856404;
  font-weight: 500;
  line-height: 1.4; /* 👈 라인높이 줄임 */
  word-break: break-word;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    font-size: 12px;
  }
}

.welcome-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px; /* 👈 크기 줄임 */
  height: 20px;
  min-width: 20px;
  background-color: transparent;
  border: none;
  color: #ffc107;
  font-size: 16px; /* 👈 크기 줄임 */
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #ff9800;
    transform: scale(1.15);
  }

  &:active {
    transform: scale(0.95);
  }
}

/* ================================================================
 * 로딩 스피너 컨테이너 (기본 레이아웃)
 * ================================================================ */
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  max-width: 1064px;
  margin: 0 auto;
  gap: 6rem; /* $spacing-6 */
  min-height: 600px;
  animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  @media (max-width: 768px) {
    min-height: 400px;
    gap: 1.5rem;
  }
}

/* ================================================================
 * 로딩 스피너 래퍼 (다층 원 구조)
 * 
 * LoadingOverlay.vue와 동일한 구조:
 * - 외부 원: 시계방향 (spinner-ring-1)
 * - 중간 원: 반시계방향 (spinner-ring-2)
 * - 중심점: 스케일 애니메이션 (spinner-center)
 * ================================================================ */
.loading-spinner-wrapper {
  position: relative;
  width: 80px; /* 기존 60px → 80px로 확대 */
  height: 80px;

  display: flex;
  justify-content: center;
  align-items: center;
}

/* ================================================================
 * spinner-ring: 회전하는 원의 테두리
 * ================================================================ */
.spinner-ring {
  position: absolute;
  border: 5px solid rgba(white, 0.15); /* 투명한 배경 */
  border-radius: 50%;

  /* 상단만 색상 표시 (회전 효과 생성) */
  border-top-color: var(--primary-color, #d0021b);
  border-right-color: rgba(var(--primary-color-rgb, 208, 2, 27), 0.3);
}

/**
 * spinner-ring-1: 외부 원
 * 
 * - 크기: 80px
 * - 회전 방향: 시계방향
 * - 회전 속도: 1.2초 (빠름)
 * - 시작 각도: 0도
 */
.spinner-ring-1 {
  width: 80px;
  height: 80px;
  animation: spin-clockwise 1.2s linear infinite;
}

/**
 * spinner-ring-2: 중간 원
 * 
 * - 크기: 60px (외부보다 작음)
 * - 회전 방향: 반시계방향
 * - 회전 속도: 1.8초 (느림)
 * - 대조 효과: 두 원이 반대로 회전
 */
.spinner-ring-2 {
  width: 60px;
  height: 60px;
  animation: spin-counter-clockwise 1.8s linear infinite;
}

/**
 * spinner-center: 중심점
 * 
 * 역할:
 * - 회전 중심 표시
 * - 시각적 안정감
 * - 스케일 애니메이션으로 생동감
 */
.spinner-center {
  position: absolute;
  width: 16px;
  height: 16px;
  background-color: var(--primary-color, #d0021b);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(var(--primary-color-rgb, 208, 2, 27), 0.5);

  /* 중심점이 살짝 커졌다 작아지는 효과 */
  animation: pulse-scale 2s ease-in-out infinite;

  z-index: 10;
}

/* ================================================================
 * 로딩 텍스트 (Toss 스타일 점 애니메이션)
 * ================================================================ */
.loading-text {
  margin: 0;
  font-size: 6.5rem; /* $font-size-base */
  font-weight: 900;
  color: var(--primary-text, #565555);
  letter-spacing: 0.5px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

/**
 * loading-dots: 점 애니메이션 컨테이너
 * 
 * 구조:
 * <span class="loading-dots">
 *   <span class="dot dot-1">·</span>
 *   <span class="dot dot-2">·</span>
 *   <span class="dot dot-3">·</span>
 * </span>
 * 
 * 동작:
 * 각 점이 200ms 시간차로 순차적으로 fade in/out
 * "로딩 중" + "." + "." + "." 반복
 */
.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  margin-left: 0.3rem;
  vertical-align: middle;
}

/**
 * dot: 각 점(.)의 개별 애니메이션
 * 
 * - 가로: 0.3em (텍스트 크기에 따라 변함)
 * - 세로: 1em (텍스트 높이와 동일)
 * - 애니메이션: dot-fade (opacity 변화)
 * - 지속시간: 1.2초
 * 
 * 시간차 배치:
 * dot-1: 0ms (즉시 시작)
 * dot-2: 200ms (첫 번째 후)
 * dot-3: 400ms (두 번째 후)
 * 
 * 결과: 물결 효과의 부드러운 로딩 표현
 */
.dot {
  display: inline-block;
  width: 0.3em;
  height: 1em;
  line-height: 1;
  animation-duration: 1.2s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-name: dot-fade;

  &.dot-1 {
    animation-delay: 0ms;
  }

  &.dot-2 {
    animation-delay: 200ms;
  }

  &.dot-3 {
    animation-delay: 400ms;
  }
}

/* ================================================================
 * 키프레임 애니메이션 추가/수정
 * 
 * 기존의 spinnerRotate는 제거하고 다음으로 대체:
 * ================================================================ */

/**
 * scale-in: 래퍼 진입 애니메이션
 * 아래에서 올라오는 '튀는' 느낌
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
 * spin-clockwise: 시계방향 회전
 * spinner-ring-1 (외부 원) 용
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
 * spinner-ring-2 (중간 원) 용
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
 * scale(1) → scale(1.3) → scale(1)
 * 중심점이 살짝 커졌다 작아짐
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
 * dot-fade: 점 투명도 애니메이션
 * 
 * 동작:
 * opacity: 1 → 0.3 → 1
 * 각 점이 흐려졌다 또렷해짐
 * 
 * 3개 점의 시간차 조합으로 물결 효과 생성
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
/* ================================================================
 * 🎯 채팅 메시지 섹션
 * ================================================================ */

.chat-messages-section {
  display: flex;
  flex: 1;
  width: 100%;
  min-width: 1064px;
  max-width: 1264px;
  //
  min-height: 700px;
  max-height: calc(100vh - 400px);
  margin: 0 auto;
  padding: $spacing-4 0;
  animation: fadeInUp 0.5s ease-out;
  overflow: hidden;
  flex-direction: column;
  position: relative;

  @media (max-width: 768px) {
    padding: $spacing-2 0;
  }
}

.messages-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding-right: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.07);
    border-radius: 4px;
    transition: background 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.1);
  }

  @media (max-width: 768px) {
    gap: $spacing-4;
    max-height: calc(100vh - 350px);
    padding-right: $spacing-1;
    padding-bottom: $spacing-3;

    &::-webkit-scrollbar {
      width: 4px;
    }
  }
}

.message-group {
  display: flex;
  flex-direction: column;
  animation: slideInUp 0.3s ease-out;

  &.is-user {
    padding: 40px 0 40px 20px;
  }
}

// ==================== 태그 표시 영역 ====================
.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-bottom: $spacing-2;
  padding-left: $spacing-1;
  animation: slideInLeft 0.3s ease-out;
}

.message-tag {
  display: inline-block;
  padding: $spacing-1 $spacing-3;
  background-color: var(--main-hover-color);
  color: var(--primary-color);
  border-radius: $border-radius-full;
  font-size: $font-size-xs;
  font-weight: 600;
  border: 1px solid var(--primary-color);
}

// ==================== 사용자 메시지 ====================

.user-message-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: $spacing-3;

  .user-avatar {
    align-items: flex-start;
    width: 43px;
    height: 43px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .message-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  .user-bubble {
    align-items: flex-end;
    background-color: $gray-100;
    border-radius: 25px !important;
    padding: 11px 24px;
    word-wrap: break-word;
    font-weight: 400;
    font-style: Regular;
    font-size: 17px;
    line-height: 100%;
    letter-spacing: 0%;
    color: $black;

    @media (max-width: 768px) {
      max-width: calc(100vw - 120px);
    }
  }

  .message-content-user {
    margin: 0;
    line-height: 1.6;
    color: $black;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 18px;
    font-weight: 400;
  }

  .message-time-user {
    display: block;
    font-size: 11px;
    color: $gray-400;
    padding-right: 4px;
    width: 100%;
    text-align: right;
  }
}

// ==================== AI 어시스턴트 메시지 ====================

.assistant-message-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  border-bottom: 1px solid $gray-300;
  width: 100%;
  padding-top: 20px;
  padding-left: 20px;

  .assistant-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
    flex: 1;
    max-width: calc(100% - 44px);
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: $spacing-2;

    .assistant-name {
      color: $black;
      line-height: 100%;
      font-weight: 800;
      font-style: Regular;
      font-size: 19px;
      line-height: 100%;
      letter-spacing: 0%;
    }
  }

  .assistant-bubble {
    background-color: transparent;
    padding: 15px 0 15px 15px;
    max-width: 100%;
  }

  .message-content-assistant {
    margin: 0;
    line-height: 2.2;
    color: #565555;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 18px;
    font-weight: 400;
    padding-bottom: $spacing-2;
  }

  .message-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
    margin-top: $spacing-1;
    flex-wrap: wrap;
  }

  .message-metadata {
    display: flex;
    gap: $spacing-2;
    font-size: 13px;

    .token-info,
    .latency-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: $gray-200;
    }

    .message-time-assistant {
      color: $gray-400;
      text-align: right;
    }
  }

  .message-actions {
    display: flex;
    gap: $spacing-1;

    .action-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.2s ease;
      opacity: 0.6;

      &:hover {
        opacity: 1;
        background-color: $gray-100;
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }

      &.active {
        opacity: 1;
        background-color: $gray-200;
      }
    }
  }
}

/* ================================================================
 * ✨ 마크다운 컨텐츠 스타일 (표, 참고자료 등)
 * ================================================================ */

.markdown-content {
  :deep(p) {
    margin: 0;
    line-height: 2;

    &:empty {
      display: none;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 0;
    font-size: 14px;
    background-color: $white;
    border: 1px solid $gray-300;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(thead) {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid $gray-300;
  }

  :deep(th) {
    padding: 14px 16px;
    text-align: left;
    font-weight: 700;
    color: $black;
    font-size: 13px;
    letter-spacing: 0.3px;
    border-bottom: 2px solid $gray-300;

    &:first-child {
      border-top-left-radius: 12px;
    }

    &:last-child {
      border-top-right-radius: 12px;
    }
  }

  :deep(tbody) {
    background-color: $white;
  }

  :deep(td) {
    padding: 12px 16px;
    color: #565555;
    border-bottom: 1px solid $gray-200;
    transition: background-color 0.2s ease;
  }

  :deep(tr) {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 123, 255, 0.03);
    }

    &:last-child td {
      border-bottom: none;

      &:first-child {
        border-bottom-left-radius: 12px;
      }

      &:last-child {
        border-bottom-right-radius: 12px;
      }
    }
  }

  :deep(.reference-tag) {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 10px 16px;
    margin: 4px 6px 4px 0;
    background-color: $white;
    border: 1px solid $gray-300;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: $primary-text;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    animation: tagSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;

    &:hover {
      background-color: $gray-100;
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    &[class*=".pdf"] {
      border-color: #ff6b6b;
      color: #d63031;
    }

    &[class*=".docx"],
    &[class*=".doc"] {
      border-color: #4a90e2;
      color: #2563eb;
    }

    &[class*=".xlsx"],
    &[class*=".xls"] {
      border-color: #00b894;
      color: #059669;
    }
  }

  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    border-bottom: 1px solid transparent;

    &:hover {
      border-bottom-color: var(--primary-color);
      opacity: 0.8;
    }
  }

  :deep(code) {
    background-color: $gray-100;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "Courier New", monospace;
    font-size: 13px;
    color: #c7254e;
  }

  :deep(pre) {
    background-color: $gray-100;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: transparent;
      padding: 0;
      color: $black;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 8px 0;
    padding-left: 24px;
    padding: 0;
    padding-left: 10px;
    margin: 0;
    line-height: 0;

    li {
      margin: 0;
      line-height: 1.5;
    }
  }

  :deep(blockquote) {
    border-left: 4px solid var(--primary-color);
    padding-left: 16px;
    margin: 8px 0;
    color: $gray-600;
    font-style: italic;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    margin: 16px 0 8px 0;
    font-weight: 700;
    color: $black;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h1) {
    font-size: 24px;
  }

  :deep(h2) {
    font-size: 20px;
  }

  :deep(h3) {
    font-size: 17px;
  }
}

/* ================================================================
 * 🔽 스크롤 다운 버튼
 * ================================================================ */
.scroll-down-btn {
  position: absolute;
  bottom: 30px;
  right: 30px;
  width: 40px;
  height: 40px;
  padding: 10px;
  border-radius: 100%;
  background: var(--primary-color);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }

  svg {
    animation: bounce 1.5s infinite;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* ================================================================
 * ✨ Transition 애니메이션 (버튼 등장/사라짐)
 * ================================================================ */
.scroll-down-btn-enter-active,
.scroll-down-btn-leave-active {
  transition: all 0.3s ease;
}

.scroll-down-btn-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.scroll-down-btn-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* ================================================================
 * 애니메이션
 * ================================================================ */

.messages-end {
  height: 0;
  margin: 0;
  padding: 0;
  border: none;
}

.loading-dots {
  animation: typingDots 1.4s ease-in-out infinite;
  color: $primary-text;
  letter-spacing: 4px;
  font-weight: bold;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: var(--primary-color);
  margin-left: 2px;
  animation: typingCursor 0.6s ease-in-out infinite;
  vertical-align: baseline;
}

@keyframes typingCursor {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInOutText {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

@keyframes spinnerRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes tagSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// ✨ 슬라이드 다운 애니메이션 (배너)
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ✨ Transition 애니메이션 정의
.slideDown-enter-active,
.slideDown-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slideDown-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.slideDown-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.greeting-and-cards-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
  position: relative; /* 👈 이 줄만 추가 */

  @media (max-width: 768px) {
    gap: $spacing-4;
  }
}
</style>
