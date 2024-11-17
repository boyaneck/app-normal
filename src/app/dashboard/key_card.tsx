"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Copy_button from "./copy_button";
import { Button } from "@/components/ui/button";

interface key_card_props {
  value: string | null;
}

const Key_Card = ({ value }: key_card_props) => {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-xl bg-muted p-6">
      <div className="flex items-start gap-x-10">
        <p className="font-semibold shrink-0">Stream key</p>
        <div className="space-y-2 w-full"></div>
        <div className="w-full flex items-center gap-x-2"> </div>
        <Input
          value={value || ""}
          type={show ? "text" : "password"}
          disabled
          placeholder="Stream Key"
        />
        <Copy_button value={value || ""} />
      </div>
      <Button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</Button>
    </div>
  );
};

export default Key_Card;
