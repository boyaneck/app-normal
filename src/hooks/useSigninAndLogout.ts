import useUserStore from "@/store/user";
import { supabaseForClient } from "@/supabase/supabase_client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "@/api";
import { userInfo } from "os";
// import { addFollow } from "@/api/follow";
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
  useEffect(() => {
    const loginSubscription = supabaseForClient.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
            setSessionUserEmail(session?.user?.email);
            if (fetchedUserInfo) {
              console.log(
                "로그인한 유저의 아이디",
                fetchedUserInfo?.id,
                fetchedUserInfo,
                "뚜르릅",
                fetchedUserInfo.user_email,
                fetchedUserInfo.user_nickname,
                fetchedUserInfo.id
              );
              const userInfo = {
                user_id: fetchedUserInfo.id,
                user_nickname: fetchedUserInfo.user_nickname,
                avatar_url: fetchedUserInfo.avatar_url,
                user_email: fetchedUserInfo.user_email,
                created_at: fetchedUserInfo.created_at,
                isLive: fetchedUserInfo.isLive,
              };

              setUser(userInfo);
              setIsIdentified(true);
              // 로그인 시 쿠키에 해당 유저의 이메일 저장
              document.cookie =
                "user_email=" +
                fetchedUserInfo.user_email +
                "; path=/; max-age=3600"; // 1시간 유효

              // addFollow(fetchedUserInfo.id, fetchedUserInfo.user_email);
            } else {
              console.log("유저 정보를 불러오지 못했습니다.");
            }
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setIsIdentified(false);
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
