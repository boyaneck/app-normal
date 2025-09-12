import { getFollowingUsers, toggleFollow } from "@/api/follow";
import {
  QueryCache,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface FollowProps {
  current_user_email: string;
  target_user_email: string;
  target_user_id: string;
  current_user_id: string;
}

const useFollow = (current_user_email: string) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["followUser"],
    queryFn: () => getFollowingUsers(current_user_email),
  });
  const queryClient = useQueryClient();
  const followMutation = useMutation({
    mutationFn: ({
      current_user_email,
      target_user_email,
      target_user_id,
      current_user_id,
    }: FollowProps) =>
      toggleFollow(
        current_user_email,
        target_user_email,
        target_user_id,
        current_user_id
      ),
    onMutate: async () => {
      console.log("onMutate 호출");
      await queryClient.cancelQueries({ queryKey: ["followUser"] });
      const prevFollowUser = queryClient.getQueryData(["followUser"]);

      queryClient.setQueryData(["followUser"], () => {
        if (prevFollowUser) {
          return { ...prevFollowUser };
        }
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
  });

  return { followMutation };
};
export default useFollow;
