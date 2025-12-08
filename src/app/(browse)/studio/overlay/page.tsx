"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

// --- Simulated Mock Data ---
// 모의 채팅 메시지 데이터
const MOCK_MESSAGES = [
  {
    username: "시청자1",
    content: "스트리밍 너무 재미있어요! 응원합니다!",
    role: "user",
  },
  {
    username: "시청자2",
    content: "오늘 게임 플레이 정말 멋졌어요!",
    role: "user",
  },
  {
    username: "관리자",
    content: "감사합니다! 모두 즐거운 시간 보내세요!",
    role: "bot",
  },
  { username: "시청자3", content: "다음 게임은 뭐예요?", role: "user" },
];

// 모의 후원 알림 데이터
const MOCK_ALERTS = [
  { user: "골든스폰서", amount: "₩100,000", message: "힘내세요 스트리머님!" },
  {
    user: "응원팬",
    amount: "₩5,000",
    message: "소소하지만 큰 힘이 되길 바라요.",
  },
];

// 상수 정의
const MAX_CHAT_MESSAGES = 10;
const ALERT_DISPLAY_DURATION_MS = 7000;
const CHAT_INJECTION_INTERVAL_MS = 3000;

// 초기 위치 계산: 화면의 좌측 하단 (초기 X: 20px, 초기 Y: 화면 높이에서 오버레이 높이(500px)를 뺀 값 + 20px)
const initialChatY = Math.max(20, window.innerHeight - 500 - 20);

// --- 3. 렌더링 도우미 컴포넌트 ---

// 개별 채팅 메시지 컴포넌트
const ChatMessageItem = React.memo(({ message }: { message: any }) => {
  const isBot = message.role === "bot";
  const name = isBot ? "Gemini 봇" : message.username || "시청자";
  const nameColor = isBot ? "text-green-400" : "text-indigo-400";

  return (
    <div className="chat-message bg-black/60 text-white p-2 rounded-lg mt-1 animate-fadeIn">
      <span className={`font-extrabold mr-2 ${nameColor}`}>{name}</span>
      <span>{message.content}</span>
    </div>
  );
});

// 개별 후원 알림 컴포넌트
const DonationAlertItem = React.memo(({ alert }: { alert: any }) => {
  if (alert.type !== "donation") return null;

  const alertMessage = `${alert.user} 님이 ${alert.amount}를 후원했습니다!`;

  return (
    <div
      key={alert.id}
      className="donation-alert bg-orange-600/95 text-white p-4 rounded-xl shadow-2xl text-2xl font-extrabold text-center mb-4 transition-all duration-500 ease-out animate-popIn"
      style={{
        background: "linear-gradient(135deg, #f97316, #ea580c)",
        animationDuration: "0.7s",
      }}
    >
      <div>
        <span className="text-yellow-300">🎉 {alertMessage}</span>
      </div>
      {alert.message && (
        <div className="text-lg font-medium mt-1 italic opacity-90">
          "{alert.message}"
        </div>
      )}
    </div>
  );
});

// Main OverlayPagelication Component
const OverlayPage = () => {
  // 앱 상태 관리
  const [chatMessages, setChatMessages] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const alertIdRef = useRef(0);
  const chatIdRef = useRef(0);
  const [isLocked, setIsLocked] = useState(false); // true일 때 OBS 오버레이처럼 클릭 관통
  const [isDragging, setIsDragging] = useState(false);
  // 초기 위치: window.innerHeight를 사용하여 반응적으로 계산
  const [chatPosition, setChatPosition] = useState({ x: 20, y: initialChatY });
  const dragStartRef = useRef({ x: 0, y: 0 }); // 드래그 시작 시 마우스 위치

  // --- 알림 로직 ---
  const handleNewAlert = useCallback((alert: any) => {
    setActiveAlerts((prev) => [...prev, alert]);
    setTimeout(() => {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    }, ALERT_DISPLAY_DURATION_MS);
  }, []);

  // --- 드래그 앤 드롭 로직 ---
  // 드래그 시작 핸들러
  const handleMouseDown = (e: any) => {
    // 'locked' 상태이거나, 마우스 왼쪽 버튼(0)이 아니면 무시
    if (isLocked || e.button !== 0) return;

    setIsDragging(true);
    // 드래그 시작 시 커서와 엘리먼트 위치의 차이를 저장
    dragStartRef.current = {
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y,
    };
    // 텍스트 선택 방지
    document.body.classList.add("no-select");
  };

  // 드래그 이동 및 종료 핸들러 등록
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: any) => {
      // 위치 업데이트
      setChatPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.classList.remove("no-select");
    };

    // 전역 이벤트 리스너 등록
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      // 클린업: 이벤트 리스너 제거
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("no-select");
    };
  }, [isDragging]);

  // --- 2. 모의 데이터 시뮬레이션 (useEffect) ---
  useEffect(() => {
    const injectMockChat = () => {
      const nextIndex = chatIdRef.current % MOCK_MESSAGES.length;
      const mockData = MOCK_MESSAGES[nextIndex];

      const newMsg = {
        id: `chat-${chatIdRef.current++}`,
        timestamp: Date.now(),
        username: mockData.username || "익명시청자",
        content: mockData.content || "채팅 메시지입니다.",
        role: mockData.role || "user",
      };

      setChatMessages((prev) => {
        const updated = [...prev, newMsg];
        // MAX_CHAT_MESSAGES를 초과하지 않도록 슬라이스
        return updated.slice(Math.max(updated.length - MAX_CHAT_MESSAGES, 0));
      });
    };

    const injectMockAlert = () => {
      const nextIndex = alertIdRef.current % MOCK_ALERTS.length;
      const mockData = MOCK_ALERTS[nextIndex];

      const newAlert = {
        id: `alert-${alertIdRef.current++}`,
        timestamp: Date.now(),
        type: "donation",
        user: mockData.user || "새로운 후원자",
        amount: mockData.amount || "₩1,000",
        message: mockData.message || "",
      };
      handleNewAlert(newAlert);
    };

    // 초기 메시지 주입
    injectMockChat();
    injectMockChat();

    const chatInterval = setInterval(
      injectMockChat,
      CHAT_INJECTION_INTERVAL_MS
    );
    const alertInterval = setInterval(injectMockAlert, 10000); // 10초마다 알림

    return () => {
      // 클린업
      clearInterval(chatInterval);
      clearInterval(alertInterval);
    };
  }, [handleNewAlert]);

  // --- 4. 최종 렌더링 ---
  return (
    <div className="w-screen h-screen relative font-['Inter'] overflow-hidden">
      {/* 표준 <style> 태그를 사용하여 전역 스타일 및 애니메이션 정의 */}
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap');
                
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: transparent; /* OBS 투명화 핵심 */
                    overflow: hidden;
                    margin: 0;
                    padding: 0;
                }

                /* 드래그 가능 상태일 때 커서 변경 */
                .draggable:hover {
                    cursor: grab;
                }
                .draggable.is-dragging {
                    cursor: grabbing;
                }
                /* 드래그 중 텍스트 선택 방지 */
                .no-select {
                    user-select: none;
                }

                /* 애니메이션 키프레임 */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.5); }
                    80% { opacity: 1; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-popIn {
                    animation: popIn 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55);
                }
            `}</style>

      {/* 위치 잠금/해제 버튼 (이 버튼은 드래그가 안되어야 하므로 pointer-events-auto 유지) 
                OBS 소스 화면에서만 표시되며, 실제 방송 화면에서는 숨겨지거나,
                스트리머가 OBS에서 이 버튼을 클릭하기 위해 '소스와 상호작용' 기능을 사용해야 합니다.
                실제 오버레이 모드에서는 OBS '소스와 상호작용'을 사용하지 않으면 클릭 불가능합니다.
                
                이 버튼은 OBS 소스 화면에서만 보이고, '잠김' 상태로 설정 후에는 OBS '소스와 상호작용'을 꺼서
                마우스가 방송 화면을 관통하도록 사용합니다.
            */}
      <button
        onClick={() => setIsLocked(!isLocked)}
        className={`absolute top-5 right-5 p-2 px-4 rounded-full shadow-lg text-sm font-semibold transition-colors duration-200 z-50 
                    ${
                      isLocked
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
      >
        {isLocked
          ? "🔒 잠김 (방송 모드: 클릭 관통)"
          : "🔓 해제 (드래그 모드: 설정 중)"}
      </button>

      {/* 1. 드래그 가능한 채팅 오버레이 영역 */}
      <div
        className={`absolute w-80 max-h-[500px] flex flex-col-reverse overflow-hidden transition-shadow duration-200 z-40
                    ${
                      isLocked
                        ? "pointer-events-none"
                        : "draggable pointer-events-auto shadow-xl border-4 border-dashed border-red-500/50"
                    }
                    ${isDragging ? "is-dragging no-select" : ""}
                `}
        style={{
          top: `${chatPosition.y}px`,
          left: `${chatPosition.x}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* 드래그 핸들 (설정 모드일 때만 표시) */}
        {!isLocked && (
          <div className="absolute -top-6 left-0 right-0 h-6 bg-red-500/70 text-white text-xs font-bold text-center pt-0.5 cursor-grab rounded-t">
            여기를 드래그하여 채팅창 이동 (설정 중)
          </div>
        )}

        {/* 채팅 메시지 목록 - 드래그 활성화를 위해 reverse로 변경 */}
        <div className="flex flex-col-reverse p-2">
          {chatMessages.map((msg, index) => (
            <ChatMessageItem key={msg.id + index} message={msg} />
          ))}
        </div>
      </div>

      {/* 2. 후원 알림 팝업 영역 (상단 중앙) */}
      <div
        id="alert-container"
        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-[600px] pointer-events-none z-30"
      >
        {/* 알림은 항상 최신 하나만 보여줍니다. */}
        {activeAlerts.slice(-1).map((alert) => (
          <DonationAlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};

export default OverlayPage;
