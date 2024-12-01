import { useEffect, useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { createViewerToken } from "@/api/token";
import { TbWorldWww } from "react-icons/tb";
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase_server";
import { updateSession } from "@/utils/supabase_middleware";

export const useViewrToken = (host_identity: string) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    const createToken = async () => {
      try {
        const viewer_token = await createViewerToken(host_identity);
        console.log("ㅜㅜㅜㅜㅜㅜㅜㅜㅜㅜㅜㅜㅜ", viewer_token);
        setToken(viewer_token);

        const decoded_token = jwtDecode(viewer_token) as JwtPayload & {};
        // const name = decoded_token?.name;
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
    console.log("여기가 정지선입니다!!!!", typeof host_identity);
  }, [host_identity]);

  return {
    token,
    name,
    identity,
  };
};
