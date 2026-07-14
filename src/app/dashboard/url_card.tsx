import { Input } from "@/components/ui/input";
import React from "react";
import Copy_button from "./copy_button";

interface url_card_props {
  value?: string;
}

const Url_Card = ({ value }: url_card_props) => {
  return (
    <div className="rounded-xl bg-muted p-6 space-y-2">
      <p className="font-semibold">Server URL</p>
      <div className="w-full flex items-center gap-x-2">
        <Input value={value || ""} disabled placeholder="Server URL" />
        <Copy_button value={value} />
      </div>
    </div>
  );
};

export default Url_Card;
