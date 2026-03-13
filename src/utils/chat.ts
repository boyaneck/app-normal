export const option_data = [
  {
    id: "opt1",
    reason: "원치 않는 상업성 콘텐츠 또는 스팸",
  },
  { id: "opt2", reason: "증오심 표현 또는 노골적인 폭력" },
  { id: "opt3", reason: "테러 조장" },
  { id: "opt4", reason: "괴롭힘 또는 폭력" },
  { id: "opt5", reason: "자살 또는 자해" },
  { id: "opt6", reason: "잘못된 정보" },
  { id: "opt7", reason: "음란물" },
];
export const sanction_duration = ["60분", "12시간", "24시간", "7일", "30일"];
export const max_messages = 11;

// export const FIXED_HEIGHT_PX = 95; // 1.5줄 높이 (약 40px)
export const FIXED_HEIGHT_PX = 35; // 1.5줄 높이 (약 40px)
export const LIMIT_HEIGHT_PX = 36;
export const LINE_HEIGHT_PX = 26; // 실제 한 줄의 높이 (leading-6을 고려하여 설정)
export const INPUT_AREA_HEIGHT_BUFFER = 40; // 입력창 영역 확보를 위한 카드 하단 여백 (px)
export const TRANSITION_DURATION_MS = 700; // 부드러움을 위해 700ms로 설정 (Tailwind duration-700)
export const scroll_fading = `
    /* Custom Scrollbar Styles: 스크롤바 숨김 적용 */
    .custom-scrollbar::-webkit-scrollbar {
        width: 0px; /* Chrome, Safari, Edge에서 세로 스크롤바 숨김 */
        height: 0px; /* Chrome, Safari, Edge에서 가로 스크롤바 숨김 */
    }
    .custom-scrollbar {
        -ms-overflow-style: none; /* IE 및 Edge에서 스크롤바 숨김 */
        scrollbar-width: none; /* Firefox에서 스크롤바 숨김 */
    }

    /* 페이딩 마스크 스타일 (텍스트 자체를 흐리게 함) */
    .top-fade-mask-active {
        /* 상단 0px은 투명, 20px까지는 불투명(black)으로 전환되어 텍스트가 서서히 나타나는 효과 */
        -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black ${
          LINE_HEIGHT_PX - 5
        }px);
        mask-image: linear-gradient(to bottom, transparent 0%, black ${
          LINE_HEIGHT_PX - 5
        }px);
    }
`;
