import React, { useCallback, useRef, useState, useEffect } from "react";
import { Smile, DollarSign } from "lucide-react";

// ----------------------------------------------------
// 0. Dynamic Component: Floating Reaction Animation
// ----------------------------------------------------

/**
 * 선택된 이모지가 버튼 주변에서 튀어 올랐다가 사라지는 동적 효과를 구현합니다.
 * @param {string} emoji - 표시할 이모지 문자열
 * @param {number} id - 고유 ID (애니메이션 종료 후 제거용)
 * @param {function} onAnimationEnd - 애니메이션 종료 시 호출될 콜백 함수
 * @param {object} style - 인라인 스타일 (위치 조정 및 CSS 변수 전달용)
 */
const FloatingReaction = ({ emoji, id, onAnimationEnd, style }) => {
  // 애니메이션 지속 시간 (CSS @keyframes와 일치)
  const ANIMATION_DURATION = 1200;

  // 애니메이션 종료 시 부모 컴포넌트에 알림 (배열에서 제거)
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd(id);
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [id, onAnimationEnd]);

  // Tailwind CSS와 인라인 스타일을 사용하여 복잡한 애니메이션을 구현합니다.
  return (
    <div
      className="absolute text-3xl pointer-events-none"
      style={{
        ...style, // 부모로부터 전달받은 위치 및 CSS 변수 스타일 적용
        animation: `float-and-fade ${
          ANIMATION_DURATION / 1000
        }s ease-out forwards`,
      }}
    >
      {emoji}
    </div>
  );
};

// ----------------------------------------------------
// 1. Core Logic Hook: 이모지 상태 및 동적 효과 관리
// ----------------------------------------------------

const useEmojiControl = () => {
  const [showEmojiPicker, set_show_emoji_picker] = useState(false);
  const [lastSelectedEmoji, set_last_selected_emoji] = useState("👋"); // 마지막 선택 이모지
  const [floatingEmojis, set_floating_emojis] = useState([]); // 동적 효과를 위한 배열
  const pickerRef = useRef(null);

  // 동적 효과 배열에서 이모지를 제거하는 핸들러
  const removeFloatingEmoji = useCallback((id) => {
    set_floating_emojis((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // 이모지 선택 핸들러 (선택된 이모지를 콘솔에 출력하고 동적 효과를 추가)
  const handleEmojiSelect = useCallback((emoji) => {
    console.log("선택된 이모지:", emoji);
    set_last_selected_emoji(emoji);

    // 동적 효과를 위한 새 이모지 추가
    const newReaction = {
      id: Date.now(), // 고유 ID
      emoji: emoji,
      // 랜덤한 수평 위치를 위해 -20px ~ +20px 범위의 랜덤 값 추가
      offsetX: Math.floor(Math.random() * 41) - 20,
    };

    // 배열에 추가하고 최대 5개까지만 유지 (너무 많이 쌓이는 것 방지)
    set_floating_emojis((prev) => [newReaction, ...prev.slice(0, 4)]);
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    set_show_emoji_picker((prev) => !prev);
  }, []);

  // 외부 클릭 감지 로직 (피커 외부 클릭 시 닫기)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        showEmojiPicker
      ) {
        const button = document.getElementById("emoji-button");
        if (button && !button.contains(event.target)) {
          set_show_emoji_picker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return {
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect,
    pickerRef,
    lastSelectedEmoji,
    floatingEmojis,
    removeFloatingEmoji,
  };
};

// ----------------------------------------------------
// 2. Component: Web Component 기반 이모지 피커
// ----------------------------------------------------

const WebComponentEmojiPicker = React.forwardRef(({ onEmojiSelect }, ref) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // 이모지 피커 웹 컴포넌트 동적 로드 (단 한 번만 실행)
    if (!document.getElementById("emoji-picker-script")) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/emoji-picker-element@1.21.3/index.js";
      script.type = "module";
      script.id = "emoji-picker-script";
      document.head.appendChild(script);
    }

    const pickerContainer = containerRef.current;
    if (!pickerContainer) return;

    let picker = pickerContainer.querySelector("emoji-picker");

    if (!picker) {
      picker = document.createElement("emoji-picker");
      picker.setAttribute("auto-focus-search", "false");
      picker.setAttribute("theme", "light");
      picker.setAttribute("custom-element-style", "true");
      picker.classList.add("custom-picker-stylish");

      const handler = (e) => {
        onEmojiSelect(e.detail.unicode);
      };

      picker.addEventListener("emoji-click", handler);
      pickerContainer.appendChild(picker);

      return () => {
        picker.removeEventListener("emoji-click", handler);
      };
    }
  }, [onEmojiSelect]);

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (ref) ref.current = node;
      }}
      // 피커의 크기 (Modern Look: 350px x 450px)
      className="w-[350px] h-[450px] overflow-hidden"
    />
  );
});

// ----------------------------------------------------
// 3. Emoji Button and Picker Component (사용자 정의 Div)
// ----------------------------------------------------

const EmojiControl = ({ state, handlers }) => {
  const { showEmojiPicker, pickerRef, lastSelectedEmoji, floatingEmojis } =
    state;
  const { toggleEmojiPicker, handleEmojiSelect, removeFloatingEmoji } =
    handlers;

  return (
    // ✅ 커스터마이징 포인트 1: 이모지 버튼 컨테이너 (relative 필수)
    <div className="relative p-4 border-4 border-indigo-300 rounded-xl bg-indigo-50 flex-grow min-h-[200px]">
      <h3 className="text-xl font-bold mb-4 text-indigo-800">
        1. 이모지 버튼 & 동적 반응 영역
      </h3>

      {/* 이모지 버튼 및 동적 반응의 기준점 (relative inline-block) */}
      <div id="emoji-button-anchor" className="relative inline-block">
        {/* 이모지 버튼 */}
        <button
          id="emoji-button"
          onClick={toggleEmojiPicker}
          className={`
                        p-3
                        ${
                          showEmojiPicker
                            ? "bg-indigo-600 text-white shadow-xl"
                            : "bg-gray-200 text-gray-700"
                        }
                        rounded-full 
                        hover:bg-indigo-500 hover:text-white
                        transition duration-150 
                        shadow-lg
                        focus:outline-none focus:ring-4 focus:ring-indigo-300
                        flex items-center justify-center
                    `}
          title="이모지 선택"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* ✅ 동적 반응 영역: Floating Reactions */}
        {/* 버튼 위에 겹쳐서 시작하도록 위치 조정 (absolute) */}
        {floatingEmojis.map((reaction) => (
          <FloatingReaction
            key={reaction.id}
            id={reaction.id}
            emoji={reaction.emoji}
            onAnimationEnd={removeFloatingEmoji}
            // 버튼의 중앙 상단에 위치하도록 스타일 조정
            style={{
              // 버튼 컨테이너(relative)의 중앙 상단으로 위치 이동
              left: "50%",
              bottom: "100%",
              // 랜덤 수평 이동을 CSS 변수로 전달하고, X축 중앙 정렬
              "--reaction-offset-x": `${reaction.offsetX}px`,
              transform: `translateX(-50%)`,
            }}
          />
        ))}
      </div>

      <p className="mt-4 text-sm text-indigo-700">
        마지막 선택 이모지:
        <span className="text-3xl align-middle ml-2">{lastSelectedEmoji}</span>
      </p>

      {/* 💡 커스터마이징 포인트 2: 이모지 피커 팝업 (전개 방식 및 Ref) */}
      {showEmojiPicker && (
        <div
          id="emoji-picker-container"
          // absolute 위치를 사용하여 EmojiControl Div를 기준으로 배치
          className="absolute z-50 top-full right-4 mt-2"
          ref={pickerRef} // 외부 클릭 감지를 위한 Ref
        >
          <WebComponentEmojiPicker
            onEmojiSelect={handleEmojiSelect}
            ref={pickerRef}
          />
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 4. Main App Component
// ----------------------------------------------------

const App = () => {
  // 이모지 로직만 포함하는 훅
  const logic = useEmojiControl();

  // 상태와 핸들러를 분리하여 각 컴포넌트에 전달
  const emojiHandlers = {
    toggleEmojiPicker: logic.toggleEmojiPicker,
    handleEmojiSelect: logic.handleEmojiSelect,
    removeFloatingEmoji: logic.removeFloatingEmoji,
  };

  const emojiState = {
    showEmojiPicker: logic.showEmojiPicker,
    pickerRef: logic.pickerRef, // Ref 추가 전달
    lastSelectedEmoji: logic.lastSelectedEmoji,
    floatingEmojis: logic.floatingEmojis,
  };

  // PaymentPage의 더미 Props
  const current_host_id = "host-123";
  const current_host_nickname = "Host_User";

  return (
    <div className="min-h-screen p-4 bg-gray-100 flex items-start justify-center w-full">
      <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-3">
          실제 라이브러리 기반 이모지 피커 예시 (동적 반응 추가)
        </h1>

        {/* 사용자 요청에 기반한 컨테이너 (70% 이모지, 30% 결제) */}
        <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-4 items-start">
          {/* 1열 (70%): 이모지 컨트롤 */}
          <EmojiControl state={emojiState} handlers={emojiHandlers} />

          {/* 2열 (30%): PaymentPage */}
          <PaymentPage
            current_host_nickname={current_host_nickname}
            current_host_id={current_host_id}
          />
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg text-base text-green-800 border-l-4 border-green-400">
          <p>
            <strong>✅ 동적 반응 기능 추가 완료:</strong> 이모지를 선택하면 버튼
            위로 이모지가 튀어 오르는 동적인 효과를 볼 수 있습니다.
          </p>
          <p className="mt-1 font-semibold">
            *피커를 열고 이모지를 여러 번 선택하여 동적 효과를 확인해 보세요.
          </p>
        </div>
      </div>

      {/* 글로벌 CSS (이모지 피커 커스터마이징 및 애니메이션) */}
      <style jsx global>{`
        /* -------------------------------------- */
        /* 1. 이모지 피커 (Web Component) 스타일링 */
        /* -------------------------------------- */
        emoji-picker.custom-picker-stylish {
          /* 배경 및 경계선 */
          --epr-bg-color: #ffffff;
          --epr-picker-border-radius: 16px;
          --epr-picker-border: none;
          --epr-picker-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

          /* 카테고리 탭 영역 */
          --epr-header-height: 52px;
          --epr-category-label-bg-color: #ffffff;
          --epr-active-category-indicator-color: #4f46e5;
          --epr-category-icon-size: 20px;
          --epr-category-icon-color: #6b7280;

          /* 검색 영역 */
          --epr-search-input-bg-color: #f4f4f5;
          --epr-search-input-border-radius: 8px;

          /* 이모지 및 포커스 */
          --epr-focus-bg-color: #e0e7ff;
          --epr-emoji-padding: 6px;
          --epr-emoji-size: 26px;
          --epr-text-color: #1f2937;
          --epr-scrollbar-color: #9ca3af;
          --epr-footer-height: 0;
        }

        /* -------------------------------------- */
        /* 2. 동적 반응 애니메이션 (FloatingReaction) */
        /* -------------------------------------- */
        @keyframes float-and-fade {
          0% {
            opacity: 1;
            /* 버튼을 기준으로 아래쪽에서 위로 살짝 이동 */
            transform: translateY(0) scale(0.8)
              translateX(var(--reaction-offset-x, 0));
          }
          20% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1)
              translateX(var(--reaction-offset-x, 0));
          }
          80% {
            opacity: 0.8;
            transform: translateY(-80px) scale(1.1)
              translateX(var(--reaction-offset-x, 0));
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.9)
              translateX(var(--reaction-offset-x, 0));
          }
        }
      `}</style>
    </div>
  );
};

// 더미 PaymentPage 컴포넌트
const PaymentPage = ({ current_host_nickname, current_host_id }) => (
  <div className="p-4 bg-gray-100 rounded-xl shadow-inner border border-gray-200 h-full min-h-[150px] flex flex-col justify-center items-center">
    <DollarSign className="w-8 h-8 text-green-600 mb-2" />
    <p className="text-sm font-semibold text-gray-700">결제 영역</p>
    <p className="text-xs text-gray-500 mt-1">
      호스트: {current_host_nickname} ({current_host_id})
    </p>
  </div>
);

export default App;
