import { supabaseForClient } from "@/supabase/supabase_client";
import { useEffect } from "react";

interface Props {}

const useSinginAndLogout = ({}) => {
  useEffect(() => {
    const loginSubscription = supabaseForClient.auth.onAuthStateChange(
      (event, session) => {}
    );
  }, []);
};

//깃 오류 테스트중
export default useSinginAndLogout;
