import { Button } from "@/components/ui/button";
import React from "react";
import Url_Card from "./url_card";
import Key_Card from "./key_card";
import Connect_Modal from "./connect_modal";
import { create_ingress } from "@/api/live";

const page = async () => {
  // const selft =await getSelf()

  return (
    <div className="p-6">
      page
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Keys URLS</h1>
        <Connect_Modal />
      </div>
      <div className="space-y-4">
        <Url_Card value={``} />
        <Key_Card value={``} />
      </div>
    </div>
  );
};

export default page;
