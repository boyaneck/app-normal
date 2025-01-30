import { useEffect, useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { createViewerToken } from "@/api/token";

export const useViewrToken = (
  user_identity: string | undefined,
  user_nickname: string | undefined,
  current_host_id: string | undefined
) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    console.log("user_identity", user_identity);
    console.log("user_nickname", user_nickname);
    console.log("current_host_id", current_host_id);
    if (!current_host_id) {
      return;
    }
    console.log("여기 타나요 ?");
    const createToken = async () => {
      try {
        const viewer_token = await createViewerToken(
          user_identity,
          user_nickname,
          current_host_id
        );

        setToken(viewer_token);

        const decoded_token = jwtDecode(viewer_token) as JwtPayload & {
          name?: string;
        };
        const name = decoded_token?.name;
        const identity = decoded_token.jti;

        if (identity) {
          setIdentity(identity);
        }
        if (name) {
          setName(name);
        }
      } catch (error) {
        console.log("토큰 생성시 문제가 생겼어요!", error);
      }
    };
    createToken();
  }, [user_identity, current_host_id]);

  return {
    token,
    name,
    identity,
  };
};
