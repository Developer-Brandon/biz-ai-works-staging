import { defineStore } from "pinia";
import { ref } from "vue";

export const useTestAuthStore = defineStore("test-auth", () => {
  const testRandomEmail = ref("");
  const testPassword = "demo1234!!";

  const setRandomTestEmail = (office) => {
    // 배열을 셔플한 뒤 하나 반환
    let testEmailList = [];

    if (office === "oci") {
      testEmailList = ["oci@demo.co.kr"];
    } else if (office === "komsco") {
      testEmailList = [
        "komsco@demo.co.kr",
        "komsco_dev@demo.co.kr",
        "komsco_admin@demo.co.kr",
      ];
    } else if (office === "krc") {
      testEmailList = ["krc@demo.co.kr"];
    }

    const shuffled = [...testEmailList];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    testRandomEmail.value = shuffled[0];
  };

  return {
    setRandomTestEmail,
    testRandomEmail,
    testPassword,
  };
});
