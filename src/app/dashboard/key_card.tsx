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
    <div className="rounded-xl bg-muted p-6 space-y-2">
      <p className="font-semibold">Stream Key</p>
      <div className="w-full flex items-center gap-x-2">
        <Input
          value={value || ""}
          type={show ? "text" : "password"}
          disabled
          placeholder="Stream Key"
        />
        <Button variant="outline" onClick={() => setShow(!show)}>
          {show ? "숨기기" : "보기"}
        </Button>
        <Copy_button value={value || ""} />
      </div>
    </div>
  );
};

export default Key_Card;
