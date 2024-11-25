import { toggleFollow } from "@/api/follow";
import {
  QueryCache,
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface FollowProps {
  current_user_email: string;
  target_user_email: string;
  user_id: string;
}

const useFollow = () => {
  const queryClient = useQueryClient();
  const [tt, settt] = useState();
  const followMutation = useMutation({
    mutationFn: ({
      current_user_email,
      target_user_email,
      user_id,
    }: FollowProps) =>
      toggleFollow(current_user_email, target_user_email, user_id),
    onMutate: async () => {
      console.log("onMutate 호출");
      await queryClient.cancelQueries({ queryKey: ["followUser"] });
      const prevFollowUser = queryClient.getQueryData(["followUser"]);
      queryClient.setQueryData(["followUser"], () => {
        return;
      });
      return {};
    },
    onError: (error, context) => {
      console.log("follow mutate 중 에러 발생", context);
      queryClient.setQueryData(["followUser"], context);
    },
    onSettled: () => {
      console.log("onSettled 되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["followUser"] });
    },

    // mutationFn:()=> addFollow(user_email),
    // mutationFn: () => toggleFollow(),
    //   onMutate: async (user_email: FollowProps) => {
    //     console.log("onMutate 호출");
    //     await queryClient.cancelQueries({ queryKey: ["followUser"] });
    //     const prevFollowUser = queryClient.getQueryData(["followUser"]);
    //     queryClient.setQueryData(["followUser"], (old: string[] | undefined) => {
    //       return old ? [...old, user_email] : [user_email];
    //     });
    //     return { prevFollowUser };
    //   },
    //   onError: (context: { prevFollowUser: string[] }) => {
    //     console.log("follow mutate 중 에러 발생 :", context);
    //     // queryClient.setQueryData(["followUser"], context?.previousFollowuser);
    //   },
    //   onSettled: () => {
    //     console.log("onSettled");
    //     queryClient.invalidateQueries({ queryKey: ["followUser"] });
    //   },
  });

  return { followMutation };
};
export default useFollow;
