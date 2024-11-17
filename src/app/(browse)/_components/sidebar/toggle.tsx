"use client";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/sidebar_store";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
import Hint from "@/components/hint";
import React from "react";
import { toggleFollow } from "@/api/follow";

const Toggle = () => {
  const { collapsed, onCollapse, onExpand } = useSidebarStore((state) => state);
  const label = collapsed ? "Expand" : "Collapse";

  const santé = () => {
    toggleFollow;
  };

  return (
    <>
      {collapsed && (
        <div className="hidden lg:flex w-full items-center justify-center pt-4 mb-4">
          <Hint label={label} side="right" asChild>
            <Button onClick={onExpand} className="h-auto p-2">
              <ArrowLeftFromLine className="h-5 w-5" />
            </Button>
          </Hint>
        </div>
      )}
      {!collapsed && (
        <div className="p-3 pl-6 mb-2 flex items-center w-full">
          <p className="font-semibold text-primary">For you</p>

          <Hint label={label} side="right" asChild>
            <Button
              onClick={onCollapse}
              className="h-auto ml-auto "
              // variant="ghost"
            >
              <ArrowLeftFromLine className="h-6 w-6" />
            </Button>
          </Hint>
        </div>
      )}
    </>
  );
};

export default Toggle;
