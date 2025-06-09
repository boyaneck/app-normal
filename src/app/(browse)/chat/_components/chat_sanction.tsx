import { chat_sanction_component_props } from "@/types/chat";
import { option_data, option_duration } from "@/utils/chat";
import axios from "axios";
import clsx from "clsx";
import React from "react";

const ChatSanction = ({
  set_is_modal_open,
  is_modal_open,
  set_selected_message_for_modal,
  selected_message_for_modal,
  selectWarningOption,
  set_selected_warning_reason,
  selected_warning_reason,
}: chat_sanction_component_props) => {
  const sendSanctionInfo = async () => {
    alert("전송");
    //HTTP POST 로 보내기기
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SANCTION_USER_API_URL as string,
        selected_message_for_modal()
      );
      console.log("채팅 정지 관련 post", response);
    } catch (error) {}
  };

  return (
    <>
      <div className="bg-white-300 absolute top-3  w-4/5 h-4/ ">
        <button
          className="absolute top-1 right-1 text-gray-500  "
          onClick={() => {
            set_is_modal_open(false);
          }}
        >
          (x)
        </button>

        <span className="w-10 h-10 rounded-full border border-black">
          이미지
        </span>
        <span>ID:{selected_message_for_modal?.user_nickname} </span>
        <div className=" ">{selected_message_for_modal?.message}</div>
        <div className="space-y-2">
          {option_data.map((option) => (
            <>
              <div
                onClick={() => {
                  selectWarningOption(option.reason);
                  set_selected_message_for_modal((prev) => {
                    if (prev === null) {
                      return null;
                    }
                    const current = prev;
                    return {
                      ...current,
                      reason: option.reason,
                    };
                  });
                }}
                key={option.id}
                className={clsx(
                  `
                       rounded-lg 
                     bg-white 
                       cursor-pointer 
                       transfrom transition-all duration-300 ease-in-out 
                       `,
                  {
                    "absolute top-12 left-6 -translate x-2/4 translate-y-1/2 z-20 min-w-[250px] p-6 rounded-xl text-center shadow-2xl  cursor-pointer text-base font-semibold opacity-100":
                      selected_warning_reason === option.reason,
                    " pacity-0 max-h-0 -translate-y-full pointer-events-none overflow-hidden":
                      selected_warning_reason !== option.reason &&
                      selected_warning_reason !== null,
                  }
                )}
              >
                {option.reason}
              </div>
              {selected_warning_reason === option.reason && (
                <div>
                  <div>
                    {option_duration.map((duration, index) => (
                      <option key={index} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </div>
                  <p>선택된 기간: {}</p>
                </div>
              )}
            </>
          ))}
          {selected_warning_reason !== null ? (
            <span>
              <button
                onClick={() => {
                  sendSanctionInfo();
                }}
                className="bg-red-300 absolute top-10"
              >
                전송하기
              </button>
            </span>
          ) : (
            <span>zzzzz</span>
          )}
        </div>
        <span className="absolute bottom-2 w-auto">여기보세요</span>
      </div>
    </>
  );
};

export default ChatSanction;
