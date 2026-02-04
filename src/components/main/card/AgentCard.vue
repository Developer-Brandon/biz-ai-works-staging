<!-- src/components/main/card/AgentCard.vue -->
<template>
  <div
    class="agent-card"
    :class="{ 'agent-card--faq': type === 'faq' }"
    role="button"
    tabindex="0"
  >
    <!-- ==================== NORMAL 타입 (아이콘 + 제목 + 설명) ==================== -->
    <template v-if="type === 'normal'">
      <!-- 배경 효과 (옵션) -->
      <div class="card-background"></div>
      <!-- 카드 콘텐츠 컨테이너 -->
      <div class="card-content" @click="selectAgent">
        <!-- 아이콘 영역 (원형 배경) -->
        <div class="agent-icon-wrapper">
          <!-- CommonIcon 컴포넌트: 이미지 렌더링 및 크기 조정 -->
          <CommonIcon :src="cardThumbnailUrl" :size="100" />
        </div>
        <!-- 에이전트 이름 (제목) -->
        <h3 class="agent-name">
          {{ cardInfo.name }}
        </h3>
        <!-- 에이전트 설명 텍스트 -->
        <p class="agent-description">
          {{ cardInfo.description }}
        </p>
      </div>
    </template>

    <!-- ==================== FAQ 타입 (배경색 + 제목 + 질문 리스트) ==================== -->
    <template v-else-if="type === 'faq'">
      <!-- 카드 콘텐츠 컨테이너 (배경색 동적 적용) -->
      <div
        class="card-content card-content--faq"
        :style="{
          backgroundColor: configStore.mainHoverColorHexCode,
        }"
      >
        <!-- FAQ 카드 제목 -->
        <h3 class="agent-name">
          {{ cardInfo.name }}
        </h3>
        <!-- FAQ 질문 리스트 (최대 4개) -->
        <ul class="faq-list">
          <li
            class="faq"
            v-for="(question, index) in randomQuestions"
            :key="index"
            @click="selectAgentFaq(question)"
          >
            {{ question.contents }}
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import CommonIcon from "@/components/icon/CommonIcon.vue";
import { useConfigStore } from "@/stores/useConfigStore";
import { useDataStore } from "@/stores/model/dataStore";

const props = defineProps({
  cardIndex: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  cardInfo: {
    type: Object,
    default: () => ({
      id: "",
      title: "",
      explain: "",
      questionList: [],
    }),
  },
});

const emit = defineEmits(["agent-select"]);

/**
 * Store 인스턴스
 */
const configStore = useConfigStore();
const dataStore = useDataStore();

const cardInfo = computed(() => {
  console.log("📊 AgentCard cardInfo:", props.cardInfo);
  return props.cardInfo;
});

/**
 * cardThumbnailUrl computed (NORMAL 타입용)
 *
 * ✅ 수정사항:
 * 1. configStore.isConfigLoaded 확인
 * 2. imageServerUrl과 cardThumbnailUrl이 모두 있을 때만 조합
 * 3. 빈 값일 때는 빈 문자열 반환
 */
const cardThumbnailUrl = computed(() => {
  console.log("📊 cardThumbnailUrl computed 호출");
  console.log("  configStore.isConfigLoaded:", configStore.isConfigLoaded);
  console.log("  configStore.imageServerUrl:", configStore.imageServerUrl);
  console.log(
    "  cardInfo.value.cardThumbnailUrl:",
    cardInfo.value?.cardThumbnailUrl,
  );

  // 🔴 상황 1: configStore 아직 로드 안 됨
  if (!configStore.isConfigLoaded) {
    console.warn("⚠️ configStore 아직 로드되지 않음 - 상대경로 그대로 반환");
    // ✅ 빈 문자열이 아니라 상대경로 그대로 반환!
    return cardInfo.value?.cardThumbnailUrl || "";
  }

  // 🔴 상황 2: cardThumbnailUrl 없음
  if (!cardInfo.value?.cardThumbnailUrl) {
    console.warn("⚠️ cardThumbnailUrl 없음");
    return "";
  }

  // 🔴 상황 3: imageServerUrl 없음
  if (!configStore.imageServerUrl) {
    console.warn("⚠️ imageServerUrl 없음 - 상대경로 그대로 반환");
    // ✅ imageServerUrl이 없으면 상대경로 그대로 반환
    return cardInfo.value.cardThumbnailUrl;
  }

  // ✅ 모든 조건 충족: 절대경로로 합치기
  const thumbPath =
    configStore.imageServerUrl + cardInfo.value.cardThumbnailUrl;
  console.log("✅ 카드 썸네일 경로 (절대경로):", thumbPath);

  return thumbPath;
});

/**
 * randomQuestions computed (FAQ 타입용)
 *
 * cardInfo.questionList에서 최대 4개의 질문을 랜덤으로 선택
 */
const randomQuestions = computed(() => {
  if (!cardInfo.value?.questionList) return [];
  return [...cardInfo.value.questionList]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
});

/**
 * ============================================================
 * ✅ selectAgent - Card 클릭 시 실행
 * ============================================================
 */
const selectAgent = async () => {
  console.group("✨ [selectAgent] Card 선택");
  console.log(`카드 인덱스: ${props.cardIndex}, 타입: ${props.type}`);
  console.log(`카드 정보:`, cardInfo.value); // ✅ UUID 확인!
  console.log(`카드 ID:`, cardInfo.value.id); // ✅ UUID!
  try {
    // ============================================================
    // 1️⃣ AI Agent 정보 저장 (dataStore에 저장)
    // ============================================================
    console.log("1️⃣ AI Agent 정보 저장");
    const agentName = cardInfo.value.name;
    const agentData = {
      id: cardInfo.value.id,
      name: agentName,
    };
    dataStore.addAgentTag(agentName, agentData);

    let questionMessage = "";

    if (props.cardIndex === 0) {
      // 첫번째 카드
      questionMessage = " ";
    } else if (props.cardIndex === 1) {
      // 두번째 카드
      questionMessage = " ";
    } else if (props.cardIndex === 2) {
      // 세번째 카드 (FAQ)
      // selectAgentFaq 메소드로 분리
      // questionMessage = "세번째 카드 테스트";
    }
    console.log("✅ 메시지 준비됨:", questionMessage);
    console.log("5️⃣ 태그 표시 플래그 설정");
    dataStore.isFromCard = true;
    console.log("✅ isFromCard = true (태그 표시)");

    // ============================================================
    // 6️⃣ 부모 컴포넌트에 emit 발생
    // ============================================================
    console.log("6️⃣ emit('agent-select') 호출");

    emit("agent-select", {
      cardIndex: props.cardIndex,
      type: props.type,
      agentName: agentName,
      agentData: agentData,
      message: questionMessage,
    });

    console.log("✅ Card 선택 완료");
    console.groupEnd();

    // ⏰ 약간의 지연 후 메시지 입력
    // (UI 업데이트가 완료된 후 메시지 입력)
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    console.error("❌ Card 선택 실패:", error);
    console.groupEnd();
  }
};

/**
 * ============================================================
 * 🎯 selectAgentFaq - FAQ 카드에서 질문 선택 시 호출
 * ============================================================
 *
 * 역할:
 * 1️⃣ agentData.id를 이용해 aiAgentCards에서 해당 Agent 찾기
 * 2️⃣ 찾은 Agent의 title 추출
 * 3️⃣ 부모 컴포넌트(CardListSection)로 emit 발생
 * 4️⃣ MainPage의 handleAgentSelect 메서드 호출
 * 5️⃣ ChatInputSection의 inputMessage에 질문 자동 입력
 *
 * 매개변수:
 * @param {object} agentData - FAQ 질문 객체
 *   - id: Agent id (aiAgentCards 배열에서 조회할 id)
 *   - contents: 질문 내용
 *
 * 흐름:
 * 1️⃣ agentData.id → aiAgentCards에서 매칭하는 Agent 찾기
 * 2️⃣ found.title 추출
 * 3️⃣ emit('agent-select', { ... agentName, agentData })
 * 4️⃣ MainPage handleAgentSelect 수신
 * 5️⃣ ChatInputSection v-model에 agentData.contents 자동 입력 ✨
 *
 * Vue 2 vs Vue 3:
 * - Vue 2: methods: { selectAgentFaq() { ... } }
 * - Vue 3: const selectAgentFaq = () => { ... } (더 간결함)
 *
 * 주의:
 * - aiAgentCards는 configStore에 정의되어 있음
 * - id 일치 하지 않으면 agentName = "Unknown" 설정
 */
const selectAgentFaq = async (agentData) => {
  console.group("🎯 [selectAgentFaq] FAQ 질문 선택");
  console.log("📌 agentData.id:", agentData.id);
  console.log("📝 agentData.contents:", agentData.contents);
  console.log("🏢 현재 cardInfo:", cardInfo.value);

  try {
    const agentName = configStore.aiAgentCards.find(
      (card) => card.id === agentData.id,
    )?.name;

    console.log("✅ Agent 찾음:", agentName);
    dataStore.addAgentTag(agentName, {
      id: agentData.id,
      name: agentName,
    });
    console.log("📤 emit('agent-select') 발생");
    dataStore.isFromCard = true;
    emit("agent-select", {
      cardIndex: props.cardIndex,
      type: props.type,
      agentName: agentName, // ← title을 agentName으로 전달!
      agentData: agentData, // ← 질문 정보
      message: agentData.contents?.replace(/^Q\.\s*/, ""), // ← 메시지 입력 영역에 자동 입력될 내용
    });

    // ============================================================
    // 4️⃣ 약간의 지연 (UI 업데이트 대기)
    // ============================================================
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("✅ selectAgentFaq 완료");
    console.groupEnd();
  } catch (error) {
    console.error("❌ selectAgentFaq 실패:", error.message);
    console.groupEnd();
  }
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== .agent-card - 메인 컨테이너 ==================== */

.agent-card {
  width: 315px;
  height: 250px;
  position: relative;
  border-radius: $border-radius-custom;
  overflow: hidden;
  cursor: pointer;
  perspective: 1000px;
  background: $white;
  border: 1px solid $gray-200;
  box-shadow:
    $shadow-base,
    0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-4px);
  }
}

/* ==================== .card-background ==================== */

.card-background {
  background: $white;
  pointer-events: none;
}

/* ==================== .card-content ==================== */

.card-content {
  position: relative;
  z-index: 1;
  padding: $spacing-5;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-4;
  width: 100%;
  height: 100%;

  @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
    padding: $spacing-8;
  }

  @media (max-width: 768px) {
    padding: $spacing-8;
  }
}

/* ==================== Normal 타입 스타일 ==================== */

.agent-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-base;

  .agent-card:hover & {
    transform: rotate(10deg) scale(1.05);
  }
}

.agent-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $primary-text;
  margin: $spacing-2 0 0 0;
  line-height: 1.3;

  @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
    font-size: $font-size-2xl;
  }

  @media (max-width: 768px) {
    font-size: $font-size-xl;
  }
}

.agent-description {
  font-size: $font-size-sm;
  color: $secondary-text;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: $font-size-base;
  }
}

/* ==================== FAQ 타입 전용 스타일 ==================== */

.agent-card--faq {
  cursor: default;
  .card-content {
    position: relative;
    z-index: 1;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    width: 100%;
    height: 100%;
    margin-top: -1px;

    @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
      padding: 1.6rem;
    }

    .agent-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: $primary-text;
      margin-top: 5px;
    }

    .faq-list {
      list-style: none;
      padding: 0;
      margin: 0 auto;
      width: 90%;
      cursor: pointer;
      .faq {
        width: 100%;
        font-size: 13px;
        color: $primary-text;
        line-height: 1.2;
        padding: 8px 16px;
        background-color: $white;
        border-radius: 27px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;

        &:hover {
          color: $white;
          background-color: var(--primary-color);
          transition: $transition-base;
        }
      }
    }
  }
}
</style>
