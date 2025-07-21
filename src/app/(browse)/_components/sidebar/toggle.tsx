"use client";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/bar_store";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
import Hint from "@/components/hint";
import React from "react";
import { toggleFollow } from "@/api/follow";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
const Toggle = () => {
  const { collapsed, onCollapse, onExpand } = useSidebarStore((state) => state);
  const label = collapsed ? "Expand" : "Collapse";

  return (
    <>
      {collapsed && (
        <div className="hidden lg:flex w-full items-center justify-center pt-4 mb-4">
          <Button onClick={onExpand} className="h-auto p-2">
            <FaArrowRightLong className="h-5 w-5" />
          </Button>
        </div>
      )}
      {!collapsed && (
        <div className="p-3 pl-6 mb-2 flex items-center w-full">
          <Button
            onClick={onCollapse}
            className="h-auto ml-auto "
            // variant="ghost"
          >
            <FaArrowLeftLong className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
};

export default Toggle;
