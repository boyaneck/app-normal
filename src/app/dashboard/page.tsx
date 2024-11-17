// "use client";
import { Button } from "@/components/ui/button";
import React from "react";
import Url_Card from "./url_card";
import Key_Card from "./key_card";
import Connect_Modal from "./connect_modal";
import { insertIngress } from "@/api/live";
import Sidebar from "../(browse)/_components/sidebar";
// import { useSidebarStore } from "@/store/sidebar_store";
import { cn } from "@/lib/utils";

const page = async () => {
  // const { collapsed } = useSidebarStore((state) => state);
  // const selft =await getSelf()

  return (
    // <div className="p-6">
    //   page
    //   <div className="flex items-center justify-between mb-4">
    //     <h1 className="text-2xl font-bold">Keys URLS</h1>
    //     <Connect_Modal />
    //   </div>
    //   <div className="border border-black space-y-4">
    //     zzz
    //     <Url_Card value={``} />
    //     ss
    //     <Key_Card value={``} />
    //   </div>
    // </div>

    <div>
      <div className={cn("")}>
        <Sidebar />
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-auto flex-shrink-0">
          {/* Navbar 컴포넌트 */}
        </div>
        <div className="flex-grow flex justify-center items-center border border-black space-y-4">
          <Connect_Modal />
          <div className="border border-black space-y-4">
            // zzz // <Url_Card value={``} />
            // ss // <Key_Card value={``} />
            //{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
