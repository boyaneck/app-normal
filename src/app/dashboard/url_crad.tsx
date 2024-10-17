import { Input } from "@/components/ui/input";
import React from "react";
import Copy_button from "./copy_button";

const Url_Card = () => {
  return (
    <div className="rounded-xl bg-muted p-6">
      <div className="flex items-center gap-x-10">
        <p className="font-semibold shrink-0"></p>
      </div>
      Url_crad
      <div className="space-y-2 w-full"></div>
      <div className="w-full flex items-center gap-x-2"></div>
      <Input value={""} disabled placeholder="Server URL" />
      <Copy_button></Copy_button>
    </div>
  );
};

export default Url_Card;
