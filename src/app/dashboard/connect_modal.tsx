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
import { insertIngress } from "@/api/live";

//IngressInput에 들어갈 각각의 형식에 맞는 수를 문자열로 변환한다.
const RTMP = String(IngressInput.RTMP_INPUT);
const WHIP = String(IngressInput.WHIP_INPUT);
type IngressType = typeof RTMP | typeof WHIP;

const Connect_Modal = () => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const [isPending, startTransition] = useTransition();
  const [ingressType, setIngressType] = useState<IngressType>(RTMP);

  const onSubmit = () => {
    // createIngress(parseInt(ingressType));
    // yap();
    startTransition(() => {
      createIngress(parseInt(ingressType))
        .then(() => {
          console.log("Ingress create succeed");
          alert("Ingress가 만들어 졌습니다");
          closeRef?.current?.click();
        })
        .catch((error) => {
          if (isNaN(parseInt(ingressType))) {
            console.error("Invalid ingressType:", ingressType);
          }

          alert("error 가 생김");
          console.log("errr는", error, error.message);
        });
    });
    console.log("startTransition이 끝났습니다.");
  };
  const ddd = () => {
    const user_id = "88560f0a-d2bd-47b0-a340-02ac2e3343aa";
    const user_id_string = user_id.toString();
    insertIngress(
      user_id_string,
      "jinxx9222223@naver.com",
      "벙찌네",
      "뭐지",
      "ㅋㅋㅋㅋ"
    );
    alert("");
  };
  return (
    <Dialog>
      {/* <Button
        onClick={() => {
          ddd();
        }}
      >
        실험테스트
      </Button> */}
      <DialogTrigger>
        {/* <Button>Generate connection</Button> */}
        <span className="border border-black">Generate Connection</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeader>
            <DialogTitle>Generate Connection </DialogTitle>
          </DialogHeader>
        </DialogHeader>
        <Select
          disabled={isPending}
          value={ingressType}
          onValueChange={(value: any) => setIngressType(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ingress Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RTMP}>RTMP</SelectItem>
            <SelectItem value={WHIP}>WHIP</SelectItem>
          </SelectContent>
        </Select>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            현재 연결된 것을 이용하여 모든 동적 스트림을 재시작하세요!
          </AlertDescription>
        </Alert>
        <div className="flex justify-between">
          <DialogClose ref={closeRef} asChild>
            {/* <Button variant="ghost">Cancel</Button> */}
            <Button>Cancel</Button>
          </DialogClose>
          <Button disabled={isPending} onClick={onSubmit}>
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Connect_Modal;
