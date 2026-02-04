/**
 * 임시 Mock 데이터
 */
export function getMockConfigData(testAuthStore) {
  const office = "komsco"; // oci, komsco, krc
  const privateImageServerUrl = import.meta.env.VITE_IMAGE_SERVER_URL;

  testAuthStore.setRandomTestEmail(office);

  switch (office) {
    case "oci":
      return createOciConfig(privateImageServerUrl);
    case "krc":
      return createKrcConfig(privateImageServerUrl);
    case "komsco":
      return createKomscoConfig(privateImageServerUrl);
    default:
      console.warn(`Unknown office: ${office}, defaulting to komsco`);
      return createKomscoConfig(privateImageServerUrl);
  }
}

function createOciConfig(imageServerUrl) {
  return {
    status: 200,
    message: "success",
    data: {
      info: {
        common: {
          office: "OCI",
          imageServerUrl: imageServerUrl,
          faviconImageUrl: "/oci/favicon.png",
          opengraphImageUrl: "/oci/opengraph.png",
          opengraphDescription: `OCI의 컴퓨트·스토리지·네트워크·보안 자원을 자동화하고 운영 효율을 극대화하는 클라우드 AI 솔루션입니다.`,
          logoImageUrl: "/oci/logo.png",
          mainColorHexCode: "#D0021B",
          mainHoverColorHexCode: "#FFF3F3",
          subColorHexCode: "#545454",
          subHoverColorHexCode: "#999999",
        },
        login: {
          defaultProfileImageUrl: "/oci/default_profile.png",
          pannelImageUrl: "/oci/pannel.png",
        },
        main: {
          aiAgentCards: [
            {
              id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
              order: "1",
              type: "chatCard",
              cardThumbnailUrl: "/oci/card_image1.png",
              name: "사규AI",
              description:
                "국정감사 관련한 다양한 질의에 대해서 빠르게 답변해 드립니다",
              questionList: [],
            },
            {
              id: "83e20630-46e2-45e9-8ee8-26396b98267b",
              order: "2",
              type: "chatCard",
              cardThumbnailUrl: "/oci/card_image2.png",
              name: "온보딩 AI",
              description:
                "신입사원을 위한 사내 다양한 프로세스 관한 질문을 시원하게 답변해드려요",
              questionList: [],
            },
            {
              id: "3",
              order: "3",
              type: "questionCard",
              cardThumbnailUrl: "",
              name: "자주하는 질문",
              description: "",
              questionList: [
                {
                  contents: "Q. 제공하는 언어모델 종류가 궁금해요",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. Agent 사용 시 차이가 어떤가요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
                {
                  contents: "Q. 내부문서를 업로드 할 수 있나요?",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. 대화 목록은 언제까지 저장되나요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
                {
                  contents: "Q. API 사용량이나 비용은 어디서 확인할 수 있나요?",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. 모델 응답 속도가 느려질 때 해결 방법이 있나요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
                {
                  contents: "Q. 보안 관련해서 어떤 인증 방식을 지원하나요?",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. 모바일 환경에서도 동일하게 사용할 수 있나요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
              ],
            },
          ],
          aiAgentButtonConfig: {
            startGradientColor: "#D0021B",
            endGradientColor: "#006400",
          },
          uploadFeatureConfig: {
            fileUploadUsage: "true",
            imageUploadUsage: "false",
          },
          expand: {},
        },
      },
    },
  };
}

function createKrcConfig(imageServerUrl) {
  return {
    status: 200,
    message: "success",
    data: {
      info: {
        common: {
          office: "KRC",
          imageServerUrl: imageServerUrl,
          faviconImageUrl: "/krc/favicon.png",
          opengraphImageUrl: "/krc/opengraph.png",
          opengraphDescription: `농어촌공사의 업무를 자동화하고 효율화하는 맞춤형 AI 솔루션입니다.`,
          logoImageUrl: "/krc/logo.png",
          mainColorHexCode: "#0E3192",
          mainHoverColorHexCode: "#E7EDFF",
          subColorHexCode: "#FF4E33",
          subHoverColorHexCode: "#999999",
        },
        login: {
          defaultProfileImageUrl: "/krc/default_profile.png",
          pannelImageUrl: "/krc/pannel.png",
        },
        main: {
          aiAgentCards: [
            {
              id: "94823b89-3d05-4657-ab7c-52e430748a24",
              order: "1",
              type: "chatCard",
              cardThumbnailUrl: "/krc/card_image1.png",
              name: "사규 AI",
              description:
                "사내규정에 기반하여 신속하고 정확한 답변을 제공하고 있습니다",
              questionList: [],
            },
            {
              id: "94823b89-3d05-4657-ab7c-52e430748a24",
              order: "2",
              type: "chatCard",
              cardThumbnailUrl: "/krc/card_image2.png",
              name: "온보딩 AI",
              description:
                "신입사원을 위한 사내 다양한 프로세스 관한 질문을 시원하게 답변해드려요",
              questionList: [],
            },
            {
              id: "94823b89-3d05-4657-ab7c-52e430748a24",
              order: "3",
              type: "questionCard",
              cardThumbnailUrl: "",
              name: "자주하는 질문",
              description: "",
              questionList: [
                {
                  contents: "Q. 제공하는 언어모델 종류가 궁금해요",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. Agent 사용 시 차이가 어떤가요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
                {
                  contents: "Q. 내부문서를 업로드 할 수 있나요?",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. 대화 목록은 언제까지 저장되나요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
                {
                  contents: "Q. API 사용량이나 비용은 어디서 확인할 수 있나요?",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. 모델 응답 속도가 느려질 때 해결 방법이 있나요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
                {
                  contents: "Q. 보안 관련해서 어떤 인증 방식을 지원하나요?",
                  id: "5a7e3de0-4e2b-4694-a25f-cf4f8134df10",
                },
                {
                  contents: "Q. 모바일 환경에서도 동일하게 사용할 수 있나요?",
                  id: "83e20630-46e2-45e9-8ee8-26396b98267b",
                },
              ],
            },
          ],
          aiAgentButtonConfig: {
            startGradientColor: "#0E3192",
            endGradientColor: "#006400",
          },
          uploadFeatureConfig: {
            fileUploadUsage: "true",
            imageUploadUsage: "false",
          },
          expand: {},
        },
      },
    },
  };
}

function createKomscoConfig(imageServerUrl) {
  return {
    status: 200,
    message: "success",
    data: {
      info: {
        common: {
          office: "KOMSCO",
          imageServerUrl: imageServerUrl,
          faviconImageUrl: "/komsco/favicon.png",
          opengraphImageUrl: "/komsco/opengraph.png",
          opengraphDescription: `조폐공사의 예산·감사·특허·자료 분석 업무를 자동화하고 효율화하는 맞춤형 AI 솔루션입니다.`,
          logoImageUrl: "/komsco/logo.png",
          mainColorHexCode: "#2384C6",
          mainHoverColorHexCode: "#E6EEF5",
          subColorHexCode: "#545454",
          subHoverColorHexCode: "#999999",
        },
        login: {
          defaultProfileImageUrl: "/komsco/default_profile.png",
          pannelImageUrl: "/komsco/pannel.png",
        },
        main: {
          aiAgentCards: [
            {
              id: "82e150a3-b72b-4a46-bdf5-b60b836bc9eb",
              order: "1",
              type: "chatCard",
              cardThumbnailUrl: "/komsco/card_image1.png",
              name: "사규AI",
              description:
                "사내규정에 기반하여 신속하고 정확한 답변을 제공하고 있습니다",
              questionList: [],
            },
            {
              id: "93953f43-47e6-41b4-b147-5281269aa0b4",
              order: "2",
              type: "chatCard",
              cardThumbnailUrl: "/komsco/card_image2.png",
              name: "온보딩AI",
              description:
                "국정감사 관련한 다양한 질의에 대해서 빠르게 답변해 드립니다",
              questionList: [],
            },
            {
              id: "3",
              order: "3",
              type: "questionCard",
              cardThumbnailUrl: "",
              name: "자주하는 질문",
              description: "",
              questionList: [
                {
                  contents: "Q. 제공하는 언어모델 종류가 궁금해요",
                  id: "93953f43-47e6-41b4-b147-5281269aa0b4",
                },
                {
                  contents: "Q. Agent 사용 시 차이가 어떤가요?",
                  id: "93953f43-47e6-41b4-b147-5281269aa0b4",
                },
                {
                  contents: "Q. 내부문서를 업로드 할 수 있나요?",
                  id: "82e150a3-b72b-4a46-bdf5-b60b836bc9eb",
                },
                {
                  contents: "Q. 대화 목록은 언제까지 저장되나요?",
                  id: "82e150a3-b72b-4a46-bdf5-b60b836bc9eb",
                },
                {
                  contents: "Q. API 사용량이나 비용은 어디서 확인할 수 있나요?",
                  id: "82e150a3-b72b-4a46-bdf5-b60b836bc9eb",
                },
                {
                  contents: "Q. 모델 응답 속도가 느려질 때 해결 방법이 있나요?",
                  id: "82e150a3-b72b-4a46-bdf5-b60b836bc9eb",
                },
                {
                  contents: "Q. 보안 관련해서 어떤 인증 방식을 지원하나요?",
                  id: "82e150a3-b72b-4a46-bdf5-b60b836bc9eb",
                },
                {
                  contents: "Q. 모바일 환경에서도 동일하게 사용할 수 있나요?",
                  id: "82e150a3-b72b-4a46-bdf5-b60b836bc9eb",
                },
              ],
            },
          ],
          aiAgentButtonConfig: {
            startGradientColor: "#D0021B",
            endGradientColor: "#006400",
          },
          uploadFeatureConfig: {
            fileUploadUsage: "true",
            imageUploadUsage: "false",
          },
          expand: {
            expandBannerPannelImageUrl:
              "/komsco/expand/expand-banner-pannel.png",
            expandBannerPannelBackgroundImageUrl:
              "/komsco/expand/expand-banner-pannel-background.png",
            aiAgentCards: [
              {
                id: "bdac852c-93c2-48dd-9113-db7d18537a90",
                order: "1",
                type: "serviceCard",
                cardThumbnailUrl: "/komsco/expand/service/service_icon1.png",
                name: "문서생성",
                description: "문서생성",
                questionList: [],
                welcomeSnippet:
                  "국정감사 관한 문의사항이 있다면 질문을 입력해주세요.\n 국정감사 과정에서 자주 제기되는 이슈와 쟁점에 대해 기존 축적된 FAQ를 바탕으로 설명해 드립니다.\n- 국정감사 담당 분야별 담당자 정보- 국정감사 대응을 위한 내부 계획 수립 정보\n- 특정 주제에 대한 이전 유사 질의 및 답변 분석 정보",
              },
              {
                id: "ac80a71a-6535-4404-bf75-ef62aa949ee7",
                order: "2",
                type: "serviceCard",
                cardThumbnailUrl: "/komsco/expand/service/service_icon2.png",
                name: "문서탐색",
                description: "문서탐색",
                questionList: [],
                welcomeSnippet:
                  "국정감사를 위한 문서 탐색을 도와드리겠습니다.\n 조폐공사에 축적된 문서를 기반으로 관련 자료를 찾아 정리해 드립니다.\n- 특정 국회의원에게 제출한 답변서 목록\n- 특정 이슈(예: 모바일 신분증, 전자여권 등)에 대한 과거 답변 문서\n- 국정감사 지적사항 및 조치결과 내용\n",
              },
              {
                id: "b0c893ad-5045-462f-a795-0e06adbc6097",
                order: "3",
                type: "serviceCard",
                cardThumbnailUrl: "/komsco/expand/service/service_icon3.png",
                name: "FAQ",
                description: "FAQ",
                questionList: [],
                welcomeSnippet:
                  "국정감사 관한 문의사항이 있다면 질문을 입력해주세요.\n국정감사 과정에서 자주 제기되는 이슈와 쟁점에 대해\n기존 축적된 FAQ를 바탕으로 설명해 드립니다.\n- 국정감사 담당 분야별 담당자 정보\n - 국정감사 대응을 위한 내부 계획 수립 정보\n- 특정 주제에 대한 이전 유사 질의 및 답변 분석 정보\n",
              },
              {
                id: "ac80a71a-6535-4404-bf75-ef62aa949ee7",
                order: "4",
                type: "serviceCard",
                cardThumbnailUrl: "/komsco/expand/service/service_icon4.png",
                name: "국회의원정보",
                description: "국회의원정보",
                questionList: [],
                welcomeSnippet:
                  "국정감사 관한 문의사항이 있다면 질문을 입력해주세요.",
              },
            ],
            questionAndAnswer: {},
          },
        },
      },
    },
  };
}
