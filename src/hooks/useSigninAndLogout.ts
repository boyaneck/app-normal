import useUserStore from "@/store/user";
import { supabaseForClient } from "@/supabase/supabase_client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "@/api";
import { userInfo } from "os";
interface Props {
  arbre: string;
}

const useSigninAndLogout = () => {
  const { setUser } = useUserStore((state) => state);
  const [sessionUserEmail, setSessionUserEmail] = useState<string>("");
  const [isIdentified, setIsIdentified] = useState<string>("");
  const { data: fetchedUserInfo, error } = useQuery({
    queryKey: ["fetchedUserInfo"],
    queryFn: () => getUserInfo(sessionUserEmail),
    enabled: !!sessionUserEmail,
  });
  console.log("state 유무 ", sessionUserEmail);
  // console.log("슈퍼베이스에서 데이터 페칭", userInfo);
  useEffect(() => {
    const loginSubscription = supabaseForClient.auth.onAuthStateChange(
      (event, session) => {
        console.log("여기 세션이 있습니다", session);
        if (session) {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
            setSessionUserEmail(session.user.id);
            if (fetchedUserInfo) {
              const userInfo = {
                user_nickname: fetchedUserInfo.user_nickname,
                avatar_url: fetchedUserInfo.avatar_url,
                user_email: fetchedUserInfo.avatar_url,
                created_at: fetchedUserInfo.created_at,
                isLive: fetchedUserInfo.isLive,
              };
            }
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

  return {
    isIdentified,
    setIsIdentified,
  };
};

//깃 오류 테스트중
export default useSigninAndLogout;
