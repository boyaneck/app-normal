"use server";
// "use client";
import {
  IngressAudioEncodingPreset,
  IngressInput,
  IngressClient,
  IngressInfo,
  IngressVideoEncodingPreset,
  RoomServiceClient,
  type CreateIngressOptions,
} from "livekit-server-sdk";

import { TrackSource } from "livekit-server-sdk/dist/proto/livekit_models";
import { revalidatePath } from "next/cache";
import { create_ingress } from "./live";
// import { TrackSource } from "@livekit/protocol";

// const getUserEmailFromCookie = () => {
//   const cookies = document.cookie.split("; ");
//   const user_email_cookie = cookies.find((cookie) =>
//     cookie.startsWith("user_email=")
//   );
//   return user_email_cookie ? user_email_cookie.split("=")[1] : undefined;
// };
const roomService = new RoomServiceClient(
  process.env.NEXT_PUBLIC_LIVEKIT_API_URL!,
  process.env.NEXT_PUBLIC_LIVEKIT_API_KEY!,
  process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET!
);

console.log(
  "잘 전달 되나요 ?",
  process.env.NEXT_PUBLIC_LIVEKIT_API_URL!,
  process.env.NEXT_PUBLIC_LIVEKIT_API_KEY!,
  process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET!
);
//api_url을 담아 ingress 생성
const ingressClient = new IngressClient(
  process.env.NEXT_PUBLIC_LIVEKIT_API_URL!,
  process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET!
);

// const { user } = useUserStore((state) => state);
export const resetIngress = async (host_identity: string) => {
  const ingresses = await ingressClient.listIngress({
    roomName: host_identity,
  });
  const rooms = await roomService.listRooms([host_identity]);

  for (const room of rooms) {
    await roomService.deleteRoom(room.name);
  }

  for (const ingress of ingresses) {
    if (ingress.ingressId) {
      await ingressClient.deleteIngress(ingress.ingressId);
    }
  }
};

export const createIngress = async (ingressType: IngressInput) => {
  console.log(
    "왜 자꾸 안찍히는거야 ?",
    process.env.NEXT_PUBLIC_LIVEKIT_API_KEY,
    process.env.NEXT_PUBLIC_LIVEKIT_API_SECRET,
    process.env.NEXT_PUBLIC_LIVEKIT_API_URL
  );
  // const user_email = getUserEmailFromCookie();

  //TODO : Reset previous ingress

  // await resetIngress(self.id)

  const options: CreateIngressOptions = {
    name: "",
    roomName: "",
    participantName: "",
    participantIdentity: "",
  };

  if (ingressType === IngressInput.WHIP_INPUT) {
    options.bypassTranscoding = true;
  } else {
    options.video = {
      source: TrackSource.CAMERA,
    };
    options.audio = {
      source: TrackSource.MICROPHONE,
      preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
    };
  }
  const ingress = await ingressClient.createIngress(ingressType, options);

  if (!ingress || !ingress.url || !ingress.streamKey) {
    throw new Error("Failed to create Ingress");
  }

  // create_ingress(
  //   "jinxx93@naver.com",
  //   ingress.url,
  //   ingress.streamKey,
  //   ingress.ingressId
  // );

  create_ingress(
    "jinxx93@naver.com",
    "임시 url",
    "임시 스티리밍 키",
    "임시 ingressId"
  );
  //  revalidatePath(`/u/${}/keys`)

  return ingress;
};
