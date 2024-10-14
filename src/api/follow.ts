import { supabaseForClient } from "@/supabase/supabase_client";

interface Props {
  user_id: string;
  user_email: string;
}

//로그인 하면 해당 유저의 follow테이블의 row를 체크하고 없을 경우 생성,
export const addFollow = async (
  user_id: string | undefined,
  current_user_email: string | undefined
) => {
  try {
    const { data: checkFollow, error: checkFollowError } =
      await supabaseForClient.from("follow").select("*").eq("user_id", user_id);

    if (checkFollowError)
      console.log(
        "유저의 팔로우 데이터를 가져오는데 문제가 발생했습니다!",
        checkFollowError.message
      );

    if (checkFollow === null || checkFollow.length === 0) {
      const { data, error } = await supabaseForClient.from("follow").insert([
        {
          user_id,
          follower: [],
          follow: [],
          user_email: current_user_email,
        },
      ]);

      if (error) {
        console.log("데이터 삽입 중 에러 발생:", error.message);
      }
    }
  } catch (error) {
    console.log(
      "유저의 팔로우 레코드를 확인 혹은 생성하는데 에러가 발생했습니다.",
      error
    );
  }
};

//팔로우 & 언팔로우
export const toggleFollow = async (
  current_user_email: string,
  target_user_email: string,
  user_id: string
) => {

  const { data, error } = await supabaseForClient.rpc("follow_user", {
    target_user_email,
    current_user_email,
  });
  if (error) console.log("");
};
