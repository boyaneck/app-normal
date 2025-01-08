import { createIngress } from "@/api";
import useUserStore from "@/store/user";
import React from "react";

const Main_banner = () => {
  const { user } = useUserStore((state) => state);
  const onyva = () => {
    try {
      createIngress(1, user);
      alert("s");
    } catch (error) {
      alert("에러가발생했어요!");
    }
  };
  return (
    <div className="h-[500px] border border-green-500">
      Main_bannersss
      <div>
        <button
          className="hover cursor-pointer border border-red-300"
          onClick={onyva}
        >
          dd
        </button>
      </div>
    </div>
  );
};

export default Main_banner;
