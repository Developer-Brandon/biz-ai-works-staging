# Biz.AI - 서비스 페이지

> LLM 기반 ChatGPT와 유사한 AI 에이전트 서비스 웹페이지

## 📋 프로젝트 개요

Biz.AI는 내부 직원들을 위한 AI 에이전트 기반 서비스입니다.

- **주요 기능**: AI 챗봇, 다중 에이전트 선택, 문서/이미지 업로드
- **아키텍처**: Frontend (Vue3) - Backend (FastAPI) - Database (PostgreSQL)
- **현재 상태**: 프론트엔드 개발 중 (백엔드는 추후)

## 🛠️ 기술 스택

### 프론트엔드 (현재 프로젝트)

- **프레임워크**: Vue 3 (Composition API + `<script setup>`)
- **번들러**: Vite (빠른 개발 서버, 최적화된 빌드)
- **상태관리**: Pinia (Vue3 공식 상태관리)
- **스타일**: SCSS (CSS 전처리기)
- **HTTP 통신**: axios (서버 API 호출)
- **저장소**: LocalStorage (추후 서버 마이그레이션)

### 배포

- **개발**: `npm run dev` (로컬 Vite 서버)
- **프로덕션**: Vercel (자동 배포)

## 📁 프로젝트 구조

```
ai-works/
├── src/
│   ├── assets/              # 정적 자산 및 스타일
│   │   ├── styles/
│   │   │   ├── globals.scss       # 전역 스타일
│   │   │   ├── variables.scss     # SCSS 변수
│   │   │   └── animations.scss    # 재사용 애니메이션
│   │   └── images/
│   │
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── common/          # 공통 컴포넌트 (Header, Button 등)
│   │   ├── chat/            # 채팅 관련 컴포넌트
│   │   └── layout/          # 레이아웃 컴포넌트
│   │
│   ├── pages/               # 페이지 컴포넌트 (라우팅)
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   └── ...
│   │
│   ├── stores/              # Pinia 상태관리
│   │   ├── chat.js          # 채팅 스토어
│   │   └── agent.js         # Agent 스토어 (추후)
│   │
│   ├── services/            # API 통신 서비스
│   │   ├── api.js           # axios 설정
│   │   └── chatService.js   # 채팅 API (추후)
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── constants.js     # 상수 정의
│   │   └── localStorage.js  # LocalStorage 관리
│   │
│   ├── App.vue              # 최상위 컴포넌트
│   └── main.js              # 진입점
│
├── public/                  # 정적 파일 (자동으로 서빙)
├── .gitignore              # Git 무시 파일
├── vite.config.js          # Vite 설정
├── package.json            # 의존성 정보
└── README.md               # 이 파일
```

## 🚀 시작하기

### 1단계: 프로젝트 클론 및 설정

```bash
# 저장소 클론
git clone <repository-url>
cd ai-works

# 의존성 설치
npm install

# 또는 yarn 사용
yarn install
```

### 2단계: 개발 서버 실행

```bash
npm run dev
```

브라우저가 자동으로 열리며, `http://localhost:5173`에서 개발을 시작할 수 있습니다.

**Hot Module Replacement (HMR)**: 파일 저장 시 자동으로 브라우저에 반영됩니다.

### 3단계: 프로덕션 빌드

```bash
npm run build
```

최적화된 프로덕션 빌드가 `dist/` 폴더에 생성됩니다.

## 🔑 주요 개념

### Vue3 vs Vue2의 변화

#### 1. Composition API 사용

**Vue2 (Options API)**:

```javascript
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;
    },
  },
};
```

**Vue3 (Composition API + `<script setup>`)**:

```javascript
const count = ref(0);
const increment = () => count.value++;
```

#### 2. Vuex → Pinia

**Vuex (Vue2)**:

```javascript
// mutations는 필수, 코드 길이 증가
const store = new Vuex.Store({
  state: { count: 0 },
  mutations: {
    increment(state) {
      state.count++;
    },
  },
});
```

**Pinia (Vue3)**:

```javascript
// 더 간결, mutations 불필요
export const useStore = defineStore("main", () => {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
});
```

### LocalStorage 관리

현재 메시지는 LocalStorage에 저장되지만, **서버로 마이그레이션 예정**입니다.

```javascript
import { saveData, getData } from "@/utils/localStorage";
import { STORAGE_KEYS } from "@/utils/constants";

// 저장
saveData(STORAGE_KEYS.CHAT_MESSAGES, messages);

// 읽기 (기본값 설정)
const messages = getData(STORAGE_KEYS.CHAT_MESSAGES, []);
```

## 🎨 스타일링 가이드

### SCSS 변수 사용

```scss
// variables.scss에서 정의된 변수 사용
.button {
  background-color: var(--primary-color);
  padding: $spacing-md;
  border-radius: $border-radius-base;
  transition: $transition-base;
}
```

### 애니메이션 적용

```scss
// animations.scss에서 정의된 애니메이션 사용
.modal {
  animation: scaleIn 0.3s ease-out;
}
```

## 📡 서버 연동 (추후)

### API 주소 관리

모든 API 주소는 `src/utils/constants.js`에서 관리합니다:

```javascript
// 현재 (로컬)
const API_BASE_URL = "http://localhost:8000";

// 추후 (서버 구축 후)
const API_BASE_URL = "https://api.example.com";
```

### Axios 인터셉터 (추후 구현)

```javascript
// src/services/api.js
import axios from "axios";
import { API_BASE_URL } from "@/utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 요청 인터셉터 (인증 토큰 추가)
api.interceptors.request.use((config) => {
  // SSO 토큰 추가
  return config;
});

export default api;
```

## 🔄 Git 작업 흐름

### 커밋 메시지 컨벤션

```
[타입] 제목

본문 (선택사항)
- 상세 설명
- 변경사항

푸터 (선택사항)
Closes #123
```

**타입**: feat, fix, docs, style, refactor, perf, test, chore

### 예제

```bash
git add .
git commit -m "[feat] 채팅 메시지 전송 기능 추가

- 메시지 입력창 구현
- Pinia 스토어 연동
- LocalStorage 저장 기능

Closes #45"

git push origin main
```

## 🧪 디버깅 팁

### Vue DevTools

Vite에서 자동으로 지원되며, Chrome DevTools에서 Vue 컴포넌트 구조 확인 가능합니다.

### Pinia DevTools

상태 변화를 추적할 수 있습니다:

```javascript
// main.js에서 자동 활성화됨
```

### 콘솔 로깅

```javascript
// 좋은 예
console.log("✅ 메시지 저장 성공:", message);
console.error("❌ API 에러:", error);

// 프로덕션에서는 제거해야 함
```

## 📚 학습 자료

### Vue3 공식 문서

- [Vue3 한글 문서](https://ko.vuejs.org/)
- [Composition API](https://ko.vuejs.org/guide/extras/composition-api-faq.html)

### Pinia

- [Pinia 공식 문서](https://pinia.vuejs.org/ko/)

### Vite

- [Vite 공식 문서](https://vitejs.dev/)

## ⚠️ 주의사항

1. **LocalStorage 용량**: 최대 5-10MB
2. **민감한 정보 저장 금지**: SSO 토큰 등은 쿠키(httpOnly)에 저장
3. **브라우저 호환성**: 최신 브라우저 기준 (IE 미지원)
4. **성능**: 너무 큰 데이터는 서버로 이관 고려

## 🐛 문제 해결

### Vite 서버가 시작되지 않음

```bash
# 1. 포트 5173이 이미 사용 중인지 확인
# 2. node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 3. Vite 캐시 삭제
rm -rf .vite
npm run dev
```

### SCSS 컴파일 에러

```bash
# sass 패키지 설치 확인
npm install -D sass
```

## 📝 라이센스

MIT License - 자유롭게 사용 가능합니다.

---

**마지막 업데이트**: 2025-11-25  
**담당자**: [Your Name]  
**문의**: [연락처]
