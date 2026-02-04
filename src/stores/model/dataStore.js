import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { modelUsageApi } from "@/api/modules/modelUsageApi";
import { useTestAuthStore } from "@/stores/useTestAuthStore";

/**
 * ============================================================
 * Data Store (통합버전 v1)
 * ============================================================
 */
export const useDataStore = defineStore(
  "data",
  () => {
    // ================================
    // 📌 STATE - 기존 dataStore
    // ================================

    /**
     * 모델 정보 목록
     */
    const modelInfoList = ref([
      {
        value: "모델선택",
        label: "모델선택",
        desc: "",
        provider: null,
        modelName: null,
        currentUsage: 0,
        maxCalls: 0,
        remainingCalls: 0,
      },
    ]);

    /** 모델 로드 에러 메시지 (저장 안 함) */
    const modelLoadError = ref(null);

    /**
     * AI Agent 태그 목록 (저장)
     */
    const aiAgentTagList = ref([]);

    /** AI Agent 정보 목록 (저장) */
    const aiAgentInfoList = ref([]);

    /**
     * AI Agent 태그 정보
     */
    const agentTagInfo = computed(() => {
      return {
        index: 0,
        type: "agent",
        value: "@",
      };
    });

    /** 선택된 AI Agent 이름 (저장) */
    const selectedAiAgent = ref("");

    /** 선택된 AI Agent 데이터 (저장) */
    const selectedAiAgentData = ref(null);

    /** AI Agent 로드 에러 메시지 (저장 안 함) */
    const aiAgentLoadError = ref(null);

    /** AI Agent 로딩 상태 (저장 안 함) */
    const isAiAgentLoading = ref(false);

    /** 선택된 모델 정보 (저장) */
    const selectedModel = ref("모델선택");

    /** 선택된 provider 정보 (저장) */
    const selectedProvider = ref("");

    /** 현재 채팅 사용량 정보 */
    const chatUsageCount = ref({
      realUsageCount: "0",
      wholeUsageCount: "0",
    });

    /**
     * 첨부된 파일 배열 (저장 안 함 - 임시)
     */
    const attachedFiles = ref([]);

    /**
     * Card 선택 여부 (저장 안 함 - 임시)
     */
    const isFromCard = ref(false);

    /**
     * 채팅 메시지 배열 (저장)
     */
    const messages = ref([]);

    // ✨ 현재 선택된 에이전트 이름
    const currentAgentName = ref("");

    // ================================
    // 📌 STATE - 기존 dataStore
    // ================================

    /** 선택된 모델 이름 (복제, dataStore와 동일) */
    // selectedModel은 이미 위에 정의함

    /**
     * 🎯 선택된 모델의 전체 데이터 (저장 안 함)
     */
    const selectedModelData = ref(null);

    /** 모델 드롭다운 열림 상태 (저장 안 함) */
    const isModelDropdownOpen = ref(false);

    /** 모델 로딩 중 상태 (저장 안 함) */
    const isModelLoading = ref(false);

    /** AI Agent 드롭다운 열림 상태 (저장 안 함) */
    const isAiAgentDropdownOpen = ref(false);

    /**
     * 🎯 채팅 메시지 표시 상태
     *
     * 상태:
     * - "initial": 초기 상태 (인사말 + 카드 표시)
     * - "streaming": 메시지 스트리밍 중
     * - "complete": 메시지 수신 완료
     */
    const chatDisplayMode = ref("initial");

    /**
     * 🎯 메시지 스트리밍 진행 중 여부 (저장 안 함)
     */
    const isStreaming = ref(false);

    /**
     * 🎯 현재 스트리밍 중인 메시지 (저장 안 함)
     */
    const currentStreamingMessage = ref("");

    /**
     * 🎯 타이핑 애니메이션을 시작할 메시지 (저장 안 함)
     */
    const typingMessage = ref(null);

    /**
     * 🎯 현재 대화 ID (conversation_id) (저장)
     */
    const currentConversationId = ref("");

    /**
     * 🎯 현재 메시지 ID (message_id) (저장)
     */
    const currentMessageId = ref("");

    /**
     * 🎯 현재 대화방 ID (room_id) (저장)
     */
    const currentRoomId = ref("");

    /**
     * 🎯 에러 메시지 (저장 안 함)
     */
    const errorMessage = ref(null);

    const chatRooms = ref([]);

    /**
     * 🎯 현재 대화방 타입 (저장)
     */
    const currentRoomType = ref(null);

    /**
     * 🎯 ExpandSidebar에서 선택한 서비스 에이전트 (저장 안 함)
     */
    const selectedServiceAgent = ref(null);

    /**
     * 🎯 새 채팅방 생성 중 플래그 (저장 안 함)
     */
    const isCreatingNewRoom = ref(false);

    // test auth 데이터
    const testAuthStore = useTestAuthStore();

    // ================================
    // 🔄 COMPUTED - 기존 dataStore
    // ================================

    /**
     * ✅ wholeTagInfoList: 전체 태그 정보 (Agent + File)
     */
    const wholeTagInfoList = computed(() => {
      const result = [...aiAgentTagList.value, ...fileTagInfoList.value];
      return result;
    });

    /**
     * 파일 태그 정보 목록
     */
    const fileTagInfoList = computed(() => {
      const fileTags = [];
      if (attachedFiles.value && attachedFiles.value.length > 0) {
        attachedFiles.value.forEach((file, index) => {
          fileTags.push({
            index: index,
            type: "file",
            value: `${file.name}`,
          });
        });
      }
      return fileTags;
    });

    // ================================
    // 🔄 COMPUTED - 기존 dataStore
    // ================================

    /**
     * 현재 사용량 백분율
     */
    const usagePercentage = computed(() => {
      const whole = parseInt(chatUsageCount.value.wholeUsageCount);
      const real = parseInt(chatUsageCount.value.realUsageCount);
      if (whole === 0) return 0;
      return Math.round((real / whole) * 100);
    });

    /**
     * AI Agent 선택 여부
     */
    const isAiAgentSelected = computed(() => {
      return aiAgentTagList.value.length > 0;
    });

    /**
     * 메시지 입력 가능 여부
     */
    const canInputMessage = computed(() => {
      return !isStreaming.value;
    });

    // ================================
    // ⚡ ACTIONS - 기존 dataStore
    // ================================

    // ✨ 에이전트 이름 설정 함수
    const setCurrentAgentName = (agentName) => {
      currentAgentName.value = agentName;
      console.log("🤖 현재 에이전트:", agentName);
    };

    // ================================
    // 🎯 AGENT TAG ACTIONS
    // ================================

    /**
     * ✅ addAgentTag: Agent 태그 추가 (새 채팅 시)
     */
    const addAgentTag = (agentName, agentData) => {
      console.log("🏷️ [dataStore] addAgentTag 호출:", {
        agentName,
        agentId: agentData?.id,
        source: "CardListSection (새 채팅)",
      });
      selectedAiAgent.value = agentName;
      selectedAiAgentData.value = agentData;
      aiAgentTagList.value = [
        {
          index: 0,
          type: "agent",
          value: `@${agentName}`,
        },
      ];
      console.log("✅ Agent 태그 저장 완료:", {
        agent: selectedAiAgent.value,
        agentId: selectedAiAgentData.value?.id,
        aiAgentTagList: aiAgentTagList.value,
      });
    };

    /**
     * ✅ deleteAgent: Agent 태그 제거
     */
    const deleteAgent = () => {
      console.log("🗑️ deleteAgent 호출");
      selectedAiAgent.value = "";
      selectedAiAgentData.value = null;
      aiAgentTagList.value = [];
      console.log("✅ Agent 태그 제거 완료");
    };

    /**
     * ✅ deleteAllAgentsAndFiles: 태그 삭제 (Agent or File)
     */
    const deleteAllAgentsAndFiles = (index, type) => {
      console.log(
        `🗑️ [dataStore] deleteAllAgentsAndFiles 호출: type=${type}, index=${index}`,
      );
      // 만약, agent 태그라면?
      if (type === "agent") {
        aiAgentTagList.value = aiAgentTagList.value.filter(
          (tag) => tag.type !== "agent",
        );
        deleteAgent();
        deleteModel();
        setRoomType(null);
        console.log("✅ AI Agent 삭제됨, 모델 선택 재활성화");
        // 만약, file 태그라면?
      } else if (type === "file") {
        if (index >= 0 && index < attachedFiles.value.length) {
          const deletedFile = attachedFiles.value[index];
          attachedFiles.value.splice(index, 1);
          console.log(`✅ 파일 삭제됨 (index: ${index})`, {
            fileName: deletedFile.name,
            remainingFiles: attachedFiles.value.length,
          });
        } else {
          console.warn(`⚠️ 파일 인덱스 범위 초과: ${index}`);
        }
      }
    };

    /**
     * 모델 사용량 데이터 로드
     */
    const loadModelUsageData = async () => {
      isModelLoading.value = true;
      modelLoadError.value = null;

      try {
        console.group("🔄 [모델 사용량 API] 데이터 로드 시작");

        const response = await modelUsageApi.getModelDailyUsage();

        console.log("=== 📊 loadModelUsageData API 응답 상세 분석 ===");
        console.log("전체 응답 객체:", response);
        console.log("response.success:", response.success);
        console.log("response.data:", response.data);

        if (!response.success || !response.data) {
          throw new Error(
            response.message || "모델 사용량 데이터를 가져올 수 없습니다.",
          );
        }

        let modelsArray = [];

        if (Array.isArray(response.data)) {
          console.log("✅ response.data는 배열 (정상)");
          modelsArray = response.data;
        } else if (
          !Array.isArray(response.data) &&
          typeof response.data === "object"
        ) {
          console.log("⚠️ response.data는 객체");

          if (Array.isArray(response.data.data)) {
            console.log("🔍 response.data.data가 배열입니다!");
            modelsArray = response.data.data;
          } else {
            console.log("🔍 response.data를 Object.values로 변환합니다");
            modelsArray = Object.values(response.data);
          }
        } else {
          throw new Error(`예상하지 못한 데이터 형식: ${typeof response.data}`);
        }

        console.log("✅ 최종 modelsArray:", modelsArray);

        const convertedModels = modelsArray.map((model) => {
          console.log("📝 변환 중인 모델:", model.modelName);

          return {
            value: `${model.provider}/${model.modelName}`,
            label: model.modelName,
            desc: model.desc || "",
            provider: model.provider,
            currentUsage: model.currentUsage || 0,
            maxCalls: model.maxCalls || 0,
            remainingCalls: model.remainingCalls || 0,
          };
        });

        console.log("✅ 변환된 모델 목록:", convertedModels);

        modelInfoList.value = [
          {
            value: "모델선택",
            label: "모델선택",
            desc: "",
            provider: null,
            modelName: null,
            currentUsage: 0,
            maxCalls: 0,
            remainingCalls: 0,
          },
          ...convertedModels,
        ];

        console.log("✅ 최종 modelInfoList:", modelInfoList.value);

        if (convertedModels.length > 0) {
          const firstModel = convertedModels[0];
          setUsageCount(firstModel.currentUsage, firstModel.maxCalls);
          console.log("✅ 사용량 초기화:", {
            current: firstModel.currentUsage,
            total: firstModel.maxCalls,
          });
        }

        console.groupEnd();
      } catch (error) {
        console.error("❌ [모델 사용량 API] 오류 발생:", error);
        console.error("에러 상세:", error.message);
        modelLoadError.value = error.message;

        modelInfoList.value = [
          {
            value: "모델선택",
            label: "모델선택",
            desc: "",
            provider: null,
            modelName: null,
            currentUsage: 0,
            maxCalls: 0,
            remainingCalls: 0,
          },
        ];

        setUsageCount(0, 0);

        console.groupEnd();
      } finally {
        isModelLoading.value = false;
      }
    };

    /**
     * 모델 에러 초기화
     */
    const clearModelError = () => {
      modelLoadError.value = null;
    };

    /**
     * handleAttachFile: UploadButton에서 파일 선택 시 호출
     */
    const handleAttachFile = (files) => {
      const newAttachedFiles = [...attachedFiles.value, ...files];
      if (newAttachedFiles.length > 3) {
        console.warn("⚠️ 최대 3개까지만 파일을 첨부할 수 있습니다.");
        attachedFiles.value = newAttachedFiles.slice(0, 3);
      } else {
        attachedFiles.value = newAttachedFiles;
      }
      console.log(
        `✅ 파일 첨부됨: ${attachedFiles.value.length}개`,
        attachedFiles.value,
      );
    };

    /**
     * ============================================================
     * ✅ loadAiAgentList - AI Agent 목록 로드
     * ============================================================
     */
    const loadAiAgentList = async () => {
      try {
        const { getMockConfigData } = await import("@/api/mocking");
        console.group("🔄 [AI Agent List] 데이터 로드 시작");
        isAiAgentLoading.value = true;
        const mockData = getMockConfigData(testAuthStore);
        const mockAgents = mockData.data.info.main.aiAgentCards || [];
        console.log("총 에이전트:", mockAgents);
        console.log("총 에이전트 수:", mockAgents.length);
        aiAgentInfoList.value = mockAgents;
        console.groupEnd();
      } catch (error) {
        console.error("❌ [AI Agent List] 오류 발생:", error);
        console.error("에러 상세:", error.message);
        aiAgentLoadError.value = error.message;
        console.groupEnd();
      } finally {
        isAiAgentLoading.value = false;
      }
    };

    /**
     * 🎯 addMessage: 새로운 메시지 추가
     */
    const addMessage = (message) => {
      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: message.role || "user",
        content: message.content || "",
        agent: message.agent || "unknown",
        createdAt: Date.now(),
        metadata: message.metadata || {},
      };
      messages.value.push(newMessage);
      console.log("✅ addMessage : 메시지 추가됨:", newMessage.id);
    };

    /**
     * 🎯 deleteMessages: 모든 메시지 초기화
     */
    const deleteMessages = () => {
      messages.value = [];
      console.log("🗑️ 모든 메시지 삭제됨");
    };

    /**
     * 🎯 getMessages: 현재 메시지 목록 조회
     */
    const getMessages = () => {
      console.log("모든 메시지 체크: ", messages.value);
      return messages.value;
    };
    /**
     * ============================================================
     * ✅ selectModel: 모델 선택 처리
     * ============================================================
     */
    const selectModel = (modelLabel) => {
      console.group("📋 [selectModel] 모델 선택");
      console.log("선택된 모델:", modelLabel);
      selectedModel.value = modelLabel;
      const modelData = modelInfoList.value.find(
        (model) => model.label === modelLabel,
      );
      console.log(`📌 selectModel: 선택된 모델 데이터:`, modelData);
      selectedModelData.value = modelData;
      if (modelData && modelData.maxCalls !== undefined) {
        chatUsageCount.value = {
          realUsageCount: String(modelData.currentUsage || 0),
          wholeUsageCount: String(modelData.maxCalls || 0),
        };
      } else if (modelLabel === "모델선택") {
        chatUsageCount.value = {
          realUsageCount: "0",
          wholeUsageCount: "0",
        };
        selectedModelData.value = null;
        setRoomType(null);
        console.log("🔄 사용량 초기화됨");
      }
      isModelDropdownOpen.value = false;
      console.log("✅ 드롭다운 닫음");
      setRoomType("model");
      if (modelData) selectedProvider.value = modelData.provider;
      console.log("✅ 모델 선택 완료:", {
        label: modelLabel,
        provider: modelData?.provider,
        currentRoomType: currentRoomType.value,
      });
      console.groupEnd();
    };

    /**
     * 모델 드롭다운 토글
     */
    const toggleAiModelDropdown = () => {
      if (!isAiAgentSelected.value) {
        isModelDropdownOpen.value = !isModelDropdownOpen.value;
      } else {
        console.log("⚠️ AI Agent가 선택되었으므로 모델 선택이 비활성화됩니다.");
      }
    };

    /**
     * 드롭다운 닫기
     */
    const closeModelDropdown = () => {
      isModelDropdownOpen.value = false;
    };

    /**
     * 사용량 직접 설정 (수동 업데이트)
     */
    const setUsageCount = (current, total) => {
      chatUsageCount.value = {
        realUsageCount: String(current),
        wholeUsageCount: String(total),
      };
    };

    /**
     * 모든 상태 초기화
     */
    const deleteModel = () => {
      selectedModel.value = "모델선택";
      selectedProvider.value = "";
      selectedModelData.value = null;
      isModelDropdownOpen.value = false;
      chatUsageCount.value = {
        realUsageCount: "0",
        wholeUsageCount: "0",
      };
    };

    /**
     * ✅ setRoomType: 대화방 타입 설정
     */
    const setRoomType = (roomType) => {
      console.group("🏠 [setRoomType] 대화방 타입 설정");
      console.log("설정할 타입:", roomType);
      console.log("✅ AI Agent 기반 대화방");
      if (roomType === "agent") {
        console.log("   → 모델선택 버튼: disabled (회색, 클릭 불가)");
        console.log("   → AI Agent 버튼: 활성");
        currentRoomType.value = "agent";
        deleteModel();
      } else if (roomType === "model") {
        console.log("   → AI Agent 버튼: disabled (회색, 클릭 불가)");
        console.log("   → 모델선택 버튼: 활성");
        currentRoomType.value = "model";
      } else if (roomType === null) {
        console.log("   → AI Agent 버튼: 완전초기화");
        currentRoomType.value = null;
      } else {
        console.warn("⚠️ 유효하지 않은 roomType:", roomType);
      }

      console.log("📊 최종 상태:", {
        currentRoomType: currentRoomType.value,
      });

      console.groupEnd();
    };

    /**
     * ✅ selectServiceAgent: ExpandSidebar 서비스 에이전트 선택
     */
    const selectServiceAgent = (agentPayload) => {
      console.group(
        "🎯 [selectServiceAgent] ExpandSidebar 서비스 에이전트 선택",
      );
      console.log("받은 payload:", agentPayload);

      selectedServiceAgent.value = {
        ...agentPayload,
        timestamp: Date.now(),
      };

      console.log(
        "✅ selectedServiceAgent 저장됨:",
        selectedServiceAgent.value,
      );
      console.log("📌 MainPage의 watch가 자동으로 감지될 예정입니다");

      console.groupEnd();
    };

    /**
     * ✅ clearServiceAgentSelection: 서비스 에이전트 선택 초기화
     */
    const clearServiceAgentSelection = () => {
      console.log(
        "🧹 [clearServiceAgentSelection] 서비스 에이전트 선택 초기화",
      );
      selectedServiceAgent.value = null;
    };

    /**
     * ============================================================
     * ✅ setCreatingNewRoom: 새 채팅방 생성 플래그 설정
     * ============================================================
     */
    const setCreatingNewRoom = (value) => {
      console.log(
        `🏗️ [setCreatingNewRoom] 새 채팅방 생성 플래그: ${isCreatingNewRoom.value} → ${value}`,
      );
      isCreatingNewRoom.value = value;
    };

    /**
     * 🎯 스트리밍 시작
     */
    const startStreaming = (mode = null) => {
      console.log("🔄 스트리밍 시작");

      isStreaming.value = true;
      chatDisplayMode.value = "streaming";
      currentStreamingMessage.value = "";
      errorMessage.value = null;

      console.log("✅ 상태 변경:", {
        isStreaming: isStreaming.value,
        chatDisplayMode: chatDisplayMode.value,
      });
    };

    /**
     * 🎯 현재 스트리밍 메시지 업데이트
     */
    const updateStreamingMessage = (chunk) => {
      if (chunk) {
        currentStreamingMessage.value += chunk;
      }
    };

    /**
     * 🎯 스트리밍 완료
     */
    const completeStreaming = (metadata = null) => {
      console.log("✅ 스트리밍 완료", {
        tokens: metadata?.usage?.total_tokens,
        latency: metadata?.usage?.latency,
      });

      isStreaming.value = false;
      chatDisplayMode.value = "complete";
      currentStreamingMessage.value = "";
      console.log("🧹 currentStreamingMessage 초기화됨");
    };

    /**
     * 🎯 conversation ID 설정
     */
    const setConversationId = (conversationId) => {
      currentConversationId.value = conversationId;
      console.log("💬 Conversation ID 설정:", conversationId);
    };

    /**
     * 🎯 message ID 설정
     */
    const setMessageId = (messageId) => {
      currentMessageId.value = messageId;
    };

    /**
     * 🎯 room ID 설정
     */
    const setRoomId = (roomId) => {
      currentRoomId.value = roomId;
      console.log("🏠 Room ID 설정:", roomId);
    };

    /**
     * 🎯 에러 설정
     */
    const setError = (error) => {
      errorMessage.value = error;
      isStreaming.value = false;
      chatDisplayMode.value = "complete";

      console.error("❌ 에러 발생:", error);
    };

    /**
     * 🎯 에러 초기화
     */
    const clearError = () => {
      errorMessage.value = null;
    };

    /**
     * 🎯 전체 채팅 상태 초기화 (새 대화 시작)
     */
    const deleteAllChatState = () => {
      isCreatingNewRoom.value = false;
      isStreaming.value = false;
      isFromCard.value = false;
      chatDisplayMode.value = "initial";
      errorMessage.value = null;
      currentRoomId.value = "";
      currentRoomType.value = null;
      currentStreamingMessage.value = "";
      currentConversationId.value = "";
      currentMessageId.value = "";
      console.log("🔄 채팅 상태 초기화 완료");
    };

    /**
     * 🎯 타이핑 애니메이션 시작
     */
    const setTypingAnimation = (message) => {
      if (!message || typeof message !== "string") {
        console.warn("⚠️ setTypingAnimation: 유효하지 않은 메시지");
        return;
      }

      console.log(`🎬 타이핑 애니메이션 시작: ${message.length}자`);
      typingMessage.value = message;
    };

    // ✅ 세션 필드 초기화 함수 (별도로 관리)
    const initializeSessionFields = () => {
      console.group("🔄 [initializeSessionFields] 세션 필드 초기화");
      deleteAgent();
      deleteModel();
      deleteAllChatState();
      deleteMessages();
      console.groupEnd();
    };

    // 📤 EXPORT
    return {
      // State - 기존 dataStore
      modelInfoList,
      modelLoadError,
      aiAgentTagList,
      aiAgentInfoList,
      agentTagInfo,
      selectedAiAgent,
      selectedAiAgentData,
      selectedModel,
      selectedProvider,
      chatUsageCount,
      attachedFiles,
      wholeTagInfoList,
      fileTagInfoList,
      messages,
      isAiAgentLoading,
      aiAgentLoadError,
      isFromCard,
      currentAgentName,

      // State - 기존 dataStore
      selectedModelData,
      isModelDropdownOpen,
      isModelLoading,
      isAiAgentDropdownOpen,
      chatDisplayMode,
      isStreaming,
      currentStreamingMessage,
      typingMessage,
      currentConversationId,
      currentMessageId,
      currentRoomId,
      errorMessage,
      chatRooms,
      currentRoomType,
      selectedServiceAgent,
      isCreatingNewRoom,

      // Computed - 기존 dataStore
      usagePercentage,
      isAiAgentSelected,
      canInputMessage,

      // Methods - 기존 dataStore
      loadModelUsageData,
      clearModelError,
      loadAiAgentList,
      handleAttachFile,
      addAgentTag,
      deleteAgent,
      deleteAllAgentsAndFiles,
      addMessage,
      deleteMessages,
      getMessages,
      setCurrentAgentName,

      // Methods - 기존 dataStore
      selectModel,
      toggleAiModelDropdown,
      closeModelDropdown,
      setUsageCount,
      deleteModel,
      setRoomType,
      selectServiceAgent,
      clearServiceAgentSelection,
      setCreatingNewRoom,
      startStreaming,
      updateStreamingMessage,
      completeStreaming,
      setTypingAnimation,
      setConversationId,
      setMessageId,
      setRoomId,
      setError,
      clearError,
      deleteAllChatState,
      initializeSessionFields,
    };
  },
  {
    /**
     * ============================================================
     * 🔑 Pinia Persistence 설정 (통합버전)
     * ============================================================
     *
     * 메시지, Agent, 모델, 대화방 정보 저장
     */
    persist: {
      storage: sessionStorage,

      // 저장할 상태
      paths: [
        // 데이터 저장
        "aiAgentTagList", // Agent 태그 목록
        "aiAgentInfoList", // Agent 정보 목록
        "selectedAiAgent", // 선택된 Agent
        "selectedAiAgentData", // Agent 데이터
        "selectedModel", // 선택된 모델
        "selectedProvider", // Provider

        // UI 상태 저장
        // "messages", // 채팅 메시지
        // "currentRoomId", // 현재 대화방 ID
        // "currentConversationId", // 대화 ID
        // "currentMessageId", // 메시지 ID
        // "currentRoomType", // 대화방 타입
        // "chatRooms", // 채팅방 목록
      ],

      // 브라우저 F12에서 노출되는 저장소 키 이름
      key: "biz-ai-works-data",
    },
  },
);
