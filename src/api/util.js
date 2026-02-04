// src/utils/chatUtils.js
import { marked } from "marked";

/**
 * ✨ 마크다운 파싱 함수
 *
 * @param {string} content - 원본 텍스트 (마크다운 포함)
 * @returns {string} - HTML 문자열
 *
 * Vue2 vs Vue3:
 * - Vue2: 메서드에서 this.parseMarkdown() 호출
 * - Vue3: 함수로 임포트해서 직접 호출 ✅ (더 간단!)
 */
export const parseMarkdown = (content) => {
  if (!content) return "";

  let html = marked.parse(content, {
    breaks: true,
    gfm: true,
  });

  html = html.replace(
    /\[([^\]]+\.(pdf|docx?|xlsx?|pptx?|txt|csv|hwp))\]/gi,
    (_, filename) => `<span class="reference-tag file-tag">${filename}</span>`,
  );

  // ✨ Step 3: 백엔드 URL을 프록시 URL로 변환 (HTTPS Mixed Content 해결)
  // 🎯 이게 핵심!
  // ============================================================
  // 변환 규칙:
  // ============================================================
  // 1️⃣ 포트 8080 (파일 서버)
  //    기존: http://172.190.116.61:8080/files/...
  //    변환: /api/files/...
  //    용도: 파일 다운로드
  //
  // 2️⃣ 포트 18000 (API 서버)
  //    기존: http://172.190.116.61:18000/...
  //    변환: /api/v1/...
  //    용도: REST API 호출
  // ============================================================
  // vercel.json의 rewrite 규칙에 의해 자동으로 백엔드로 프록시됨
  // ============================================================

  // 📌 Rule 1: 포트 8080 (파일 서버) → /api/files
  html = html.replace(
    /href="http:\/\/172\.190\.116\.61:8080\/files\//g,
    'href="/api/files/',
  );

  // 📌 Rule 2: 포트 18000 (API 서버) → /api/v1
  // ⚠️ 주의: 정규표현식 설명
  // - http:\/\/172\.190\.116\.61:18000\/ : 정확히 이 URL로 시작하는 부분
  // - g 플래그: 문서 전체에서 모든 매칭 찾기 (global)
  // - replace의 두 번째 인자: 교체할 문자열
  html = html.replace(
    /href="http:\/\/172\.190\.116\.61:18000\//g,
    'href="/api/v1/',
  );

  // Step 4: 링크에 target="_blank" 추가 (새 탭에서 열기)
  html = html.replace(
    /<a href=/g,
    '<a target="_blank" rel="noopener noreferrer" href=',
  );

  return html;
};

/**
 * 타임스탬프 포맷팅
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
