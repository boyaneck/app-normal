"use client";
import React from "react";
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
const Connect_Modal = () => {
  return (
    <Dialog>
      <DialogTrigger>
        {/* <Button>Generate connection</Button> */}
        <span className="border borer-black">Generate Connection</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogHeader>
            <DialogTitle>Generate Connection </DialogTitle>
          </DialogHeader>
        </DialogHeader>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ingress Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RTMP">RTMP</SelectItem>
            <SelectItem value="WHIP">WHIP</SelectItem>
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
          <DialogClose>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={() => {}}>Generate</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Connect_Modal;
