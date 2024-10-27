"use server";
// "use client";
import {
  IngressAudioEncodingPreset,
  IngressInput,
  IngressClient,
  IngressVideoEncodingPreset,
  RoomServiceClient,
  type CreateIngressOptions,
} from "livekit-server-sdk";

import { TrackSource } from "livekit-server-sdk/dist/proto/livekit_models";
import { revalidatePath } from "next/cache";
import { getUserInfo } from "./user";
import { useStore } from "zustand";
import useUserStore from "@/store/user";
import { stream_update } from "./stream";
import { create_ingress } from "./live";
// import { TrackSource } from "@livekit/protocol";
const roomService = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

//api_url을 담아 ingress 생성
const ingressClient = new IngressClient(
  process.env.NEXT_PUBLIC_LIVEKIT_API_URL!
);

// const { user } = useUserStore((state) => state);
getUserInfo;
export const resetIngress = async (hostIdentity: string) => {
  const ingresses = await ingressClient.listIngress({
    roomName: hostIdentity,
  });
  const rooms = await roomService.listRooms([hostIdentity]);

  for (const room of rooms) {
    await roomService.deleteRoom(room.name);
  }

  for (const ingress of ingresses) {
    if (ingress.ingressId) {
      await ingressClient.deleteIngress(ingress.ingressId);
    }
  }
};

export const yap = async () => {
  console.log("에러학인 유무 함수");
};
export const createIngress = async (ingressType: IngressInput) => {
  console.log("무슨에러인가요?", ingressType);

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

  create_ingress(ingress.ingressId, ingress.streamKey, ingress.url);

  //  revalidatePath(`/u/${}/keys`)

  return ingress;
};
