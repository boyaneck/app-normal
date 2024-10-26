"use client";
import { Button } from "@/components/ui/button";
import { CheckCheck, Copy } from "lucide-react";
import React, { useState } from "react";

interface CopyClientProps {
  value?: string;
}

const Copy_button = ({ value }: CopyClientProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = () => {
    if (!value) return;

    setIsCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };
  const Icon = isCopied ? CheckCheck : Copy;
  return (
    <Button
      onClick={onCopy}
      disabled={!value || isCopied}
      variant="ghost"
      size="sm"
    >
      zz
      <Icon className="h-4 w-4" />
    </Button>
  );
};

export default Copy_button;
