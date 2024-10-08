import { supabaseForClient } from "@/supabase/supabase_client";

interface Props {
  user_email: string;
}

//로그인 하면 해당 유저의 follow테이블의 row를 체크하고 없을 경우 생성,
export const addFollow = async (user_id: Props) => {
  try {
    const { data: checkFollow, error: checkFollowError } =
      await supabaseForClient.from("follow").select("*").eq("user_id", user_id);

    if (checkFollowError)
      console.log(
        "유저의 팔로우 데이터를 가져오는데 문제가 발생했습니다!",
        checkFollowError.message
      );

    if (checkFollow === null || checkFollow.length === 0) {
      console.log("지금 여기가 나와야함!!!", user_id);
      const { data, error } = await supabaseForClient.from("follow").insert([
        {
          user_id,
        },
      ]);
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
  currentUserId: string,
  targetUserId: string
) => {
  console.log("팔로우하기 테스트", currentUserId, targetUserId);
  try {
    // 타겟 유저의 현재 팔로워 목록 가져오기
    const { data: targetUser, error: targetUserError } = await supabaseForClient
      .from("users")
      .select("*,follow(followed)")
      .eq("id", targetUserId)
      .single();

    // 현재 유저의 팔로우 목록 가져오기
    const { data: currentUser, error: currentUserError } =
      await supabaseForClient
        .from("users")
        .select("*,follow(follow)")
        .eq("id", currentUserId)
        .single();

    if (targetUserError || currentUserError) {
      console.log(targetUserError, currentUserError);

      const { data, error } = await supabaseForClient.from("follow").insert({
        user_id: currentUserId,
      });
      throw new Error("유저의 팔로우 데이터를 가져오는 중 오류가 발생했습니다");
    }

    // const isFollowing = targetUser.includes(currentUserId);
    const isFollowing = currentUser.includes(targetUserId);

    if (isFollowing) {
      // 이미 팔로우 중이므로 언팔로우 처리
      const updatedFollowers = targetUser.filter(
        (id: string) => id !== currentUserId
      );
      const updatedFollows = currentUser.filter(
        (id: string) => id !== targetUserId
      );

      await supabaseForClient
        .from("follow")
        .update({ follower: updatedFollowers })
        .eq("id", targetUserId);

      await supabaseForClient
        .from("follow")
        .update({ follow: updatedFollows })
        .eq("id", currentUserId);
    } else {
      // 팔로우하지 않은 상태이므로 팔로우 처리
      console.log("어떠헥 나오려나....", targetUserId, currentUserId);
      const updatedFollowers = [...targetUser.follower, currentUserId];
      const updatedFollows = [...currentUser.follow, targetUserId];

      await supabaseForClient
        .from("follow")
        .insert({ follower: currentUserId })
        .eq("id", targetUserId);

      await supabaseForClient
        .from("follow")
        .insert({ follow: targetUserId })
        .eq("id", currentUserId);
    }
  } catch (error) {
    console.error("팔로우 상태를 변경하는 중 오류 발생:", error);
  }
};
