import useUserStore from "@/store/user";
import { supabaseForClient } from "@/supabase/supabase_client";
import { useEffect, useState } from "react";

interface Props {
  arbre: string;
}

const useSinginAndLogout = ({ arbre }: Props) => {
  const { setUser } = useUserStore((state) => state);

  const [sessionUserId, setSessionUserId] = useState<string>("");

  useEffect(() => {
    const loginSubscription = supabaseForClient.auth.onAuthStateChange(
      (event, session) => {
        console.log("여기 세션이 있습니다", session);
        if (session) {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          }
        } else {
          console.log("세션이 없습니다ㅣ.", session);
        }
      }
    );
    return () => {
      loginSubscription.data.subscription.unsubscribe();
    };
  }, []);
};

//깃 오류 테스트중
export default useSinginAndLogout;
