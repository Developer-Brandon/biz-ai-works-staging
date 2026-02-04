<template>
  <!-- ==================== FAQ 팝업 컨테이너 ==================== -->
  <!-- 
      🎯 팝업 컨테이너 설명:
      
      Transition 이름: "popup-slide"
      - scale: 0.95 → 1 (초기 애니메이션)
      - opacity: 0 → 1 (페이드 인)
      - transform: translateY(-20px) → translateY(0) (위에서 내려오는 느낌)
      
      💡 부드러운 cubic-bezier 사용
         cubic-bezier(0.34, 1.56, 0.64, 1) = 약간 튀는 느낌의 트렌디한 애니메이션
    -->
  <!-- ==================== 배경 오버레이 (흐림처리) ==================== -->
  <!-- 
    🎯 오버레이 설명:
    - position: fixed → 화면 전체를 덮음
    - backdrop-filter: blur(8px) → 배경 블러 효과
    - background: rgba(0, 0, 0, 0.5) → 반투명 어두운 배경
    - z-index: 2000 → 팝업(2001)보다 뒤에 위치
    
    [Vue2 vs Vue3]
    Vue2: v-if와 transition 조합이 복잡함
    Vue3: 더 직관적으로 조합 가능
  -->
  <Transition name="fade-overlay">
    <div
      v-if="isFaqPopupOpen"
      class="faq-popup-overlay"
      @click="closeFaqPopup"
    ></div>
  </Transition>

  <Transition name="popup-slide">
    <div v-if="isFaqPopupOpen" class="faq-popup__container">
      <!-- ========== 팝업 헤더 ========== -->
      <!-- 
          Vue3 Composition API 사용:
          - ref() vs Vue2의 data()
          - event handler는 화살표 함수로 쉽게 처리
        -->
      <div class="faq-popup__header">
        <h2 class="faq-popup__title no-drag">FAQ 질문</h2>
        <button
          class="faq-popup-close-btn"
          @click="closeFaqPopup"
          aria-label="팝업 닫기"
          title="닫기"
        >
          <!-- 
              🎨 X 아이콘을 직접 텍스트로 표현 (유니코드)
              추후 아이콘 파일로 변경 가능
            -->
          <span class="faq-popup-close-icon">×</span>
        </button>
      </div>

      <!-- ========== 팝업 콘텐츠 (좌측/우측 2열 레이아웃) ========== -->
      <!-- 
          📐 Grid 레이아웃: 2 열 (좌측: 35%, 우측: 65%)
          스크롤 가능한 높이 제한
        -->
      <div class="faq-popup-content">
        <!-- ========== 좌측: FAQ 리스트 섹션 ========== -->
        <div class="faq-list-section">
          <!-- ========== 검색바 ========== -->
          <!-- 
              🎯 검색 입력 필드
              v-model: 양방향 데이터 바인딩
              
              [Vue2 vs Vue3]
              Vue2: v-model은 value + @input의 syntactic sugar
              Vue3: v-model도 동일하지만, 더 세밀한 제어 가능
                    (예: lazy, number, trim modifiers)
            -->
          <div class="faq-search-container">
            <input
              v-model="faqSearchQuery"
              type="text"
              class="faq-search-input"
              placeholder="검색어를 입력하세요."
              aria-label="FAQ 검색"
            />
            <span class="faq-search-icon">
              <CommonIcon :src="searchIcon" :size="17.5" />
            </span>
          </div>

          <!-- ========== 필터 버튼 ========== -->
          <!-- 
              🎯 필터 토글 버튼들
              v-for: 배열 반복 렌더링
              
              [Vue2 vs Vue3]
              Vue2: :key="index" 사용 (권장되지 않음, 유니크 ID 권장)
              Vue3: 동일하지만 setup()에서 데이터 관리하기 때문에
                    더 효율적으로 반응성 추적됨
            -->
          <div class="faq-filter-section">
            <button
              v-for="(filter, index) in faqFilters"
              :key="`filter-${index}`"
              class="faq-filter-btn no-drag"
              :class="{
                'faq-filter-btn--active': filter.isActive,
                'question-stay-label': filter.label === '질문대기',
                'answer-finish-label': filter.label === '답변완료',
              }"
              @click="toggleFilter(index)"
              :aria-pressed="filter.isActive"
            >
              {{ filter.label }}
            </button>
            <!-- 
                전체 FAQ 개수 표시
                필터 적용 후에도 원본 데이터 기준으로 보여줌
              -->
            <span class="faq-total-count no-drag"
              >Total : {{ faqTotalCount }}</span
            >
          </div>

          <!-- ========== FAQ 리스트 (스크롤 가능) ========== -->
          <!-- 
              🎯 FAQ 항목 리스트
              max-height 지정으로 스크롤 활성화
              
              선택된 항목에 --selected 클래스 추가
              hover, click 상태 애니메이션 적용
            -->
          <div class="faq-list-wrapper">
            <div
              v-for="(faqItem, index) in filteredFaqList"
              :key="`faq-${index}`"
              class="faq-list-item"
              :class="{
                'faq-list-item--selected': faqItem.isSelected,
                'question-stay-tag': faqItem.tag === '질문대기',
                'answer-finish-tag': faqItem.tag === '답변완료',
              }"
              @click="selectFaqItem(index)"
              role="button"
              tabindex="0"
              @keydown.enter="selectFaqItem(index)"
            >
              <!-- 태그 -->
              <!-- 
                  v-if: 태그가 존재할 때만 렌더링
                  배지 스타일로 표시
                -->
              <div
                v-if="faqItem.tag"
                class="faq-list-item-tag"
                :class="{
                  'question-stay-tag': faqItem.tag === '질문대기',
                  'answer-finish-tag': faqItem.tag === '답변완료',
                }"
              >
                {{ faqItem.tag }}
              </div>

              <!-- 질문 제목 -->
              <!-- 
                  주요 콘텐츠
                  text-overflow: ellipsis로 긴 텍스트는 ... 처리
                -->
              <h3 class="faq-list-item-title">{{ faqItem.question }}</h3>

              <!-- 작성자 정보 -->
              <!-- 
                  메타 정보 (작성자, 날짜)
                  작은 글씨로 표시
                -->
              <div class="faq-list-item-meta">
                <span class="faq-list-item-author">
                  작성자 : {{ faqItem.author }}
                </span>
                <span class="faq-list-item-date">
                  일시 : {{ faqItem.date }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== 우측: FAQ 상세 정보 섹션 ========== -->
        <!-- 
            🎯 선택된 FAQ 항목의 상세 정보 표시
            
            조건부 렌더링:
            - selectedFaqDetail가 null이면 아무것도 표시 안 함
            - 항목 선택 후 상세 정보 표시
          -->
        <div class="faq-detail-section">
          <h3 class="faq-detail-header">FAQ 문의내용</h3>

          <!-- 세부정보 박스 -->
          <!-- 
              담당자와 응답 일시 정보 표시
              v-if로 데이터 존재 여부 확인
            -->
          <div class="faq-detail-box faq-detail-box--question">
            <h4 class="faq-detail-box-title">세부정보</h4>
            <div class="faq-detail-box-content">
              <p v-if="selectedFaqDetail">
                담당자 : {{ selectedFaqDetail.assignee }}
              </p>
              <p v-if="selectedFaqDetail">
                답변 일시 : {{ selectedFaqDetail.responseDate }}
              </p>
              <p v-else class="faq-detail-placeholder">
                FAQ 항목을 선택해주세요.
              </p>
            </div>
          </div>

          <!-- 질문 박스 -->
          <!-- 
              사용자가 작성한 질문 내용
              읽기 전용 영역
            -->
          <div class="faq-detail-box faq-detail-box--answer">
            <h4 class="faq-detail-box-title">질문</h4>
            <div class="faq-detail-box-content">
              <p v-if="selectedFaqDetail">
                {{ selectedFaqDetail.questionContent }}
              </p>
              <p v-else class="faq-detail-placeholder">
                FAQ 항목을 선택해주세요.
              </p>
            </div>
          </div>

          <!-- 답변 박스 -->
          <!-- 
              관리자의 답변 내용
              textarea 사용으로 여러 줄 텍스트 표시
              readonly 속성으로 편집 불가
              
              [Vue3 특징]
              :value 바인딩이 직관적이고 명확함
            -->
          <div class="faq-detail-box">
            <h4 class="faq-detail-box-title">답변</h4>
            <textarea
              v-if="selectedFaqDetail"
              class="faq-detail-textarea"
              :value="selectedFaqDetail.answerContent"
              readonly
              aria-label="FAQ 답변"
            ></textarea>
            <div v-else class="faq-detail-textarea-placeholder">
              선택된 항목이 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script setup>
import { ref, computed } from "vue";
import CommonIcon from "@/components/icon/CommonIcon.vue";
import searchIcon from "@/assets/images/icon/reading_grasses.png";

defineProps({
  isFaqPopupOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

/**
 * FAQ 검색 쿼리
 * 사용자가 검색바에 입력한 값
 * v-model과 바인딩되어 실시간 업데이트
 */
const faqSearchQuery = ref("");

/**
 * FAQ 필터 데이터
 * isActive 속성으로 선택/비선택 상태 관리
 */
const faqFilters = ref([
  { label: "질문대기", isActive: false },
  { label: "답변완료", isActive: false },
]);
/**
 * 전체 FAQ 리스트
 * 실제로는 API에서 받아올 데이터
 * 현재는 더미 데이터로 구성
 */
const faqList = ref([
  {
    id: 1,
    tag: "질문대기",
    question: "Q.스마트 제조 관련 AI 기반 이상 탐지에 대해 국정감사에서..",
    author: "결제플랫폼사업부 홍길동",
    date: "2025.12.20 16:24",
    category: "질문대기",
    assignee: "기술관리부 류준열",
    responseDate: "2025.12.20 16:24",
    questionContent:
      "스마트 제조 관련 AI 기반 이상 탐지에 대해 국정감사에서 질의가 들어온 경우, 어떻게 대응해야 하는지 문의 드립니다.",
    answerContent: "(답변대기)",
    isSelected: false,
  },
  {
    id: 2,
    tag: "질문대기",
    question: "Q. 작년 제출한 국정 자료용중 3팀기 AI신사업 관련 문의",
    author: "전략기획부 유재석",
    date: "2025.12.20 16:24",
    category: "질문대기",
    assignee: "화폐사업부 하정우",
    responseDate: "2025.12.20 16:24",
    questionContent:
      "작년 제출한 국정 자료용중 3팀기 AI신사업 중 AI 에산배정과 실적을 비교해서 알려주세요.",
    answerContent: "문의하신 정보에 대해서......(중략)......",
    isSelected: false,
  },
  {
    id: 3,
    tag: "질문대기",
    question:
      "Q. 디지털 화폐(CBDC) 도입 시 중계공사 역할과 관련 자료정에 있어..",
    author: "경영관리부 김성균",

    date: "2025.12.20 16:24",
    category: "질문대기",
    assignee: "디지털전환부 김우빈",
    responseDate: "2025.12.20 16:24",
    questionContent:
      "디지털 화폐(CBDC) 도입 시 중계공사 역할과 관련 자료정에 있어서 알려주세요.",
    answerContent: "해당 정책에 대한 구체적인 내용은 다음과 같습니다.",
    isSelected: false,
  },
  {
    id: 4,
    tag: "답변완료",
    question:
      "Q. 임직원 1인당 매출액, 영업이익 등 생산성 지표와 각 사업지표 비교..",
    author: "조직법규부 조정석",
    date: "2025.12.20 16:24",
    category: "답변완료",
    assignee: "출자관리부 이병헌",
    responseDate: "2025.12.20 16:24",
    questionContent:
      "임직원 1인당 매출액, 영업이익 등 생산성 지표와 각 사업지표를 비교해주세요.",
    answerContent: "생산성 관련 주요 지표는 다음과 같습니다.",
    isSelected: false,
  },
  {
    id: 5,
    tag: "질문대기",
    question: "Q. 25년도 수출 실적 보고서 관련 문의",
    author: "성과관리부 박성준",
    date: "2025.12.20 16:24",
    category: "질문대기",
    assignee: "공공사업부 마동석",
    responseDate: "2025.12.20 16:24",
    questionContent:
      "직낭 예의 수출 실적 보고서를 매년 제출하는데, 25년도에는 어떻게 처리해야 하나요?",
    answerContent: "매년 수출 실적은 다음의 양식에 맞춰서 제출해주시면 됩니다.",
    isSelected: false,
  },
  {
    id: 6,
    tag: "질문대기",
    question: "Q. 25년도 분기별USB, 판매비 출발성 등 판매 실적 문의",
    author: "ICT기획부 유아인",
    date: "2025.12.17 15:02",
    category: "질문대기",
    assignee: "BBB부서 SSS명",
    responseDate: "2025.12.17 15:02",
    questionContent:
      "2025년도 분기별 판매 현황, 판매비, 출발성 등의 판매 실적을 알려주세요.",
    answerContent: "2025년도 판매 실적 현황은 다음과 같습니다.",
    isSelected: false,
  },
]);

/**
 * 현재 선택된 FAQ 항목 상세 정보
 * null이면 아무것도 선택되지 않음
 */
const selectedFaqDetail = ref(null);

/**
 * FAQ 전체 개수 (상수)
 * 필터링과 무관하게 항상 전체 개수 표시
 */
const faqTotalCount = computed(() => faqList.value.length);

/**
 * [Vue3 computed() 설명]
 * Vue2의 computed와 동일
 * 의존성 추적 자동화
 * 캐싱되어 성능 최적화됨
 *
 * filteredFaqList: 검색어 + 필터 조건에 맞는 FAQ 리스트
 */
const filteredFaqList = computed(() => {
  let result = faqList.value;

  // 1. 필터링 적용
  const activeFilters = faqFilters.value
    .filter((f) => f.isActive)
    .map((f) => f.label);

  if (activeFilters.length > 0) {
    result = result.filter((item) => activeFilters.includes(item.category));
  }

  // 2. 검색 쿼리 적용
  if (faqSearchQuery.value.trim()) {
    const query = faqSearchQuery.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query),
    );
  }

  return result;
});

// ========== FAQ 팝업 메서드 ==========

const closeFaqPopup = () => {
  console.log("📋 FAQ 팝업 닫기");

  // 부모 컴포넌트에 close 이벤트 emit
  emit("close");

  // body 스크롤 복원
  // document.body.style.overflow = "auto";

  // 3️⃣ 선택 상태 초기화 (자식 컴포넌트 내부 상태만 리셋)
  selectedFaqDetail.value = null;
  faqList.value.forEach((item) => {
    item.isSelected = false;
  });
};

/**
 * selectFaqItem: FAQ 항목 선택
 *
 * @param {number} index - 선택한 FAQ 항목의 인덱스
 *
 * 동작:
 * 1. 이전 선택 항목 선택 해제
 * 2. 새 항목 선택
 * 3. selectedFaqDetail 업데이트
 */
const selectFaqItem = (index) => {
  console.log(`✅ FAQ 항목 선택: ${index}`);

  // 1. 이전 선택 제거
  faqList.value.forEach((item) => {
    item.isSelected = false;
  });

  // 2. 현재 항목 선택
  const selectedItem = filteredFaqList.value[index];
  if (selectedItem) {
    // 원본 배열에서 해당 항목 찾기
    const originalIndex = faqList.value.findIndex(
      (i) => i.id === selectedItem.id,
    );
    if (originalIndex !== -1) {
      faqList.value[originalIndex].isSelected = true;
      selectedFaqDetail.value = {
        ...faqList.value[originalIndex],
      };
    }
  }
};

/**
 * toggleFilter: 필터 토글
 *
 * ✅ 수정: 다른 필터는 비활성화하고 선택한 필터만 활성화
 */
const toggleFilter = (index) => {
  console.log(`🏷️ 필터 토글: ${faqFilters.value[index].label}`);

  // // 1. 모든 필터 비활성화
  // faqFilters.value.forEach((filter) => {
  //   filter.isActive = false;
  // });

  // // 2. 선택한 필터만 활성화
  // faqFilters.value[index].isActive = true;
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/* ==================== FAQ 팝업 오버레이 (배경 흐림처리) ==================== */
/**
 * 🎨 오버레이 스타일:
 * 
 * 1. fixed positioning: 화면 전체를 덮음
 * 2. backdrop-filter: blur(8px): 배경 블러 효과
 * 3. background: rgba(0, 0, 0, 0.5): 반투명 검정색 오버레이
 * 4. z-index: 2000: 팝업 뒷배경 (팝업은 2001)
 *
 * 📱 반응형:
 * - 모든 디바이스에서 동일한 스타일 적용
 * - fixed 속성으로 스크롤해도 화면 전체 덮음
 */

.faq-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 2000;
  cursor: pointer;
}

/* ==================== FAQ 팝업 컨테이너 ==================== */
/**
 * 🎯 팝업 컨테이너 구조:
 * 
 * 1. fixed positioning: 화면 가운데 고정
 * 2. z-index: 2001: 오버레이보다 앞
 * 3. display: grid: 헤더 + 콘텐츠 2행 레이아웃
 * 4. max-height: 80vh: 최대 높이 제한 (스크롤 활성화)
 * 5. box-shadow: 입체감 있는 그림자 (디자인 시안 기반)
 * 6. border-radius: 16px: 둥근 모서리 (모던 디자인)
 *
 * 📐 반응형:
 * - Desktop (>= 1024px): 너비 1000px
 * - Tablet (768px ~ 1023px): 너비 90%
 * - Mobile (< 768px): 너비 95%, 높이 90vh (더 큰 영역)
 */

.faq-popup {
  &__container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2001;

    width: 1000px;
    max-height: 80vh;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;

    display: grid;
    grid-template-rows: auto 1fr;
    border: 1px solid $gray-600;
    border-radius: 30px;

    /* 반응형 */
    @media (max-width: 1024px) {
      width: 90%;
    }

    @media (max-width: 768px) {
      width: 95%;
      max-height: 90vh;
    }

    @media (max-width: 480px) {
      width: 98%;
      max-height: 95vh;
      border-radius: 12px;
    }
  }
  /* ==================== 팝업 헤더 ==================== */
  /**
      * 🎯 헤더 스타일:
      * 
      * 1. display: flex: 제목과 닫기 버튼을 양쪽 끝에 배치
      * 2. justify-content: space-between: 공간 최대 분배
      * 3. align-items: center: 세로 중앙 정렬
      * 4. padding: 24px: 내부 여백
      * 5. border-bottom: 1px solid #e5e5e5: 헤더와 콘텐츠 구분선
      * 6. background-color: #ffffff: 흰색 배경
      * 7. flex-shrink: 0: 높이 고정 (스크롤 시 헤더 항상 표시)
      */
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 19px 40px;
    border-bottom: 1px solid $gray-200;
    background-color: #ffffff;
    flex-shrink: 0;

    /* 반응형 */
    @media (max-width: 768px) {
      padding: 16px 20px;
    }
  }

  /**
      * 🎯 팝업 제목:
      * 
      * 1. font-size: 20px: 제목 크기
      * 2. font-weight: 600: 반굵음 (강조)
      * 3. color: $black: 검정색
      * 4. margin: 0: 기본 마진 제거
      * 5. 반응형: 모바일에서 18px로 축소
      */
  &__title {
    font-size: 20px;
    font-weight: 400;
    color: $black;
    margin: 0;
    letter-spacing: -0.5px;

    @media (max-width: 768px) {
      font-size: 18px;
    }
  }
}

/**
 * 🎯 닫기 버튼:
 * 
 * 1. background: transparent: 투명한 배경
 * 2. border: none: 테두리 제거
 * 3. cursor: pointer: 클릭 커서
 * 4. padding: 0: 패딩 제거
 * 5. width/height: 32px: 정사각형 버튼
 * 6. display: flex: 내용 중앙 정렬
 * 7. transition: all 0.2s ease: 부드러운 호버 애니메이션
 *
 * 🎨 호버 상태:
 * - background-color: #f5f5f5: 연한 회색 배경
 * - transform: rotate(90deg): 회전 효과 (트렌디함)
 */

.faq-popup-close-btn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    background-color: #f5f5f5;
    transform: rotate(90deg);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }
}

/**
 * 🎯 X 아이콘:
 * 
 * 1. font-size: 24px: 아이콘 크기
 * 2. color: #333333: 진한 회색
 * 3. line-height: 1: 높이 정확히 맞춤
 */

.faq-popup-close-icon {
  font-size: 24px;
  color: #333333;
  line-height: 1;
  font-weight: 300;
}

/* ==================== 팝업 콘텐츠 영역 ==================== */
/**
 * 🎯 콘텐츠 레이아웃:
 * 
 * 1. display: grid: 2열 레이아웃
 * 2. grid-template-columns: 35% 1fr: 좌측 35%, 우측 65%
 * 3. gap: 20px: 열 간격
 * 4. overflow: hidden: 스크롤바 안 보이게
 * 5. padding: 20px: 내부 여백
 * 6. background-color: #f9f9f9: 연한 회색 배경
 *
 * 📱 반응형:
 * - 모바일: 1열 레이아웃 (세로)
 */

.faq-popup-content {
  display: grid;
  grid-template-columns: 45% 1fr;
  gap: 20px;
  overflow: hidden;
  padding: 20px;
  flex: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

/* ==================== 좌측: FAQ 리스트 섹션 ==================== */
/**
 * 🎯 리스트 섹션 구조:
 * 
 * 1. display: flex: 세로 방향 배치
 * 2. flex-direction: column: 열 배치
 * 3. gap: 16px: 요소 간 간격
 * 4. overflow: hidden: 내부 스크롤
 * 5. height: 100%: 부모의 전체 높이 사용
 */

.faq-list-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  height: 100%;
}

/* ==================== 검색바 ==================== */
/**
 * 🎯 검색 컨테이너:
 * 
 * 1. position: relative: input과 icon의 상대 위치 기준
 * 2. display: flex: 수평 배치
 * 3. align-items: center: 세로 중앙 정렬
 * 4. flex-shrink: 0: 높이 고정
 */

.faq-search-container {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/**
 * 🎯 검색 입력 필드:
 * 
 * 1. width: 100%: 컨테이너 전체 너비
 * 2. padding: 10px 12px 10px 40px: 좌측 icon 공간 확보
 * 3. border: 1px solid #ddd: 연한 회색 테두리
 * 4. border-radius: 20px: 약간 둥근 모서리
 * 5. font-size: 14px: 작은 글씨
 * 6. transition: all 0.2s ease: 포커스 애니메이션
 *
 * 🎨 포커스 상태:
 * - border-color: $mainColor: 주색상으로 변경
 * - box-shadow: 0 0 0 3px rgba($mainColor, 0.1): 부드러운 하이라이트
 * - background-color: #ffffff: 흰색 배경
 */

.faq-search-input {
  width: 100%;
  padding: 9px 57px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  background-color: #ffffff;
  transition: all 0.2s ease;
  outline: none;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border-color: var(--main-hover-color);
    box-shadow: 0 0 0 3px rgba(var(--main-hover-color), 0.1);
    background-color: #ffffff;
  }
}

/**
 * 🎯 검색 아이콘:
 * 
 * 1. position: absolute: 입력 필드 위에 오버레이
 * 2. left: 12px: 좌측 위치
 * 3. font-size: 16px: 아이콘 크기
 * 4. color: #999: 회색
 * 5. pointer-events: none: 클릭 불가
 */

.faq-search-icon {
  position: absolute;
  top: 10px;
  left: 25px;
  color: #999;
  pointer-events: none;
}

/* ==================== 필터 섹션 ==================== */
/**
 * 🎯 필터 섹션:
 * 
 * 1. display: flex: 수평 배치
 * 2. flex-wrap: wrap: 공간 부족 시 줄바꿈
 * 3. gap: 8px: 버튼 간 간격
 * 4. align-items: center: 세로 중앙 정렬
 * 5. justify-content: space-between: 공간 최대 분배
 * 6. flex-shrink: 0: 높이 고정
 */

.faq-filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

/**
 * 🎯 필터 버튼:
 * 
 * 1. padding: 6px 12px: 버튼 크기
 * 2. border: 1px solid #ddd: 테두리
 * 3. border-radius: 16px: 둥근 모서리 (필터 버튼 스타일)
 * 4. background-color: #ffffff: 흰색 배경
 * 5. color: #666: 회색 텍스트
 * 6. font-size: 13px: 작은 글씨
 * 7. cursor: pointer: 클릭 커서
 * 8. transition: all 0.2s ease: 부드러운 애니메이션
 * 9. white-space: nowrap: 텍스트 줄바꿈 방지
 *
 * 🎨 호버 상태:
 * - border-color: #bbb: 테두리 더 진해짐
 * - background-color: #f5f5f5: 배경 회색으로
 *
 * 🎨 활성 상태 (--active):
 * - background-color: $mainColor: 주색상 배경
 * - color: #ffffff: 흰색 텍스트
 * - border-color: $mainColor: 주색상 테두리
 */

.faq-filter-btn {
  padding: 9px 17px;
  border: none;
  border-radius: 16px;
  background-color: var(--primary-color);
  color: $white;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  font-family: Noto Sans KR;
  font-weight: 700;
  font-style: Bold;
  font-size: 13px;
  leading-trim: NONE;
  line-height: 100%;
  letter-spacing: 0%;
  &--active {
    background-color: var(--main-hover-color);
    color: #ffffff;
    border-color: var(--main-hover-color);
    box-shadow: 0 2px 8px rgba(var(--main-hover-color), 0.3);
  }
}

/**
 * 🎯 전체 개수 표시:
 * 
 * 1. margin-left: auto: 우측 정렬
 * 2. font-size: 12px: 작은 글씨
 * 3. color: #999: 회색
 * 4. white-space: nowrap: 줄바꿈 방지
 * 5. flex-shrink: 0: 축소 방지
 */

.faq-total-count {
  white-space: nowrap;
  flex-shrink: 0;
  font-family: Noto Sans KR;
  font-weight: 400;
  font-style: Regular;
  font-size: 13px;
  margin-left: auto;
  color: $black;
  leading-trim: NONE;
  line-height: 100%;
  letter-spacing: 0%;
  margin-right: 45px;
}

/* ==================== FAQ 리스트 Wrapper ==================== */
/**
 * 🎯 리스트 래퍼:
 * 
 * 1. overflow-y: auto: 세로 스크롤 활성화
 * 2. overflow-x: hidden: 가로 스크롤 비활성화
 * 3. flex: 1: 남은 공간 모두 사용
 * 4. display: flex: 배치
 * 5. flex-direction: column: 세로 배치
 * 6. gap: 8px: 항목 간 간격
 * 7. padding-right: 8px: 스크롤바 공간 확보
 *
 * 🎨 스크롤바 스타일:
 * - width: 6px: 스크롤바 너비
 * - background: #e5e5e5: 배경
 * - thumb: #ccc: 스크롤 막대
 */

.faq-list-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #e5e5e5;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
    transition: background 0.2s ease;

    &:hover {
      background: #999;
    }
  }
}

/* ==================== FAQ 리스트 아이템 ==================== */
/**
 * 🎯 리스트 아이템:
 * 
 * 1. padding: 12px: 내부 여백
 * 2. border: 1px solid #ddd: 테두리
 * 3. border-radius: 8px: 모서리
 * 4. background-color: #ffffff: 흰색 배경
 * 5. cursor: pointer: 클릭 커서
 * 6. transition: all 0.2s ease: 부드러운 호버 애니메이션
 * 7. display: flex: 내용 배치
 * 8. flex-direction: column: 세로 배치
 * 9. gap: 8px: 요소 간 간격
 *
 * 🎨 호버 상태:
 * - border-color: #bbb: 테두리 더 진해짐
 * - box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1): 입체감
 * - transform: translateY(-2px): 위로 올라오는 느낌 (트렌디)
 * - background-color: #fafafa: 배경 약간 진해짐
 *
 * 🎨 선택 상태 (--selected):
 * - border-color: $mainColor: 주색상 테두리
 * - background-color: rgba($mainColor, 0.05): 주색상 배경 (매우 연함)
 * - box-shadow: 0 0 0 2px rgba($mainColor, 0.1): 주색상 하이라이트
 */

.faq-list-item {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.question-stay-tag {
    &:hover {
      border-color: $red; // ✅ #bbb → var(--main-hover-color)
      background-color: rgba($red, 0.08);
    }
  }
  &.answer-finish-tag {
    &:hover {
      border-color: $blue; // ✅ #bbb → var(--main-hover-color)
      background-color: rgba($blue, 0.08);
    }
  }

  &--selected {
    &.question-stay-tag {
      border-color: $red; // ✅ #bbb → var(--main-hover-color)
      background-color: rgba($red, 0.08);
    }
    &.answer-finish-tag {
      border-color: $blue; // ✅ #bbb → var(--main-hover-color)
      background-color: rgba($blue, 0.08);
    }
  }
}

/**
 * 🎯 리스트 아이템 태그:
 * 
 * 1. display: inline-flex: 내용에 맞는 크기
 * 2. width: fit-content: 내용 크기에 맞춤
 * 3. padding: 4px 8px: 내부 여백
 * 4. background-color: #ff9999: 연한 빨간색
 * 5. color: #ff3333: 빨간색 텍스트
 * 6. font-size: 11px: 작은 글씨
 * 7. border-radius: 4px: 약간 둥근 모서리
 * 8. font-weight: 500: 중간 굵기
 */

.faq-list-item-tag {
  display: inline-flex;
  width: fit-content;
  padding: 3px 7px;
  background-color: $white;
  font-size: 11px;
  border-radius: 4px;
  font-weight: 700;

  &.question-stay-tag {
    color: $red;
    border-color: $red;
    border: 1px solid $red;
  }
  &.answer-finish-tag {
    color: $blue;
    border-color: $blue;
    border: 1px solid $blue;
  }
}

/**
 * 🎯 리스트 아이템 제목:
 * 
 * 1. font-size: 14px: 제목 크기
 * 2. font-weight: 600: 굵음
 * 3. color: #333: 진한 회색
 * 4. margin: 0: 마진 제거
 * 5. line-height: 1.4: 줄높이
 * 6. display: -webkit-box: ellipsis를 위한 설정
 * 7. -webkit-line-clamp: 2: 최대 2줄까지만 표시
 * 8. overflow: hidden: 넘침 숨김
 * 9. word-break: break-word: 단어 단위 줄바꿈
 */

.faq-list-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  transition: color 0.2s ease;
}

/**
 * 🎯 리스트 아이템 메타 정보:
 * 
 * 1. display: flex: 수평 배치
 * 2. justify-content: space-between: 공간 최대 분배
 * 3. gap: 8px: 요소 간 간격
 * 4. flex-wrap: wrap: 공간 부족 시 줄바꿈
 * 5. font-size: 11px: 작은 글씨
 * 6. color: #999: 회색
 */

.faq-list-item-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #999;
}

.faq-list-item-author,
.faq-list-item-date {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* ==================== 우측: FAQ 상세 정보 섹션 ==================== */
/**
 * 🎯 상세 정보 섹션:
 * 
 * 1. display: flex: 세로 배치
 * 2. flex-direction: column: 세로 배치
 * 3. gap: 16px: 요소 간 간격
 * 4. overflow-y: auto: 세로 스크롤
 * 5. overflow-x: hidden: 가로 스크롤 비활성화
 * 6. padding-right: 8px: 스크롤바 공간
 * 7. flex: 1: 남은 공간 사용
 */

.faq-detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 28px;
  flex: 1;
  border: 1px solid $gray-200;
  border-radius: 11px;
  background-color: $white;
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #e5e5e5;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;

    &:hover {
      background: #999;
    }
  }
}

/**
 * 🎯 상세 정보 헤더:
 * 
 * 1. font-size: 14px: 헤더 크기
 * 2. font-weight: 600: 굵음
 * 3. color: $black: 검정색
 * 4. margin: 0: 마진 제거
 * 5. padding-bottom: 8px: 하단 여백
 * 6. border-bottom: 1px solid #ddd: 구분선
 */

.faq-detail-header {
  font-size: 16px;
  font-weight: 400;
  color: $black;
  margin: 0;
  padding-bottom: 8px;
}

/* ==================== FAQ 상세 박스 ==================== */
/**
 * 🎯 상세 박스:
 * 
 * 1. padding: 12px: 내부 여백
 * 2. border: 1px solid #e5e5e5: 테두리
 * 3. border-radius: 8px: 모서리
 * 4. background-color: #ffffff: 흰색 배경
 * 5. display: flex: 배치
 * 6. flex-direction: column: 세로 배치
 * 7. gap: 8px: 요소 간 간격
 */

.faq-detail-box {
  padding: 12px;
  border-radius: 8px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* 세부정보 - 자동 크기 */
  &:first-child {
    flex-shrink: 0;
  }

  /* 질문 - 정확히 50% */
  &--question {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  /* 답변 - 정확히 50% */
  &--answer {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}

/**
 * 🎯 박스 제목:
 * 
 * 1. font-size: 12px: 작은 글씨
 * 2. font-weight: 600: 굵음
 * 3. color: #666: 회색
 * 4. margin: 0: 마진 제거
 * 5. text-transform: uppercase: 대문자
 * 6. letter-spacing: 0.5px: 자간 확대
 */

.faq-detail-box-title {
  font-size: 13px;
  font-weight: 700;
  color: $black;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/**
 * 🎯 박스 콘텐츠:
 * 
 * 1. font-size: 13px: 본문 크기
 * 2. color: #333: 진한 회색
 * 3. line-height: 1.5: 줄높이
 * 4. margin: 0: 마진 제거
 * 5. word-break: break-word: 단어 단위 줄바꿈
 */

.faq-detail-box-content {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  p {
    margin: 0 0 8px 0;
    padding: 8px 20px;
    word-break: break-word;
    background-color: $gray-100;
    border-radius: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

/**
 * 🎯 placeholder 텍스트:
 * 
 * 항목이 선택되지 않았을 때 표시되는 안내 텍스트
 */

.faq-detail-placeholder {
  color: #999;
  font-style: italic;
  margin: 0;
}

/* ==================== FAQ 텍스트에어리어 ==================== */
/**
 * 🎯 답변 텍스트에어리어:
 * 
 * 1. width: 100%: 부모의 전체 너비
 * 2. min-height: 200px: 최소 높이
 * 3. max-height: 300px: 최대 높이
 * 4. padding: 12px: 내부 여백
 * 5. border: 1px solid #e5e5e5: 테두리
 * 6. border-radius: 6px: 모서리
 * 7. font-size: 13px: 글씨 크기
 * 8. color: #333: 진한 회색
 * 9. line-height: 1.6: 줄높이 (읽기 편함)
 * 10. resize: vertical: 세로만 리사이징 가능
 * 11. font-family: inherit: 폰트 상속
 * 12. background-color: #ffffff: 흰색 배경
 * 13. cursor: default: 기본 커서 (입력 불가)
 */

.faq-detail-textarea {
  width: 100%;
  min-height: 200px;
  max-height: 300px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  background-color: #ffffff;
  cursor: default;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;

    &:hover {
      background: #999;
    }
  }
}

/**
 * 🎯 텍스트에어리어 placeholder:
 */

.faq-detail-textarea-placeholder {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background-color: #ffffff;
  color: #999;
  font-size: 13px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
}

/* ==================== Transition 애니메이션 ==================== */
/**
 * 🎨 배경 오버레이 애니메이션 (fade-overlay):
 * 
 * [Vue3 Transition]
 * Vue2와 달리 v-enter, v-leave 클래스를 명확하게 정의
 * setup()에서 transition-group 또는 transition으로 감싸서 사용
 *
 * 📌 동작:
 * - 진입: opacity 0 → 1 (0.3s)
 * - 퇴출: opacity 1 → 0 (0.3s)
 */

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

.fade-overlay-enter-to,
.fade-overlay-leave-from {
  opacity: 1;
}
</style>
