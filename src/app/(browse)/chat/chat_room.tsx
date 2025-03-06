import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getChatInfo } from "@/api/chat"; // 올바른 경로로 수정
import useUserStore from "@/store/user";
import { useSocketStore } from "@/store/socket_store";
import Picker from "emoji-picker-react";
import { animated_heart } from "@/types/chat";

const ChatRoom = () => {
  const [receive_message_info, set_receive_message_info] = useState<
    chat_info_[]
  >([]);
  const [show_emoji_picker, set_show_emoji_picker] = useState(false);
  const [message, set_message] = useState("");
  const message_input_ref = useRef(null);
  const chatContainerRef = useRef(null); // 채팅 컨테이너 ref 생성
  const user_info = useUserStore((state) => state.user);
  const { socket, connect_socket } = useSocketStore();
  const [message_remove, set_message_remove] = useState(null);
  const [hearts, set_hearts] = useState<heart[]>([]); // 하트 목록 상태

  console.log("메세지 확인", message);
  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //   }
  // }, [receive_message_info]);

  useEffect(() => {
    if (!socket) {
      connect_socket();
    }
    if (socket) {
      socket.on("receive_message", (message_info) => {
        set_receive_message_info((prev) => [...prev, message_info]);
      });
    }
    return () => {
      socket?.off("receive_message");
    };
  }, [socket, connect_socket]);

  const { data: chat_info } = useQuery({
    queryKey: ["getChatInfo"],
    queryFn: getChatInfo,
  });

  const onEmojiClick = (event: any, emojiObject: any) => {
    set_message((prev) => prev + event.emoji);
    // message_input_ref.current?.focus();
  };

  const onHandlerSendMessage = () => {
    const user_nickname = user_info?.user_nickname;
    const avatar_url = user_info?.avatar_url;
    const id = user_info?.user_id;
    const email = user_info?.user_email;
    const date = dayjs().toISOString();
    const current_chat_room_number = "5";
    const message_info = {
      user_nickname,
      avatar_url,
      message,
      date,
      id,
      email,
      current_chat_room_number,
    };
    socket?.emit("send_message", {
      roomnumber: "5",
      message_info,
    });
    set_message("");
  };

  const onHandlerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_message(e.target.value);
  };

  const max_messages = 10; // 최대 메시지 개수

  const AnimatedMessage = ({ message, is_visible }: remove_message_props) => {
    return (
      <div className={is_visible ? "animate-fadeOutUp" : ""}>
        {message}:{is_visible}
      </div>
    );
  };

  const handleHeartClick = () => {
    // 새로운 하트 추가
    const id = Date.now();
    console.log("하트의 타입은", typeof id);
    set_hearts([{ id }]);
    //실시간 채팅이기에 해당 콘텐츠에 대한 좋아요가 아니라서 한번만 누를수 있도록 해야함함
    // set_hearts(([prev_hearts]) => [...[prev_hearts], { id: Date.now() }]);
  };

  console.log("하트 확인하기", hearts);
  const handlerAnimationEnd = ({ id }: heart) => {
    //여기서 하트 카운트를 세고 ,
    set_hearts(([prev_hearts]) =>
      [prev_hearts].filter((heart) => heart?.id !== id)
    );
  };

  useEffect(() => {
    if (receive_message_info.length > max_messages) {
      // 사라질 메시지 설정
      set_message_remove(receive_message_info[0]);

      // 0.3초 후에 메시지 목록에서 제거
      setTimeout(() => {
        set_receive_message_info((prev) => prev.slice(1));
        set_message_remove(null);
      }, 300);
    }
  }, [receive_message_info]);

  const AnimatedHeart = ({ onAnimationEnd, id }: animated_heart) => {
    const [is_visible, set_is_visible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        set_is_visible(false);
        onAnimationEnd({ id: id } as heart); // 애니메이션 종료 후 콜백 호출
      }, 800); // 애니메이션 시간과 동일하게 설정

      return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    return is_visible ? (
      <div className="animate-heartWave text-red-500 text-2xl absolute bottom-0 left-1/2 transform -translate-x-1/2">
        ❤️
      </div>
    ) : null;
  };

  return (
    <div className="bg-red-400 h-full w-full grid grid-rows-10 relative">
      <div className="bg-yellow-300 row-span-9">
        {receive_message_info.map((message_info) => {
          const isRemoving = message_remove === message_info;
          return (
            <AnimatedMessage
              message={`${message_info.user_nickname}: ${message_info.message}`}
              is_visible={isRemoving}
            />
          );
        })}
      </div>
      <div className="bg-white row-span-1">
        <span className="flex flex-row">
          <input
            placeholder="메세지를 입력해주세요"
            ref={message_input_ref}
            value={message}
            onChange={onHandlerInput}
            className=" bg-transparent border border-purple-400 w-2/3 "
          ></input>
          <button
            onClick={onHandlerSendMessage}
            className="hover hover:cursor-pointer"
          >
            전송
          </button>
          <button
            className="relative"
            onClick={() => set_show_emoji_picker(!show_emoji_picker)}
          >
            🙂
            {show_emoji_picker && (
              <div className="absolute bottom-full left-0 z-10 transform scale-75 translate-x-[-12.5%] translate-y-[12.5%]">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </button>
          <button className="relative" onClick={handleHeartClick}>
            {hearts.map((heart) => (
              <AnimatedHeart
                key={heart?.id}
                id={heart?.id}
                onAnimationEnd={handlerAnimationEnd}
                className="absolute bottom-full left-0"
              />
            ))}
            ❤️
          </button>
        </span>
      </div>
    </div>
    // <div className="grid grid-rows-5 h-full w-full relative border bg-purple-500">
    //   {/* {show_emoji_picker && <Picker onEmojiClick={onEmojiClick} />} */}
    //   <span className="row-span-4">
    //     <div ref={chatContainerRef} className="col-span-1 ">
    //       {receive_message_info.map((message_info) => {
    //         const isRemoving = message_remove === message_info;
    //         return (
    //           <AnimatedMessage
    //             message={`${message_info.user_nickname}: ${message_info.message}`}
    //             is_visible={isRemoving}
    //           />
    //         );
    //       })}
    //     </div>
    //   </span>
    //   <span className="row-span-1">
    //     <span className="flex flex-wrap  ">
    //       <span className="w-4/6">
    //         <input
    //           placeholder="메세지를 입력해주세요"
    //           ref={message_input_ref}
    //           value={message}
    //           onChange={onHandlerInput}
    //           className=" bg-transparent border w-full "
    //         ></input>
    //       </span>
    //       <span className="w-1/6">
    //         <button
    //           onClick={onHandlerSendMessage}
    //           className="hover hover:cursor-pointer"
    //         >
    //           전송
    //         </button>
    //       </span>
    //       <span className="w-1/6">
    //         <button onClick={() => set_show_emoji_picker(!show_emoji_picker)}>
    //           🙂
    //         </button>
    //       </span>
    //     </span>
    //   </span>
    /* <span className="col-span-1 border border-black items-center bg-sky-200 flex">
        <span>
          <input
            placeholder="메세지를 입력해주세요"
            ref={message_input_ref}
            value={message}
            onChange={onHandlerInput}
            className=" bg-transparent border border-purple-400 "
          ></input>
        </span>
        <span className="  border border-red-400 flex space=x-2">
          <button
            onClick={onHandlerSendMessage}
            className="hover hover:cursor-pointer"
          >
            전송
          </button>
          <button onClick={() => set_show_emoji_picker(!show_emoji_picker)}>
            이모지
          </button>
          <button onClick={handleHeartClick}>❤️</button>
        </span>
      </span> */
    //   <div className="relative">
    //     <div className="border border-black">
    //       {/* 하트 아이콘이 나타날 영역 */}
    //       {hearts.map((heart) => (
    //         <AnimatedHeart
    //           key={heart?.id}
    //           id={heart?.id}
    //           onAnimationEnd={handlerAnimationEnd}
    //         />
    //       ))}
    //     </div>
    //   </div>
    // </div>
  );
};

export default ChatRoom;
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import dayjs from "dayjs";
// import { useQuery } from "@tanstack/react-query";
// import { getChatInfo } from "@/api/chat";
// import useUserStore from "@/store/user";
// import { useSocketStore } from "@/store/socket_store";
// import Picker from "emoji-picker-react";

// interface animate_props{

// }
// const ChatRoom = () => {
//   const [receive_message_info, set_receive_message_info] = useState<
//     chat_props[]
//   >([]);
//   const [show_emoji_picker, set_show_emoji_picker] = useState(false);
//   const [message, set_message] = useState("");
//   const message_input_ref = useRef(null);
//   const chatContainerRef = useRef(null);
//   const user_info = useUserStore((state) => state.user);
//   const { socket, connect_socket } = useSocketStore();
//   const [message_remove, set_message_remove] = useState(null);
//   const [hearts, set_hearts] = useState<heart[]>([]);
//   const heartButtonRef = useRef(null);

//   useEffect(() => {
//     if (!socket) {
//       connect_socket();
//     }
//     if (socket) {
//       socket.on("receive_message", (message_info) => {
//         set_receive_message_info((prev) => [...prev, message_info]);
//       });
//     }
//     return () => {
//       socket?.off("receive_message");
//     };
//   }, [socket, connect_socket]);

//   const { data: chat_info } = useQuery({
//     queryKey: ["getChatInfo"],
//     queryFn: getChatInfo,
//   });

//   const onEmojiClick = (event: any, emojiObject: any) => {
//     set_message((prev) => prev + event.emoji);
//   };

//   const onHandlerSendMessage = () => {
//     const user_nickname = user_info?.user_nickname;
//     const avatar_url = user_info?.avatar_url;
//     const id = user_info?.user_id;
//     const email = user_info?.user_email;
//     const date = dayjs().toISOString();
//     const current_chat_room_number = "5";
//     const message_info = {
//       user_nickname,
//       avatar_url,
//       message,
//       date,
//       id,
//       email,
//       current_chat_room_number,
//     };
//     socket?.emit("send_message", {
//       roomnumber: "5",
//       message_info,
//     });
//     set_message("");
//   };

//   const onHandlerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     set_message(e.target.value);
//   };

//   const max_messages = 6;

//   const AnimatedMessage = ({ message, is_visible }: remove_message_props) => {
//     return (
//       <div className={is_visible ? "animate-fadeOutUp" : ""}>
//         {message}:{is_visible}
//       </div>
//     );
//   };

//   const handleHeartClick = () => {
//     // if (!heartButtonRef.current) return;

//     // const buttonRect = heartButtonRef.current.getBoundingClientRect();
//     // const containerRect = heartButtonRef.current
//     //   .closest(".relative")
//     //   .getBoundingClientRect();

//     // const relativeX = buttonRect.left - containerRect.left;
//     // const relativeY = buttonRect.top - containerRect.top;

//     // const id = Date.now();
//     // set_hearts((prevHearts) => [
//     //   ...prevHearts,
//     //   { id, x: relativeX, y: relativeY },
//     // ]);
//   };

//   const handlerAnimationEnd = (id: id_props) => {
//     set_hearts((prevHearts) => prevHearts.filter((heart) => heart.id !== id));
//   };
//  console.log("heart에[ 뭐ㅏ가 들었음 ?")
//   const AnimatedHeart = ({ id, x, y }:{}) => {
//     const [isVisible, setIsVisible] = useState(true);

//     useEffect(() => {
//       const timer = setTimeout(() => {
//         setIsVisible(false);
//         handlerAnimationEnd(id);
//       }, 800);

//       return () => clearTimeout(timer);
//     }, [id]);

//     return isVisible ? (
//       <div
//         className="animate-heartWave text-red-500 text-2xl absolute"
//         style={{
//           left: x + "px", // px 단위 추가
//           top: y + "px", // px 단위 추가
//         }}
//       >
//         ❤️[]
//       </div>
//     ) : null;
//   };

//   return (
//     <div className="grid grid-rows-3 h-full relative border border-sky-400">
//       <span className="absolute top-28 right-0 z-20">
//         {show_emoji_picker && (
//           <Picker className="z-10" onEmojiClick={onEmojiClick} />
//         )}
//       </span>
//       <div ref={chatContainerRef} className="col-span-1 border bg-red-400">
//         {receive_message_info.map((message_info, index) => {
//           const isRemoving = message_remove === message_info;
//           return (
//             <AnimatedMessage
//               key={index}
//               message={`${message_info.user_nickname}: ${message_info.message}`}
//               is_visible={isRemoving}
//             />
//           );
//         })}
//       </div>
//       <span className="col-span-1 border border-black items-center bg-sky-200 flex">
//         <input
//           placeholder="메세지를 입력해주세요"
//           ref={message_input_ref}
//           value={message}
//           onChange={onHandlerInput}
//           className="bg-transparent border border-purple-400 flex-grow"
//         />
//         <span className="border border-red-400 flex space-x-2 items-center relative">
//           {" "}
//           {/* position: relative 추가 */}
//           <button
//             onClick={onHandlerSendMessage}
//             className="hover:cursor-pointer"
//           >
//             전송
//           </button>
//           <button onClick={() => set_show_emoji_picker(!show_emoji_picker)}>
//             이모지
//           </button>
//           <button
//             onClick={handleHeartClick}
//             ref={heartButtonRef}
//             className="focus:outline-none"
//           >
//             ❤️
//           </button>
//           {hearts.map(
//             (
//               heart //hearts.map 이 span 태그 안으로 들어왔습니다.
//             ) => (
//               <AnimatedHeart
//                 key={heart.id}
//                 id={heart.id}
//                 x={heart.x}
//                 y={heart.y}
//               />
//             )
//           )}
//         </span>
//       </span>
//     </div>
//   );
// };

// export default ChatRoom;
