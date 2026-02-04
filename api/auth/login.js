// api/auth/login-payload.js

export default async function handler(req, res) {
  console.log("=== 프록시 함수 시작 ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // CORS 헤더
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST만 허용
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      method: req.method,
    });
  }

  try {
    // 요청 데이터 로깅
    console.log("요청 바디:", JSON.stringify(req.body));

    // 백엔드로 요청
    const backendUrl = "http://172.190.116.61:18080/api/auth/login";
    console.log("백엔드 URL:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body || {}),
      timeout: 30000,
    });

    console.log("백엔드 응답 상태:", response.status);

    // 응답이 OK가 아니면
    if (!response.ok) {
      const errorText = await response.text();
      console.error("백엔드 에러:", response.status, errorText);
      return res.status(response.status).json({
        error: "Backend error",
        status: response.status,
        message: errorText,
      });
    }

    // 성공 응답
    const data = await response.json();
    console.log("백엔드 응답 성공:", data);

    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ 프록시 에러:", error);
    console.error("에러 메시지:", error.message);
    console.error("에러 스택:", error.stack);

    return res.status(500).json({
      error: "Proxy error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
