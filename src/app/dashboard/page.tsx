"use client";
import React, { useState } from "react";
import Url_Card from "./url_card";
import Key_Card from "./key_card";
import Connect_Modal from "./connect_modal";
import useUserStore from "@/store/user";
import useSigninAndLogout from "@/hooks/useSigninAndLogout";

interface ConnectionInfo {
  url: string;
  streamKey: string;
}

const DashboardPage = () => {
  useSigninAndLogout();
  const { user } = useUserStore((state) => state);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);

  return (
    <div>
      <div className="max-w-2xl mx-auto pl-24 pr-6 pt-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">스트리밍 연결 정보</h1>
            {user && (
              <p className="text-sm text-muted-foreground">
                {user.userNickname}님의 방송 연결 정보예요.
              </p>
            )}
          </div>
          <Connect_Modal onGenerated={setConnection} />
        </div>

        {connection ? (
          <div className="space-y-4">
            <Url_Card value={connection.url} />
            <Key_Card value={connection.streamKey} />
          </div>
        ) : (
          <div className="rounded-xl bg-muted p-6 text-sm text-muted-foreground">
            아직 발급된 연결 정보가 없어요. "새 연결 생성"을 눌러 RTMP 서버
            URL과 스트림 키를 발급받은 뒤 OBS에 등록해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
