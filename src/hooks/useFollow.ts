import { addFollow } from "@/api/follow";
import { QueryCache, QueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

interface FollowProps {
  user_email: string;
}

const useFollow = (user_email: FollowProps) => {
  const queryClient = new QueryClient();

  const followMutation = useMutation( {
    mutationFn:addFollow(user_email),
    onMutate: async (user_email: FollowProps) => {
      console.log("onMutate 호출");
      await queryClient.cancelQueries({ queryKey: ["followUser"] });
      const previousFollowUser = queryClient.getQueryData<string[]>(["followUser"]);
      queryClient.setQueryData(["followUser"], (old: string[] | undefined) => {
        return old? [...old,user_email] :[user_email]
      });
      return { previousFollowUser };
    },
    onError: (context) => {
      console.log("follow mutate 중 에러 발생 :", context);
      queryClient.setQueryData(["followUser"], context?.previousFollowuser);
    },
    onSettled: () => {
      console.log("onSettled");
      queryClient.invalidateQueries({ queryKey: ["followUser"] });
    },
  });
};
