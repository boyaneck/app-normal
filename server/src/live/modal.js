import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
// ... existing imports ...
import { AnimatePresence } from "framer-motion";

interface Props {
  current_host_nickname: string;
  current_host_id: string;
}

const ChatRoom = ({ current_host_nickname, current_host_id }: Props) => {
  console.log("현재 스트리머의 아이디 인데 ???", current_host_id);
  // ... existing code ...
  const [hearts, set_hearts] = useState<heart[]>([]); // 하트 목록 상태

  const [selected_option, set_selected_option] = useState<string | null>(null);
  const [option_is_selected, set_option_is_selected] = useState(false);
  const [selected_warning_reason, set_selected_warning_reason] = useState<
    string | null
  >(null);
  const [selected_message_for_modal, set_selected_message_for_modal] =
    useState<remove_message_props | null>(null);
  const [is_modal_open, set_is_modal_open] = useState(false);
  
  // ... existing handler functions (onHandlerSelectOption, useEffect for socket, etc.) ...

  // ... existing heartClick, heartAnimationEnd, message remove useEffect ...

  // ... existing warning option logic ...

  const [is_chat_active, set_is_chat_active] = useState(false); // 사라지는 중인지 상태
  
  // ... existing useEffect for icon ...

  const [is_pm_modal_open, set_is_pm_modal_open] = useState<boolean>(false);
  
  // [수정 1] HTMLElement 타입을 HTMLDivElement로 구체화 (ref와 일치시킴)
  const [id_target, set_id_target] = useState<HTMLDivElement | null>(null);
  const [money_amount, set_money_amount] = useState("");

  const [ref_target, set_ref_target] = useState<HTMLDivElement | null>(null);
  const paymentRef = useRef<HTMLDivElement | null>(null);

  // [수정 2] useLayoutEffect 삭제 및 useEffect로 대체
  // document.getElementById를 쓰지 않고, useRef를 통해 직접 렌더링된 요소에 접근합니다.
  useEffect(() => {
    if (paymentRef.current) {
      set_id_target(paymentRef.current);
    }
  }, []); // 마운트 시 한 번 실행되어 ref를 state에 담음

  // if (!id_target) return null; // [수정 3] 이 부분이 있으면 초기 렌더링 때 컴포넌트 전체가 안 보일 수 있으므로 제거하거나 portal 부분만 조건부 렌더링 해야 함.
  // 여기서는 아래 return 문에서 {id_target && createPortal...} 로 처리하므로 이 줄은 삭제하는 것이 좋습니다.

  console.log("왜 fasle 가 안ㄷ욈 >", is_pm_modal_open);
  
  return (
    <div
      className={clsx(
        `grid grid-rows-10
          w-full h-full
          rounded-xl
          overflow-hidden 
          `
      )}
    >
      <div
        className=" row-span-9 flex flex-col-reverse "
        id={"payment-modal-target"} // ID는 유지해도 되지만, 로직상 ref가 우선됨
        ref={paymentRef} // [중요] 이 ref가 가리키는 div가 포탈의 목적지가 됨
      >
        {/* --채팅메세지 */}
        <div className="">
          {receive_message_info.map((message_info) => {
            // ... existing message mapping code ...
            const isRemoving = message_remove === message_info;
            return (
              <AnimatedMessage
                key={message_info.id}
                message={`${message_info.user_nickname}: ${message_info.message}`}
                is_visible={isRemoving}
                avatar_url={message_info.avatar_url}
                user_nickname={message_info.user_nickname}
                user_id={message_info.id}
                user_email={message_info.email}
                selected_message_for_modal={selected_message_for_modal}
                set_selected_message_for_modal={set_selected_message_for_modal}
                is_modal_open={is_modal_open}
                set_is_modal_open={set_is_modal_open}
              />
            );
          })}
        </div>
        {/* --채팅메세지 */}
        {is_modal_open && (
          // ... existing ChatSanction code ...
          <ChatSanction
            set_is_modal_open={set_is_modal_open}
            is_modal_open={is_modal_open}
            set_selected_message_for_modal={set_selected_message_for_modal}
            selected_message_for_modal={selected_message_for_modal}
            selectWarningOption={selectWarningOption}
            set_selected_warning_reason={set_selected_warning_reason}
            selected_warning_reason={selected_warning_reason}
          />
        )}
        {/* <div className=" absolute top-2 z-10  bg-red-400 border rounded-xl border-black w-4/5 h-10 flex items-center left-1/2 -translate-x-1/2 "></div> */}
      </div>

      <div className="border row-span-1  border-black grid grid-cols-[80%_10%_10%] items-center ">
        <ChatInput current_host_id={current_host_id} />
        <div>d</div>
        <button className="" onClick={() => set_is_pm_modal_open(true)}>
          돈
        </button>

        {/* [수정 4] id_target이 존재할 때만 Portal 생성 (useEffect 실행 후) */}
        {id_target &&
          createPortal(
            <PaymentPage
              set_is_pm_modal_open={set_is_pm_modal_open}
              is_pm_modal_open={is_pm_modal_open}
              current_host_nickname={current_host_nickname}
              current_host_id={current_host_id}
            />,
            id_target
          )}
      </div>
    </div>
  );
};
export default ChatRoom;