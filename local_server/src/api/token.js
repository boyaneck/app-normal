export const createViewerToken = async (current_host_id, user_info) => {
  let now_user_info;
  //현재 유저의 로그인 유무 확인
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log("토큰이 유효한 토큰인지 확인", user);
    if (user) {
      now_user_info = {
        id: user.id,
        user_nickname: user.user_metadata.user_nickname,
        email: user.email,
      };
    } else {
      const id = v4();
      const guest_nickname = `게스트${Math.floor(Math.random() * 1000)}`;
      const guest_email = `게스트${Math.floor(Math.random() * 1000)}@guest.com`;
      now_user_info = { id, user_nickname: guest_nickname, email: guest_email };
      console.log(
        "로그인 유저가 없습니다. 게스트 유저를 생성합니다.",
        now_user_info
      );
    }
  } catch (error) {
    //에러가 발생해도 게스트로 처리
    console.log("토큰 생성중 발생하는 error", error);
    const id = v4();
    const guest_nickname = `게스트${Math.floor(Math.random() * 1000)}`;
    const guest_email = `게스트${Math.floor(Math.random() * 1000)}@guest.com`;
    now_user_info = { id, user_nickname: guest_nickname, email: guest_email };
    console.log(
      "로그인 유저가 없습니다. 게스트 유저를 생성합니다.",
      now_user_info
    );
  }
};
const token = new AccessToken(
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
  {
    identity: is_host ? `host-${now_user_info.id}` : now_user_info.id,
    name: now_user_info.email,
  }
);
