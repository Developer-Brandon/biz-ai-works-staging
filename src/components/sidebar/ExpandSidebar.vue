<!-- src/components/sidebar/ExpandSidebar.vue -->
<template>
  <!-- expand 기능이 있는 경우에만 렌더링 -->
  <aside
    v-if="isExpandEnabled"
    class="expand-sidebar no-drag"
    :class="{ 'expand-sidebar--open': isOpen }"
  >
    <!-- ==================== 토글 버튼 ==================== -->
    <button
      class="expand-sidebar__toggle-btn"
      :class="{ 'expand-sidebar__toggle-btn--open': isOpen }"
      @click="handleToggle"
      :style="{ right: toggleButtonRight }"
      :aria-label="isOpen ? '패널 닫기' : '패널 열기'"
      title="패널 열기/닫기"
    >
      <!-- ✅ 단일 아이콘만 사용 - 회전으로 방향 표현 -->
      <CommonIcon
        :src="scrollDownIconPath"
        alt="토글 아이콘"
        :size="20"
        class="expand-sidebar__toggle-icon"
      />
    </button>

    <!-- ==================== 메인 콘텐츠 ==================== -->
    <div class="expand-sidebar__content">
      <!-- ==================== 1. 안내 배너 ==================== -->
      <div class="expand-sidebar__header">
        <div
          class="expand-sidebar__header-background"
          :style="{
            backgroundImage: bannerBackgroundImageUrl
              ? `url(${bannerBackgroundImageUrl})`
              : undefined,
          }"
        />
        <!-- ✅ z-index를 통해 배경 뒤에 배치되도록 구조화 -->
        <div class="expand-sidebar__header-icon-wrapper">
          <img
            class="expand-sidebar__header-icon"
            :src="expandBannerPannelImageUrl"
            alt="배너 아이콘"
          />
        </div>
        <div class="expand-sidebar__header-text">
          <h2 class="expand-sidebar__header-title">국정감사 안내사항</h2>
          <p class="expand-sidebar__header-description">
            중요 지침 및 유의사항을 확인하세요.
          </p>
        </div>
      </div>

      <!-- ==================== 2. 서비스 영역 ==================== -->
      <div class="expand-sidebar__services">
        <div class="expand-sidebar__services-intro">
          <div class="expand-sidebar__services-text">
            <h3 class="expand-sidebar__services-title">
              <span class="expand-sidebar__services-icon">◆</span>
              국정감사 AI 서비스
            </h3>
            <p class="expand-sidebar__services-description">
              국정감사 자료 탐색 및 문서 생성에 도움주는 AI 서비스 입니다.
            </p>
          </div>
        </div>

        <div class="expand-sidebar__services-buttons">
          <div
            v-for="service in services"
            :key="service.id"
            @click="selectServiceAgent(service)"
            class="expand-sidebar__service-item"
          >
            <button class="expand-sidebar__service-btn" :title="service.label">
              <CommonIcon :src="service.icon" :size="40" />
            </button>
            <span class="expand-sidebar__service-label">
              {{ service.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- ==================== 3. FAQ 영역 ==================== -->
      <div class="expand-sidebar__qa-section">
        <div class="expand-sidebar__qa-header">
          <div class="expand-sidebar__qa-title-wrapper">
            <span class="expand-sidebar__qa-icon">🔊</span>
            <h3 class="expand-sidebar__qa-title">FAQ 알림</h3>
            <span class="expand-sidebar__qa-badge">5</span>
          </div>
          <p
            @click="$emit('open-faq-popup')"
            class="expand-sidebar__qa-more-link"
          >
            자세히 보기
          </p>
        </div>

        <ul class="expand-sidebar__qa-list" @click="$emit('open-faq-popup')">
          <li
            v-for="item in qaItems"
            :key="item.id"
            class="expand-sidebar__qa-item"
          >
            <span class="expand-sidebar__qa-category">
              {{ item.category }}
            </span>
            <div class="expand-sidebar__qa-item-title">
              {{ item.title }}
            </div>
            <div class="expand-sidebar__qa-item-meta">
              <span class="expand-sidebar__qa-author">
                {{ item.author }}
              </span>
              <span class="expand-sidebar__qa-date">
                {{ item.date }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useConfigStore } from "@/stores/useConfigStore";
import { useDataStore } from "@/stores/model/dataStore";
import CommonIcon from "@/components/icon/CommonIcon.vue";
import scrollDownIconPath from "@/assets/images/icon/down-white-arrow.png";

/* ==================== Store ==================== */
const configStore = useConfigStore();
const dataStore = useDataStore();
const emit = defineEmits(["toggle", "open-faq-popup"]);

/* ==================== Expand 설정 ==================== */
const isExpandEnabled = computed(() => configStore.hasExpandFeature);
const services = computed(() => {
  return configStore.expandServices.map((service) => ({
    id: service.id || service.order,
    name: service.name,
    icon: configStore.imageServerUrl + service.cardThumbnailUrl,
    type: service.type,
    defaultQuestion: service.questionList[0],
    welcomeSnippet: service.welcomeSnippet,
  }));
});
const bannerBackgroundImageUrl = computed(() => {
  return configStore.expandBannerPannelBackgroundImageUrl;
});
const expandBannerPannelImageUrl = computed(() => {
  return configStore.expandBannerPannelImageUrl;
});
// ==================== Props & Emits ====================
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
    default: false,
  },
});
/* ==================== FAQ (Mock 데이터) ==================== */
const qaItems = ref([
  {
    id: 1,
    category: "답변대기",
    title: "Q. 스마트 제조 관련 AI 기반 이상 탐지에 대해 국정감사에서..",
    author: "결제플랫폼사업부 홍길동",
    date: "2025-12-30 14:24",
  },
  {
    id: 2,
    category: "답변대기",
    title: "Q. 작년 제출한 국감 자료내용 중 3분기 AI신사업 중 에듀 AI 예산...",
    author: "전략기획부 유재석",
    date: "2025-12-30 14:24",
  },
  {
    id: 3,
    category: "답변대기",
    title: "Q. 디지털 화폐(CBDC) 도입 시 조폐공사 역할과 관련 자료집에...",
    author: "경영관리부 김성균",
    date: "2025.12.29 13:17",
  },
  {
    id: 4,
    category: "답변대기",
    title: "Q. 임직원 1인당 매출액, 영업이익 등 생산성 지표와 각 사업지표..",
    author: "조직법규부 조정석",
    date: "2025.12.29 09:43",
  },
  {
    id: 5,
    category: "답변대기",
    title: "Q. 작년 해외 수출 실적 보고서 제출했었는데 25년도에 다시 해당..",
    author: "성과관리부 박성준",
    date: "2025-12-30 19:17",
  },
]);

/* ==================== 메서드 ==================== */
const handleToggle = () => {
  emit("toggle");
};

/**
 * 초기화 함수
 * 화면 너비가 768px 이상일 때만 작동
 * (데스크톱 뷰에서 content-area의 overflow 설정)
 */
const initializeZoom = () => {
  if (window.innerWidth >= 768) {
    const contentArea = document.querySelector(".content-area");

    if (contentArea) {
      contentArea.style.overflowY = "hidden";
    } else {
      console.warn("⚠️ .content-area 요소를 찾을 수 없습니다");
    }
  }
};

/* ==================== Toggle 버튼 위치 계산 ==================== */
/**
 * aside 열림/닫힘 상태에 따라 버튼의 right 값을 동적으로 계산
 * Vue3 Composition API: computed로 반응형 계산
 * - isOpen이 false (닫혔을 때): right = 426px (화면에 보임) ✅
 * - isOpen이 true (열렸을 때): right = -20px (aside와 함께 움직임) ✅
 */
const toggleButtonRight = computed(() => {
  return props.isOpen ? "426px" : "-20px";
});

const selectServiceAgent = (agentInfo) => {
  console.group("🎯 [ExpandSidebar] selectServiceAgent");
  console.log("선택된 서비스:", agentInfo);
  console.log("type:", agentInfo.type);
  console.log("welcomeSnippet:", agentInfo.welcomeSnippet); // ✨ 추가
  // type이 "serviceCard"일 때만 처리
  if (agentInfo.type !== "serviceCard") {
    console.warn("⚠️ serviceCard 타입이 아닙니다. 무시합니다.");
    console.groupEnd();
    return;
  }
  // ✅ serviceCard일 때만 chatUiStore에 전달
  dataStore.selectServiceAgent({
    agentName: agentInfo.name,
    agentData: {
      id: agentInfo.id,
      name: agentInfo.name,
      icon: agentInfo.icon,
    },
    type: agentInfo.type,
    welcomeSnippet: agentInfo.welcomeSnippet, // ✨ 확인: prompt를 welcomeSnippet로 전달
    message: agentInfo.defaultQuestion,
  });

  console.log("✅ dataStore.selectServiceAgent() 호출 완료");
  console.log("전달된 데이터:", {
    agentName: agentInfo.name,
    welcomeSnippet: agentInfo.welcomeSnippet,
  });
  console.groupEnd();
  handleToggle();
};
/* ==================== 라이프사이클 ==================== */
/**
 * Vue3 Composition API: onMounted 훅
 * Vue2의 mounted() { ... }와 동일한 역할
 * 컴포넌트가 DOM에 마운트된 후 실행
 */
onMounted(async () => {
  await initializeZoom();
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/*
  ==================== ExpandSidebar 전체 구조 ====================
*/

.expand-sidebar {
  position: fixed;
  right: -446px; /* ✅ 수정: 기본 상태에서 화면 밖에 위치 */
  top: 0;
  width: 446px;
  height: 100vh;
  background-color: var(--primary-hover-color);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 999;

  /* ✅ 부드러운 슬라이드 애니메이션 */
  transition: right 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  display: flex;
  flex-direction: column;

  overflow: visible;
  overflow-x: hidden;

  /* 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: $gray-100;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-300;
    border-radius: 3px;
    transition: background 0.3s ease;

    &:hover {
      background: $gray-400;
    }
  }

  /* ✅ 열린 상태: expand-sidebar--open 클래스 추가 시 */
  &--open {
    right: 0px; /* ✅ 화면 안으로 들어옴 */
  }
}

/*
  ==================== 메인 콘텐츠 영역 ====================

  💡 설계:
  - flex: 1 → 남은 공간을 모두 차지
  - overflow-y: auto → 내용이 많을 때만 스크롤 생성
  - display: flex + flex-direction: column → 수직 배열
  - gap: $spacing-6 → 섹션 간 균일한 간격

  ✅ 변경사항:
  - overflow-y를 여기서 관리 (부모에서는 제거)
  - padding과 gap 값을 명확하게 설정
  - flex: 1을 사용해 부모 height에 딱 맞게 조정
*/

.expand-sidebar__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-6; /* 섹션 간 간격: 24px */
  padding: $spacing-6; /* 전체 여백: 24px */
  padding-top: $spacing-6;

  flex: 1; /* ✅ 남은 공간을 모두 차지 */
  overflow-y: auto; /* ✅ 추가: content 영역에만 스크롤 적용 */
  min-height: 0; /* ✅ 추가: flex 자식에서 overflow 활용을 위해 필수 */
}

/*
  ==================== 1. 안내 배너 ====================
*/
.expand-sidebar__header {
  position: relative;
  width: 100%;
  height: 206px;
  display: flex;
  flex-direction: column;
  align-items: center; /* ✅ 가로 중앙정렬 */
  justify-content: center; /* ✅ 세로 중앙정렬 */
  gap: $spacing-3; /* ✅ 아이콘과 텍스트 사이 간격 (12px) */
  padding: 0; /* ✅ padding 제거 */
  overflow: hidden;
  flex-shrink: 0;
  &-background {
    border-radius: 22px;
    border: 10px solid
      linear-gradient(135deg, #c5b0f0 0%, #e8d5f8 50%, $white 100%);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}

.expand-sidebar__header-icon-wrapper {
  position: relative;
  z-index: 2;
  margin: 0; /* ✅ 모든 margin 제거 */
  flex-shrink: 0;
}

.expand-sidebar__header-icon {
  width: 164px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0; /* ✅ margin 제거 */
  object-fit: contain;
  margin-bottom: 10px;
}

.expand-sidebar__header-text {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #333333;
  font-family: Noto Sans;
  flex-shrink: 0;
  display: flex; /* ✅ 텍스트도 flex로 */
  flex-direction: column;
  align-items: center;
  gap: $spacing-2; /* ✅ 제목과 설명 간격 (8px) */
}

.expand-sidebar__header-title {
  font-size: 20px;
  font-weight: $font-weight-bold;
  margin: 0;
  line-height: 1;
  margin-bottom: 10px;
}

.expand-sidebar__header-description {
  font-size: 12px;
  color: $gray-600;
  margin: 0;
  line-height: 1;
  white-space: nowrap; /* ✅ 한 줄로 유지 */
}

/*
  ==================== 2. 서비스 영역 ====================

  💡 설계:
  - background-color: $white → 흰 배경
  - border-radius: 22px → 둥근 모서리
  - box-shadow: 0 10px 30px → 카드 음영
  - display: flex + flex-direction: column → 수직 배열
*/

.expand-sidebar__services {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  padding: 27px 22px;
  background-color: $white;
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.expand-sidebar__services-intro {
  display: flex;
  gap: $spacing-3;
  align-items: flex-start;
}

.expand-sidebar__services-icon {
  font-size: 13px;
  color: var(--primary-color);
  margin-top: $spacing-1;
  flex-shrink: 0;
}

.expand-sidebar__services-text {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.expand-sidebar__services-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: #606060;
}

.expand-sidebar__services-description {
  font-size: $font-size-xs;
  color: #606060;
  margin: 0;
  line-height: 1.4;
}

.expand-sidebar__service-icon {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-sidebar__service-label {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: #333333;
  text-align: center;
  line-height: 1.3;
}

.expand-sidebar__services-buttons {
  display: flex; /* ✅ flex 유지 */
  flex-direction: row;
  gap: $spacing-3;
  justify-content: center; /* ✅ 가운데 정렬 */
  flex-wrap: wrap; /* ✅ 필요시 줄바꿈 */
}

.expand-sidebar__service-btn {
  display: flex;
  width: 72px;
  height: 72px;
  flex-direction: column;
  align-items: center; // ✅ 가로 중앙정렬 (수평축)
  justify-content: center; // ✅ 세로 중앙정렬 (수직축) 추가!
  background-color: $white;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--primary-color);

  &:hover {
    background-color: $gray-50;
    border-color: var(--primary-color);
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(-2px);
  }
}

.expand-sidebar__service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;
}

/*
  ==================== 토글 버튼 ====================

  💡 설계:
  - position: absolute → aside 내부 기준으로 위치 지정
  - left: -20px → aside 왼쪽 바깥에 걸쳐있는 위치
  - aside와 함께 슬라이드되면서 자동으로 움직임
  - 별도의 transform이나 right 조정 없음

  ✅ 변경사항:
  - fixed → absolute로 변경
  - right → left로 변경 (-20px = aside 너비를 벗어나는 거리)
  - aside 자체가 움직이므로 버튼도 자동으로 따라감
*/

.expand-sidebar__toggle-btn {
  position: fixed; /* ✅ fixed로 고정 */
  right: 426px; /* ✅ 기본값 (aside 닫혔을 때) */
  top: 380px;
  z-index: 9999;
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); /* ✅ right 변화도 애니메이션됨 */
  transform: rotate(-90deg);
  background: var(--primary-color);
  border-radius: 100%;
  &:hover {
    transform: scale(1.08);
    transform: rotate(-90deg);
  }

  &--open {
    .expand-sidebar__toggle-icon {
      transform: rotate(0deg);
    }
  }
}

.expand-sidebar__toggle-icon {
  width: 40px;
  height: 40px;
  padding: 7px;
  object-fit: contain;
  transform: rotate(180deg); /* ✅ 기본: 반대 방향 */
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/*
  ==================== 3. FAQ 영역 ====================

  💡 설계:
  - background-color: $white → 흰 배경
  - border-radius: 22px → 둥근 모서리
  - padding: 22px → 안쪽 여백
  - box-shadow: 0 10px 30px → 카드 음영

  ✅ 변경사항:
  - max-height 설정 → 고정된 높이로 카드 2개만 노출
  - display: flex + flex-direction: column → 수직 배열
  - .expand-sidebar__qa-list에만 overflow-y: auto 적용
*/

.expand-sidebar__qa-section {
  background-color: $white;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  display: flex; /* ✅ flex 추가 */
  flex-direction: column; /* ✅ 수직 배열 */
}

/* FAQ 섹션 헤더 */

.expand-sidebar__qa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: $spacing-3;
  flex-shrink: 0; /* ✅ 헤더 높이 고정 */
}

.expand-sidebar__qa-title-wrapper {
  display: flex;
  align-items: center;
}

.expand-sidebar__qa-icon {
  font-size: 16px;
}

.expand-sidebar__qa-title {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  margin: 0;
  color: #606060;
  margin-right: 6px;
  line-height: 20px;
}

.expand-sidebar__qa-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 42px;
  height: 22px;
  padding: 2px $spacing-2;
  background-color: var(--primary-color);
  color: $white;
  border-radius: 999px;

  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
}

.expand-sidebar__qa-more-link {
  font-size: $font-size-xs;
  color: $black;
  text-decoration: none;
  transition: color 0.3s ease;
  padding: 0;
  margin-bottom: 0;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}

/* FAQ 항목 목록 */

.expand-sidebar__qa-list {
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  /* ✅ 리스트에 스크롤 추가 */
  flex: 1; /* 남은 공간 차지 */
  overflow-y: auto; /* 내부 스크롤 활성화 */
  min-height: 0; /* ✅ flex 자식에서 필수 (overflow 활용을 위해) */

  /* ✅ 스크롤바 스타일 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-300;
    border-radius: 3px;
    transition: background 0.3s ease;

    &:hover {
      background: $gray-400;
    }
  }
}

.expand-sidebar__qa-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  border: 1px solid $gray-200;
  background-color: $white;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  margin-bottom: 0;
  &:hover {
    background-color: #f5f5f5;
  }
}

.expand-sidebar__qa-category {
  display: inline-block;
  padding: $spacing-1 $spacing-2;
  background-color: #ffebee;
  color: #c62828;
  border-radius: $border-radius-sm;
  font-size: 11px;
  font-weight: $font-weight-bold;
  text-align: center;
  width: fit-content;
}

/*
  ==================== FAQ 제목 ====================

  ✅ 변경사항:
  - display: block 사용 → 한 줄로 표시
  - white-space: nowrap → 줄바꿈 방지
  - overflow: hidden → 넘친 내용 숨김
  - text-overflow: ellipsis → "..."으로 표시
  - -webkit-line-clamp: 1 제거 (2줄 → 1줄로 변경)
*/

.expand-sidebar__qa-item-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: #333333;
  line-height: 1.5;

  /* ✅ 한 줄로 표시 */
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-sidebar__qa-item-meta {
  display: flex;
  gap: $spacing-3;
  font-size: $font-size-xs;
  color: $gray-500;
}

.expand-sidebar__qa-author,
.expand-sidebar__qa-date {
  white-space: nowrap;
}

/*
  ==================== 반응형 (필요 시) ====================

  💡 모바일 대응 시 추가 예정
  @media (max-width: 768px) {
    .expand-sidebar {
      width: 100%;
      right: -100%;
    }
  }
*/
</style>
