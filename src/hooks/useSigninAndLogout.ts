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
  const [sessionUserEmail, setSessionUserEmail] = useState<string | undefined>(
    ""
  );
  const [isIdentified, setIsIdentified] = useState<boolean>(false);
  const { data: fetchedUserInfo, error } = useQuery({
    queryKey: ["fetchedUserInfo"],
    queryFn: () => getUserInfo(sessionUserEmail),
    enabled: !!sessionUserEmail,
  });
  console.log("state 유무 ", sessionUserEmail);
  console.log("패치된 데이터", fetchedUserInfo);
  console.log("슈퍼베이스에서 데이터 페칭", userInfo);
  useEffect(() => {
    const loginSubscription = supabaseForClient.auth.onAuthStateChange(
      (event, session) => {
        console.log("여기 세션이 있습니다", session);
        if (session) {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
            setSessionUserEmail(session?.user?.email);
            console.log("이제 패치된 데이터가 들어올 차례", fetchedUserInfo);
            if (fetchedUserInfo) {
              console.log(
                "슈퍼베이스로 부터 유저 정보 가져오기",
                fetchedUserInfo
              );
              const userInfo = {
                user_nickname: fetchedUserInfo.user_nickname,
                avatar_url: fetchedUserInfo.avatar_url,
                user_email: fetchedUserInfo.user_email,
                created_at: fetchedUserInfo.created_at,
                isLive: fetchedUserInfo.isLive,
              };
              setUser(userInfo);
              setIsIdentified(true);
            } else {
              console.log("유저 정보를 불러오지 못했습니다.");
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setIsIdentified(false);
            console.log("로그아웃 되었을때 ", isIdentified);
          }
        } else {
          console.log("세션이 없습니다ㅣ.", session);
        }
      }
    );
    return () => {
      loginSubscription.data.subscription.unsubscribe();
    };
  }, [fetchedUserInfo]);
  return {
    isIdentified,
    setIsIdentified,
  };
};

//깃 오류 테스트중
export default useSigninAndLogout;
