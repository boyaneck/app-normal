import { useEffect, useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { createViewerToken } from "@/api/token";

export const useViewrToken = (host_identity: string) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    const createToken = async () => {
      try {
        const viewer_token = await createViewerToken(host_identity);
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
      createToken();
    };
  }, [host_identity]);

  console.log("콘솔토큰나와라", token, name, identity, "d엥에엥ㅇ?");
  return {
    token,
    name,
    identity,
  };
};