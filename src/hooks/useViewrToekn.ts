import { useEffect, useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";

export const useViewrToekn = (host_identity: string) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    const create_token = async () => {
      try {
        const viewer_token = await createViewrToekn();
      } catch (error) {}
    };
  }, []);
};
