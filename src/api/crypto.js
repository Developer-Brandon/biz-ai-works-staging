// ============================================================
// 암호화/복호화 유틸
// ============================================================

/**
 * AES 암호화 함수
 * 실제로는 crypto-js 또는 node의 crypto 모듈 사용
 *
 * TODO: 실제 암호화 라이브러리 설치 후 구현
 * npm install crypto-js
 */
export function encryptData(data) {
  // 임시: 암호화 없이 데이터 전송
  // 실제: CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
  console.log("🔐 [준비중] 데이터 암호화:", data);
  return data;
}

/**
 * AES 복호화 함수 (예시)
 */
export function decryptData(encryptedData) {
  // 임시: 복호화 없이 사용
  // 실제: CrpytoJS.AES.decrypt(encryptedData, SCRET_KEY)
  console.log("🔓 [준비중] 데이터 복호화:", encryptedData);
  return encryptedData;
}
