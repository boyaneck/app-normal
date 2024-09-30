import { supabaseForClient } from "@/supabase/supabase_client";

interface Props {
  user_email: string;
}

//follow를 누르면 추가,
export const addFollow = async (user_email: Props) => {
  const { error, data } = await supabaseForClient
    .from("users")
    // .update("")
    .select("*")
    .eq("user_email", user_email);

  if (error) console.log("follow시 문제가 발생했습니다!", error);

  return data;
};

export const toggleFollow = async (
  currentUserId: string,
  targetUserId: string
) => {
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
      throw new Error("유저의 팔로우 데이터를 가져오는 중 오류가 발생했습니다");
    }

    const isFollowing = targetUser.includes(currentUserId);

    if (isFollowing) {
      // 이미 팔로우 중이므로 언팔로우 처리
      const updatedFollowers = targetUser.filter(
        (id: string) => id !== currentUserId
      );
      const updatedFollows = currentUser.filter(
        (id: string) => id !== targetUserId
      );

      await supabaseForClient
        .from("users")
        .update({ follower: updatedFollowers })
        .eq("id", targetUserId);

      await supabaseForClient
        .from("users")
        .update({ follow: updatedFollows })
        .eq("id", currentUserId);
    } else {
      // 팔로우하지 않은 상태이므로 팔로우 처리
      // const updatedFollowers = [...targetUser.follower, currentUserId];
      // const updatedFollows = [...currentUser.follow, targetUserId];

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
