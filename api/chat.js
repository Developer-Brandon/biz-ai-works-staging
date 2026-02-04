/**
 * ============================================================
 * [프록시] 채팅 API 프록시 (Vercel 함수)
 * ============================================================
 *
 * 위치: /api/chat.js
 *
 * 역할:
 * - 클라이언트(Vue.js/Vercel)에서 백엔드(http://172.190.116.61:18080)로의 프록시
 * - CORS 처리 (Vercel 도메인 → 백엔드)
 * - Authorization 헤더 자동 전달
 * - SSE 스트리밍 응답 그대로 전달 (text/event-stream)
 *
 * 🔄 요청 흐름:
 * 브라우저 (https://example.vercel.app)
 *   ↓ (클라이언트에서 /api/chat로 요청)
 * Vercel 함수 (이 파일)
 *   ↓ (Authorization 헤더를 포함해서 백엔드로 전달)
 * 백엔드 (http://172.190.116.61:18080/api/chat/messages 또는 /api/chat/agents/invoke)
 *   ↓ (SSE 스트리밍 응답)
 * Vercel 함수 (스트림 그대로 전달)
 *   ↓
 * 브라우저 (SSE 스트리밍 수신)
 *
 * 🔑 중요:
 * - Authorization 헤더 반드시 전달
 * - multipart/form-data Content-Type 그대로 전달
 * - SSE 스트리밍 응답을 JSON 변환 없이 그대로 전달
 * - 쿼리 파라미터로 엔드포인트 결정 (?endpoint=messages 또는 ?endpoint=agents)
 */

export default async function handler(req, res) {
  console.group("=== 📨 Vercel Chat 프록시 함수 시작 ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Query:", req.query);
  console.log("Headers:", {
    "content-type": req.headers["content-type"],
    authorization: req.headers.authorization
      ? req.headers.authorization.substring(0, 20) + "..."
      : "없음",
  });
  console.groupEnd();

  // ============================================================
  // 1️⃣ CORS 헤더 설정
  // ============================================================
  //
  // 💡 프로덕션 배포 시:
  // 와일드카드 "*" 대신 정확한 도메인 설정
  // res.setHeader("Access-Control-Allow-Origin", "https://example.vercel.app");
  //
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ============================================================
  // 2️⃣ OPTIONS 요청 처리 (Preflight)
  // ============================================================
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS preflight 요청 처리됨");
    return res.status(200).end();
  }

  // ============================================================
  // 3️⃣ POST 요청만 허용
  // ============================================================
  if (req.method !== "POST") {
    console.error(`❌ 허용되지 않는 메서드: ${req.method}`);
    return res.status(405).json({
      success: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Method not allowed",
      data: null,
    });
  }

  try {
    // ============================================================
    // 🎯 핵심: 클라이언트 Authorization 헤더 추출
    // ============================================================

    const clientAuthToken = req.headers.authorization;

    // 토큰이 없으면 에러
    if (!clientAuthToken) {
      console.error("❌ Authorization 헤더가 없습니다");
      return res.status(401).json({
        success: false,
        code: "AU001",
        message: "인증 토큰이 없습니다. 로그인이 필요합니다.",
        data: null,
      });
    }

    console.log(
      "✅ Authorization 헤더 확인됨:",
      clientAuthToken.substring(0, 30) + "...",
    );

    // ============================================================
    // 4️⃣ 쿼리 파라미터로 엔드포인트 결정
    // ============================================================
    //
    // ?endpoint=messages → /api/chat/messages
    // ?endpoint=agents → /api/chat/agents/invoke
    //
    const endpointType = req.query.endpoint || "messages";
    let backendPath = "";

    switch (endpointType) {
      case "messages":
        backendPath = "/api/chat/messages";
        break;
      case "agents":
        backendPath = "/api/chat/agents/invoke";
        break;
      default:
        console.error(`❌ 알 수 없는 엔드포인트 타입: ${endpointType}`);
        return res.status(400).json({
          success: false,
          code: "INVALID_ENDPOINT",
          message: "유효하지 않은 엔드포인트입니다",
          data: null,
        });
    }

    const backendUrl = `http://172.190.116.61:18080${backendPath}`;

    console.log("📤 백엔드 요청 준비");
    console.log("URL:", backendUrl);
    console.log("Method:", req.method);
    console.log("Endpoint Type:", endpointType);

    // ============================================================
    // 5️⃣ Content-Type 헤더 추출
    // ============================================================
    //
    // multipart/form-data의 boundary를 그대로 전달해야 함!
    //
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes("multipart/form-data")) {
      console.error("❌ Content-Type이 multipart/form-data가 아닙니다");
      return res.status(400).json({
        success: false,
        code: "INVALID_CONTENT_TYPE",
        message: "Content-Type must be multipart/form-data",
        data: null,
      });
    }

    console.log("📋 Content-Type:", contentType);

    // ============================================================
    // 6️⃣ 백엔드로 요청 (Authorization 헤더 포함)
    // ============================================================

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": contentType, // boundary 포함된 Content-Type
        Authorization: clientAuthToken, // 클라이언트 토큰 그대로 전달
      },
      body: req, // 요청 본문 그대로 전달 (stream)
      duplex: "half", // ✅ 핵심 추가: duplex 옵션!
    };

    console.log("📡 fetch 요청 시작 (duplex: half 포함)...");

    const response = await fetch(backendUrl, fetchOptions);

    console.log("📥 백엔드 응답 상태:", response.status);
    console.log(
      "📥 백엔드 응답 Content-Type:",
      response.headers.get("content-type"),
    );

    // ============================================================
    // 8️⃣ 응답 처리
    // ============================================================

    // 1️⃣ 응답이 실패한 경우
    if (!response.ok) {
      let errorData = null;
      let errorText = "";

      try {
        errorText = await response.text();
        // 텍스트를 JSON으로 파싱 시도
        if (errorText) {
          errorData = JSON.parse(errorText);
        }
      } catch (parseError) {
        errorData = { message: errorText };
      }

      console.error("❌ 백엔드 에러 발생");
      console.error("상태 코드:", response.status);
      console.error("에러 데이터:", errorData);

      // ✅ 백엔드 에러 응답을 그대로 클라이언트로 반환
      return res.status(response.status).json(
        errorData || {
          success: false,
          code: "BACKEND_ERROR",
          message: "백엔드 요청 실패",
          data: null,
        },
      );
    }

    // 2️⃣ 성공 응답 - SSE 스트리밍
    //
    // 🔑 중요:
    // - Content-Type: text/event-stream
    // - 응답 본문을 JSON으로 변환하지 말고 그대로 전달
    // - ReadableStream을 클라이언트로 파이프
    //

    const responseContentType = response.headers.get("content-type");

    if (responseContentType?.includes("text/event-stream")) {
      console.log("🔄 SSE 스트리밍 응답 - 클라이언트로 전달");

      // ✅ SSE 응답 헤더 설정
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // ✅ X-Room-Id 헤더가 있으면 클라이언트로 전달
      const roomId = response.headers.get("X-Room-Id");
      if (roomId) {
        res.setHeader("X-Room-Id", roomId);
        console.log("🏠 X-Room-Id 헤더 전달:", roomId);
      }

      // ✅ ReadableStream을 클라이언트로 파이프
      const reader = response.body.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("✅ SSE 스트리밍 완료");
            res.end();
            break;
          }

          // 청크를 클라이언트로 전송
          res.write(value);
        }
      } catch (streamError) {
        console.error("❌ SSE 스트리밍 중 에러:", streamError.message);
        res.end();
      }
    } else {
      // JSON 응답인 경우 (드물지만 가능)
      const data = await response.json();
      console.log("✅ JSON 응답");
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error("❌ [프록시 에러] 예외 발생");
    console.error("에러 메시지:", error.message);
    console.error("에러 스택:", error.stack);

    return res.status(500).json({
      success: false,
      code: "PROXY_ERROR",
      message: "프록시 처리 중 에러 발생",
      data: null,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================================
// Vercel 함수 설정
// ============================================================
//
// bodyParser 비활성화 (multipart 본문을 그대로 전달하기 위해)
//
export const config = {
  api: {
    bodyParser: false, // ✅ 중요: multipart 본문을 파싱하지 않음
  },
};
