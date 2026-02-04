<!-- src/components/main/MainPage.vue -->
<template>
  <main class="main-content">
    <ChatConversationSection
      ref="chatMessagesRef"
      @agent-select="handleAgentSelect"
      :messages="messagesData"
      :is-streaming="dataStore.isStreaming"
      :displayed-message="displayedMessage"
      :chat-ui-mode="chatUiMode"
      :is-loading-chat-room="isLoadingChatRoom"
      :current-agent-name="currentAgentName"
      @like-message="handleLikeMessage"
      @dislike-message="handleDislikeMessage"
      @refresh-message="handleRefreshMessage"
    />
    <ChatInputSection
      ref="chatInputRef"
      v-model="chatMessage"
      @start-new-chat="handleStartNewChat"
      @before-send-message="resetStreamingState"
    />
  </main>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import ChatConversationSection from "./sections/ChatConversationSection.vue";
import ChatInputSection from "./sections/ChatInputSection.vue";
import { useDataStore } from "@/stores/model/dataStore";

import { getChatRoomDetail } from "@/api/modules/chatRoomApi";
import { createChatRoom } from "@/api/modules/chatRoomApi";

// ==================== Global Style Injection ====================
const chatMessage = ref("");
const injectGlobalStyle = () => {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes typingDots {
      0% { opacity: 1; transform: translateY(0); }
      25% { opacity: 1; transform: translateY(-8px); }
      50% { opacity: 1; transform: translateY(0); }
      75% { opacity: 1; transform: translateY(-8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  console.log("✅ Global style inject 완료");
};

injectGlobalStyle();

// ==================== Stores ====================
const dataStore = useDataStore();

// ==================== State ====================
const chatMessagesRef = ref(null);
const chatInputRef = ref(null);
const displayedMessage = ref("");
const isLoadingChatRoom = ref(false);
const chatRoomLoadError = ref(null);

const TYPING_SPEED = 15;
const MIN_LOADING_TIME = 1500;
let typingIntervalId = null;

// ==================== Computed ====================

const currentAgentName = computed(() => dataStore.currentAgentName);

/**
 * 📌 채팅 UI 모드
 *
 * agent 모드인 경우: AI Agent 이름 표시
 * model 모드인 경우: 선택된 모델명 표시
 */
const chatUiMode = computed(() => {
  if (dataStore.chatMode === "agent") {
    return dataStore.selectedAiAgent || "AI Agent";
  }
  return dataStore.selectedModel || "Model";
});

/**
 * 📌 messagesData computed
 *
 * ✨ 핵심 역할:
 * - dataStore.messages 변경 시 자동 업데이트
 * - ChatMessagesSection에 반응성 있는 props 전달
 * - 메시지 로드 완료 시 즉시 UI 업데이트
 *
 * Vue3 vs Vue2:
 * - Vue3: computed(() => { return ... }) - 함수형, 더 간결
 * - Vue2: computed: { messagesData() { return ... } } - 객체형
 *
 * 🔑 중요:
 * - getMessages()를 직접 호출하면 매번 새로운 배열 반환
 * - computed로 감싸면 의존성 추적 가능
 * - 배열 내용이 변경되면 자동으로 업데이트됨
 */
const messagesData = computed(() => {
  const msgs = dataStore.getMessages() || [];
  console.log("📨 messagesData computed 업데이트:", {
    messageCount: msgs.length,
    isStreaming: dataStore.isStreaming,
    displayMode: dataStore.chatDisplayMode,
  });
  return msgs;
});

// ==================== Methods ====================

/**
 * 🔑 메시지 전송 직전 상태 초기화
 * ChatInputSection에서 메시지 전송 전에 이 함수를 호출하거나,
 * emit으로 신호를 보내면 displayedMessage를 초기화합니다
 */
/**
 * 🔑 새 채팅 상태 초기화 (확장 버전)
 */
const resetStreamingState = (isNewChat = false) => {
  console.log("✨ [resetStreamingState] 스트리밍 상태 초기화", { isNewChat });
  displayedMessage.value = "";
  dataStore.isStreaming = false;
  // ✅ 새 채팅 시작인 경우 추가 초기화
  if (isNewChat) {
    dataStore.initializeSessionFields();
  }
};

/**
 * 에이전트 태그 갱신 From Message
 */
const refreshOrClearAgentsTag = (agents, message) => {
  console.log("refreshOrClearAgentsTag:", {
    agents,
    message,
  });
  if (agents && agents.length > 0) {
    dataStore.wholeTagInfoList = [];
    dataStore.aiAgentTagList = [];
    dataStore.attachedFiles = [];
  } else {
    console.log("📭 agents가 없음 - 일반 채팅방");
  }
};

/**
 * 스크롤을 최하단으로 이동
 */
const scrollToBottom = async () => {
  await nextTick(() => {
    if (chatMessagesRef.value?.messagesContainerRef) {
      const container = chatMessagesRef.value.messagesContainerRef;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "auto",
        });
      });
    }
  });
};

/**
 * 타이핑 애니메이션 효과
 */
const typeMessage = async (message) => {
  console.log(`🎬 타이핑 시작`);
  return new Promise((resolve) => {
    if (!message || typeof message !== "string") {
      console.warn("⚠️ Invalid message:", message);
      resolve();
      return;
    }

    console.log(`📝 타이핑 시작: ${message.length}자`);

    let currentIndex = 0;
    displayedMessage.value = "";

    const baseSpeed = TYPING_SPEED;
    let typingSpeed = baseSpeed;

    if (message.length > 1000) {
      typingSpeed = 5;
    } else if (message.length > 500) {
      typingSpeed = Math.max(baseSpeed * 0.3, 5);
    } else if (message.length > 200) {
      typingSpeed = baseSpeed * 0.6;
    }

    const typeHandler = () => {
      if (currentIndex < message.length) {
        displayedMessage.value += message[currentIndex];
        currentIndex++;
        scrollToBottom();
      } else {
        if (typingIntervalId !== null) {
          clearInterval(typingIntervalId);
          typingIntervalId = null;
        }
        console.log(`✅ 타이핑 완료`);
        scrollToBottom();
        resolve(message);
      }
    };

    try {
      typingIntervalId = setInterval(typeHandler, typingSpeed);
    } catch (error) {
      console.error("❌ typeMessage 시작 실패:", error);
      displayedMessage.value = message;
      scrollToBottom();
      resolve(message);
    }
  });
  console.log("✅ 타이핑 완료");
};

// ============================================================
const loadChatRoomMessages = async (roomId) => {
  // 기존 메시지 초기화 및 태그/파일 제거
  // dataStore.deleteMessages();
  dataStore.initializeSessionFields();
  // 카드를 선택한것도 아니고, 기존 체팅방을 선택한것도 아닌 경우
  if (!dataStore.isFromCard && !roomId) {
    // 새 채팅방 생성 - 태그/파일 제거
    console.log("🗑️ 새 채팅방 생성 - 태그/파일 제거");
  } else {
    try {
      if (!roomId) {
        console.warn("⚠️ roomId가 없습니다");
        return;
      } else {
        // ✨ 로딩 시작
        console.log("🔄 로딩 상태 ON:", isLoadingChatRoom.value);
        chatRoomLoadError.value = null;
        isLoadingChatRoom.value = true;
        console.log("📡 getChatRoomDetail API 호출...");
        const response = await getChatRoomDetail(roomId, {
          page: 0,
          size: 1000,
        });
        if (!response) {
          throw new Error("응답 데이터가 없습니다");
        }
        console.log("✅ 채팅방 상세 조회 성공");
        const { messages = [], room = {}, agents = [] } = response;
        console.log("📦 응답 데이터 분해:", {
          roomId: response.room?.id,
          messagesCount: response.messages?.length,
          agentsCount: agents.length,
          agents: agents,
        });

        // ============================================================
        // ✅ 메시지 처리
        // ============================================================
        if (Array.isArray(messages) && messages.length > 0) {
          console.log(`📨 ${messages.length}개의 메시지 로드됨`);
          for (const message of messages) {
            if (message.query) {
              dataStore.addMessage({
                role: "user",
                content: message.query,
                agent: message.appName || "unknown",
                metadata: {
                  conversationId: message.conversationId,
                  appId: message.appId,
                  hasImage: message.hasImage,
                  hasDocument: message.hasDocument,
                },
              });
              console.log(
                `👤 사용자 메시지: "${message.query.substring(0, 30)}..."`,
              );
            }
            if (message.answer) {
              dataStore.addMessage({
                role: "assistant",
                content: message.answer,
                agent: message.appName || "unknown",
                metadata: {
                  conversationId: message.conversationId,
                  appId: message.appId,
                  hasImage: message.hasImage,
                  hasDocument: message.hasDocument,
                },
              });
              await new Promise((resolve) => setTimeout(resolve, 500));
              await scrollToBottom(); // 각메세지마다 스크롤 시도
            }
          }
          // agent tag 갱신
          refreshOrClearAgentsTag(agents, messages[messages.length - 1]);
          console.groupEnd();
        } else {
          console.log("📭 기존 메시지가 없습니다");
        }
        // ✅ UI 상태 변경
        dataStore.chatDisplayMode = "complete";
        dataStore.isStreaming = false;
        //스크롤 시도
        await new Promise((resolve) => setTimeout(resolve, 800));
        await scrollToBottom();
        console.log("✅ 메시지 로드 완료");
      }
    } catch (error) {
      console.error("❌ 채팅방 로드 실패:", error);
      chatRoomLoadError.value = error.message || "채팅방을 로드할 수 없습니다";
      dataStore.chatDisplayMode = "complete";
      dataStore.setError(chatRoomLoadError.value);
    } finally {
      // ✨ 최소 로딩 시간 보장
      const loadStartTime = Date.now();
      const elapsedTime = Date.now() - loadStartTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      // 로딩 완료
      isLoadingChatRoom.value = false;

      //스크롤 시도
      await new Promise((resolve) => setTimeout(resolve, 800));
      await scrollToBottom();
      console.log("🔄 로딩 상태 OFF:", isLoadingChatRoom.value);
    }
  }
};

// ==================== Event Handlers ====================
const handleLikeMessage = ({ messageId, liked }) => {
  console.log(`👍 메시지 ${messageId} 좋아요:`, liked);
};

const handleDislikeMessage = ({ messageId, disliked }) => {
  console.log(`👎 메시지 ${messageId} 싫어요:`, disliked);
};

const handleRefreshMessage = ({ messageId }) => {
  console.log(`🔄 메시지 ${messageId} 새로고침`);

  const messages = dataStore.getMessages();
  const currentIndex = messages.findIndex((msg) => msg.id === messageId);

  if (currentIndex === -1) {
    console.warn("⚠️ 메시지를 찾을 수 없습니다.");
    return;
  }

  let userQuestion = null;
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      userQuestion = messages[i].content;
      break;
    }
  }

  if (!userQuestion) {
    console.warn("⚠️ 이전 질문을 찾을 수 없습니다.");
    return;
  }

  console.log(`📤 질문 재전송: ${userQuestion}`);
  chatMessage.value = userQuestion;
};

/**
 * 사이드바에서 "새 채팅" 버튼 클릭 시 호출
 */
const refreshMainPagePartly = () => {
  console.log("🔄 [refreshMainPagePartly] 부모에서 새 채팅 초기화 요청");
  handleNewChatReset(); // ← 이 함수 호출!
};

/**
 * ============================================================
 * 🆕 handleNewChatReset - 새 채팅 시작 (상태 초기화)
 * ============================================================
 *
 * 역할:
 * 1️⃣ 모든 채팅 상태 초기화
 * 2️⃣ 메시지 배열 초기화
 * 3️⃣ Agent/Model 선택 초기화
 * 4️⃣ UI를 초기 상태(CardListSection)로 리셋
 *
 * 언제 호출?
 * - "새 채팅" 버튼 클릭 시
 * - ExpandSidebar의 "새 채팅" 옵션 클릭 시
 */
const handleNewChatReset = () => {
  console.group("🆕 [handleNewChatReset] 새 채팅 초기화");

  try {
    // ✅ 1️⃣ 채팅 UI 상태 초기화
    console.log("1️⃣ 채팅 상태 초기화");
    dataStore.deleteAllChatState();
    dataStore.currentRoomId = ""; // ← 핵심! roomId 초기화
    console.log("✅ currentRoomId 초기화됨: ''");

    // ✅ 2️⃣ 메시지 배열 초기화
    console.log("2️⃣ 메시지 배열 초기화");
    dataStore.deleteMessages();
    console.log("✅ 메시지 배열 초기화됨");

    // ✅ 3️⃣ 대화방 타입 초기화
    console.log("3️⃣ 대화방 타입 초기화");
    dataStore.currentRoomType = null;
    console.log("✅ currentRoomType 초기화됨: null");

    // ✅ 4️⃣ Agent/Model 선택 상태 초기화
    console.log("4️⃣ Agent/Model 선택 초기화");
    dataStore.deleteAgent();
    dataStore.attachedFiles = [];
    dataStore.deleteModel();
    console.log("✅ Agent/Model 선택 초기화됨");

    // ✅ 5️⃣ 입력창 초기화
    console.log("5️⃣ 입력창 초기화");
    chatMessage.value = "";
    console.log("✅ chatMessage 초기화됨");

    // ✅ 6️⃣ isFromCard 초기화
    console.log("6️⃣ isFromCard 초기화");
    dataStore.isFromCard = false;
    console.log("✅ isFromCard 초기화됨");

    // ✅ 7️⃣ 채팅 display 모드 초기화 (카드 표시)
    console.log("7️⃣ chatDisplayMode 초기화");
    dataStore.chatDisplayMode = "initial";
    console.log("✅ chatDisplayMode 초기화됨: 'initial'");

    console.log("✅ 새 채팅 초기화 완료!");
    console.groupEnd();
  } catch (error) {
    console.error("❌ 새 채팅 초기화 실패:", error);
    console.groupEnd();
  }
};

/**
 * ============================================================
 * ✅ handleStartNewChat - 새 채팅방 생성
 * ============================================================
 *
 * 역할:
 * - ChatInputArea에서 AI Agent/Model 버튼 클릭 시 발생
 * - 새 채팅방 생성 (createChatRoom API)
 * - 생성된 roomId를 chatUiStore에 저장
 * - watch(currentRoomId)가 자동으로 loadChatRoomMessages 호출
 *
 * @param {string} roomType - "agent" 또는 "model"
 */
const handleStartNewChat = async (roomType) => {
  console.group("✨ [handleStartNewChat] 새 채팅 시작");
  console.log("roomType:", roomType);

  if (isLoadingChatRoom.value) {
    console.warn("⚠️ 이미 로딩 중입니다");
    console.groupEnd();
    return;
  }

  isLoadingChatRoom.value = true;

  try {
    // 1️⃣ 새 채팅방 생성 API 호출
    console.log("📡 createChatRoom API 호출...");
    const newChatRoom = await createChatRoom({
      title: "새로운 채팅",
    });

    console.log("✅ 새 채팅방 생성됨:", {
      title: "새로운 채팅",
      roomId: newChatRoom.id,
      title: newChatRoom.title,
    });

    // 2️⃣ 대화방 타입 설정 (AI Agent 또는 Model)
    dataStore.setRoomType(roomType);
    console.log("✅ 대화방 타입 설정됨:", roomType);

    // 3️⃣ 생성된 roomId를 chatUiStore에 저장
    dataStore.setRoomId(newChatRoom.id);
    console.log("✅ roomId 저장됨:", newChatRoom.id);

    console.log("✅ 새 채팅 시작 완료");
    console.groupEnd();
  } catch (error) {
    console.error("❌ 새 채팅 생성 실패:", error);
    isLoadingChatRoom.value = false;
    alert("채팅을 생성할 수 없습니다. 다시 시도해주세요.");
    console.groupEnd();
  }
};

// ✅ 수정 후 (에이전트 정보만 저장)
const handleAgentSelect = async (payload) => {
  console.group("🎯 [handleAgentSelect] Agent 정보만 저장");

  // 1️⃣ Agent 정보 저장 (이것만!)
  dataStore.selectedAiAgent = payload.agentName;
  dataStore.selectedAiAgentData = payload.agentData;
  dataStore.aiAgentTagList = [
    {
      index: 0,
      type: "agent",
      value: `${payload.agentName}`,
      id: payload.agentData?.id,
    },
  ];
  dataStore.isFromCard = true;

  // 2️⃣ 초기 메시지 설정 (있으면)
  if (payload.message) {
    chatMessage.value = payload.message;
  }

  // 3️⃣ FAQ 타입이면 메시지 전송 (handleSendMessage에서 room이 만들어짐)
  if (payload.type === "faq") {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await nextTick();
    if (chatInputRef.value?.handleSendMessage) {
      await chatInputRef.value.handleSendMessage(); // ← 여기서 room 생성!
    }
  }

  console.groupEnd();
};
// ==================== Watchers ====================
watch(
  () => dataStore.currentRoomId,
  (newRoomId, oldRoomId) => {
    console.log("🔄 [dataStore.currentRoomId:watch] currentRoomId 변경:", {
      oldRoomId,
      newRoomId,
    });

    // ✅ 새 채팅 생성 중이면 스킵
    if (dataStore.isCreatingNewRoom) {
      console.log("⏭️ 새 채팅 생성 중이므로 getChatRoomDetail 스킵");
      dataStore.setCreatingNewRoom(false); // 플래그 리셋
      return; // ← getChatRoomDetail 호출 안 함!
    }

    // ✨ 새 채팅 요청 감지 (oldRoomId가 있었는데 newRoomId가 비워짐)
    if (oldRoomId && newRoomId === "") {
      console.log("🔄 [dataStore.currentRoomId:watch] 새 채팅 버튼 클릭 감지!");
      handleNewChatReset();
      return;
    }

    // ✨ 기존 채팅 선택
    if (newRoomId) {
      console.log("🔄 [dataStore.currentRoomId:watch] 기존 채팅 선택");
      loadChatRoomMessages(newRoomId);
    }
  },
);

watch(
  () => dataStore.isStreaming,
  (isStreaming) => {
    if (!isStreaming) {
      if (typingIntervalId !== null) {
        clearInterval(typingIntervalId);
        typingIntervalId = null;
      }
      displayedMessage.value = "";
      scrollToBottom();
    }
  },
);

watch(
  () => dataStore.messages.length,
  (newLength, oldLength) => {
    console.log(`📨 메시지 개수 변화: ${oldLength} → ${newLength}`);
    scrollToBottom();
  },
);

watch(
  () => dataStore.chatDisplayMode,
  (newMode) => {
    if (newMode === "streaming" || newMode === "complete") {
      console.log("🎬 채팅 모드 변경 - newMode - ", newMode);
      nextTick(() => {
        scrollToBottom();
      });
    }
  },
);

watch(
  () => dataStore.typingMessage,
  async (messageToType) => {
    if (!messageToType || typeof messageToType !== "string") {
      console.log("⏭️ typingMessage 비어있음");
      return;
    }
    if (typingIntervalId !== null) {
      clearInterval(typingIntervalId);
      typingIntervalId = null;
    }
    displayedMessage.value = "";
    scrollToBottom();
    await typeMessage(messageToType);
    dataStore.typingMessage = null;
  },
);

/**
 * ============================================================
 * 👀 watch: dataStore.selectedServiceAgent 변경 감지
 * ============================================================
 */
watch(
  () => dataStore.selectedServiceAgent,
  async (newServiceAgent) => {
    if (!newServiceAgent) return;

    console.group("👀 [watch] selectedServiceAgent 변경 감지");
    console.log("새로 선택된 서비스 에이전트:", newServiceAgent);

    try {
      // ✅ handleAgentSelect 호출 (기존 로직 동일)
      await handleAgentSelect(newServiceAgent);

      console.log("✅ 서비스 에이전트 선택 처리 완료");

      // ✅ 처리 완료 후 선택 초기화
      dataStore.clearServiceAgentSelection();
      console.log("🧹 selectedServiceAgent 초기화됨");
    } catch (error) {
      console.error("❌ 서비스 에이전트 선택 처리 실패:", error.message);
      dataStore.setError(error.message || "서비스 선택에 실패했습니다");
    } finally {
      console.groupEnd();
    }
  },
);

const initializeZoom = () => {
  if (window.innerWidth >= 668) {
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.style.transform = "scale(0.75)";
      mainContent.style.transformOrigin = "center";
    }
  }
};

onMounted(async () => {
  console.log("✅ MainPage 마운트됨");
  await initializeZoom();

  if (dataStore.currentRoomId) {
    console.log(
      "📡 초기 roomId로 채팅방 로드 : dataStore.currentRoomId :",
      dataStore.currentRoomId,
    );
    await loadChatRoomMessages(dataStore.currentRoomId);
  }
});

// ==================== defineExpose ====================
defineExpose({
  refreshMainPagePartly, // ← 부모 컴포넌트에서 호출 가능하게 expose
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 3rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 1rem;
    gap: $spacing-4;
  }
}

/* ================================================================
 * 🎨 빈 채팅 메시지
 * ================================================================ */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  text-align: center;
  animation: fadeIn 0.3s ease-in-out forwards;

  &__icon {
    font-size: 80px;
    opacity: 0.8;
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: 30px;
    font-weight: 600;
    color: $primary-text;
    margin-bottom: $spacing-3;
  }

  &__desc {
    font-size: 20px;
    line-height: 1.6;
    color: $secondary-text;
  }
}

/* ================================================================
 * 🎨 애니메이션 정의
 * ================================================================ */

@keyframes spinnerRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
</style>
