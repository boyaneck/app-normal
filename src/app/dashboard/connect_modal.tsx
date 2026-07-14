"use client";
import React, { useState, useTransition, useRef, ElementRef } from "react";
import { createIngress } from "@/api/ingress";
import { IngressInput } from "livekit-server-sdk";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUserStore from "@/store/user";

const RTMP = String(IngressInput.RTMP_INPUT);
const WHIP = String(IngressInput.WHIP_INPUT);
type IngressType = typeof RTMP | typeof WHIP;

interface ConnectModalProps {
  onGenerated: (result: { url: string; streamKey: string }) => void;
}

const Connect_Modal = ({ onGenerated }: ConnectModalProps) => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const [isPending, startTransition] = useTransition();
  const [ingressType, setIngressType] = useState<IngressType>(RTMP);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore((state) => state);

  const onSubmit = () => {
    if (user === null) {
      setError("로그인 후 이용해주세요.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const ingress = await createIngress(parseInt(ingressType), user);
        onGenerated({ url: ingress.url!, streamKey: ingress.streamKey! });
        closeRef.current?.click();
      } catch (err) {
        console.error("Ingress 생성 실패:", err);
        setError("연결 정보를 만드는 데 실패했습니다. 다시 시도해주세요.");
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">새 연결 생성</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 연결 생성</DialogTitle>
        </DialogHeader>

        <Select
          disabled={isPending}
          value={ingressType}
          onValueChange={(value: string) => setIngressType(value as IngressType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="연결 방식" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RTMP}>RTMP</SelectItem>
            <SelectItem value={WHIP}>WHIP</SelectItem>
          </SelectContent>
        </Select>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>주의</AlertTitle>
          <AlertDescription>
            새로 생성하면 기존 연결 정보는 더 이상 사용할 수 없어요. 방송
            중이었다면 다시 시작해야 합니다.
          </AlertDescription>
        </Alert>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-x-2">
          <DialogClose ref={closeRef} asChild>
            <Button variant="ghost">취소</Button>
          </DialogClose>
          <Button disabled={isPending} onClick={onSubmit}>
            {isPending ? "생성 중..." : "생성"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Connect_Modal;
