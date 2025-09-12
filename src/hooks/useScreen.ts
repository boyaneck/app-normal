import { useCallback, useEffect, useState } from "react";
import { useViewerToken } from "./useViewerToken";

interface useScreenProps {
  host_identity: string;
  host_nickname: string;
  current_user_id: string;
}

export const useScreen = ({
  host_identity,
  host_nickname,
  current_user_id,
}: useScreenProps) => {
  //호스트의 id와 nicknamme 받아오기

  const [chk_host_id, set_chk_host_id] = useState("");
  const [chk_host_nickname, set_host_nickname] = useState("");
  const [chk_current_user_id, set_chk_current_user_id] = useState("");
  const [isHovering, setIsHovering] = useState(false); //

  const handleMouseLeave = () => {};
  const handleMouseHover = ({
    host_identity,
    host_nickname,
    current_user_id,
  }: useScreenProps) => {
    set_chk_host_id(host_identity);
    set_host_nickname(host_nickname);
    set_chk_current_user_id(current_user_id);
  };
  useEffect(() => {
    if (host_identity === undefined) return;

    handleMouseHover({ host_identity, host_nickname, current_user_id });
  }, [host_identity]);

  const { token, name, identity } = useViewerToken(
    chk_host_id,
    chk_host_nickname,
    chk_current_user_id
  );

  return {
    handleMouseLeave,
    handleMouseHover,
    token,
    chk_host_nickname,
    chk_host_id,
  };
};
