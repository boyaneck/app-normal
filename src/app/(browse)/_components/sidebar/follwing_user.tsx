"use client";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { getFollowingUsers, getFollowingUsersInfo } from "@/api/follow";
import useUserStore from "@/store/user";
import { FaRegHeart } from "react-icons/fa6";
import Image from "next/image";
import useFollowingUserStore from "@/store/following_user";

const Following_user = () => {
  const { user } = useUserStore((state) => state);
  const [follow_user, setFollow_user] = useState<string[] | null>([]);
  const { setFollowingUser } = useFollowingUserStore((state) => state);
  const current_user_email =
    typeof user?.user_email === "string" ? user?.user_email : "";

  const { data: following_users } = useQuery({
    queryKey: ["following_users"],
    queryFn: () => getFollowingUsers(current_user_email),
    enabled: !!current_user_email,
  });

  //현재 following 한 모든 유저(채널)

  const { data: following_users_info } = useQuery({
    queryKey: ["following_users_info"],
    queryFn: async () => {
      if (following_users !== undefined && following_users !== null) {
        console.log("자 확인 ", following_users[0].follow);
        return getFollowingUsersInfo(following_users[0].follow);
      }
    },
    enabled: !!following_users,
  });
  useEffect(() => {
    if (following_users) {
      setFollow_user(following_users);
      setFollowingUser(following_users);
    }
  }, [following_users]);

  console.log("값을 주세요", following_users, following_users_info);
  return (
    <span>
      <>
        <FaRegHeart className="w-8 h-8" />
      </>
      <span>
        {/* 팔로잉한 유저중에 한번이라도 방송을 한사람만 보여주는 */}

        {following_users ? (
          <div>
            {following_users_info !== undefined ? (
              <>
                ㅠ
                {following_users_info?.map((following_user: any, idx) => (
                  <div key={idx}>
                    참
                    <div className="relative group">
                      <div className="text-gray-700 p-4 bg-gray-200">
                        툴팁박스
                      </div>

                      <div className="absolute left-0 top-full mt-2 w-48 h-8 bg-blue-500 text-white text-center rounded transform scale-0 origin-top-left transition-transform duration-300 ease-in-out group-hover:scale-100">
                        툴팁 내용
                      </div>
                    </div>
                    {/* <div className="relative group">
                      <div className="text-gray-700 p-4 bg-gray-200">
                        툴팁박스
                      </div>

                      <div className="absolute left-0 top-full mt-2 w-0 h-8 bg-blue-500 text-white text-center rounded transition-all duration-300 ease-in-out group-hover:w-48 group-hover:scale-x-100 scale-x-0 origin-left">
                        툴팁 내용
                      </div>
                    </div> */}
                    {following_user.is_live === true ? (
                      <div key={idx}>
                        <div className="relative group w-10 h-10 border border-black">
                          <div className="absolute inset-0 rounded-full border-2 border-transparent border-red-500 animate-spin-wave">
                            <div className="absolute inset-0 rounded-full group-hover:animate-wave"></div>
                          </div>
                          <div className=" rounded-full overflow-hidden w-full h-full">
                            <Image
                              width={60}
                              height={60}
                              src={""}
                              alt="유저 이미지"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={idx}>
                        거짓
                        <div className="relative group w-10 h-10 border border-black">
                          <div className="absolute inset-0 rounded-full border-2 border-transparent">
                            <div className="absolute inset-0 rounded-full group-hover:animate-wave"></div>
                          </div>
                          <div className="border border-green-600 rounded-full overflow-hidden w-full h-full">
                            <Image
                              width={60}
                              height={60}
                              src={""}
                              alt="유저 이미지"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <span>!</span>
        )}
      </span>
    </span>
  );
};

export default Following_user;
