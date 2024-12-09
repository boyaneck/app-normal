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
import { insertIngress } from "./live";
// import { TrackSource } from "@livekit/protocol";

// //api_url을 담아 ingress 생성
const ingressClient = new IngressClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_SECRET!
);

// export const resetIngress = async (host_identity: string) => {
//   const ingresses = await ingressClient.listIngress({
//     roomName: host_identity,
//   });
//   const rooms = await roomService.listRooms([host_identity]);
//   for (const room of rooms) {
//     await roomService.deleteRoom(room.name);
//   }
//   for (const ingress of ingresses) {
//     if (ingress.ingressId) {
//       await ingressClient.deleteIngress(ingress.ingressId);
//     }
//   }
// };

export const createIngress = async (
  ingressType: IngressInput,
  user: userData | null
) => {
  console.log("잉그레스 타입", ingressType);
  const options: CreateIngressOptions = {
    name: user?.user_nickname,
    roomName: user?.user_id,
    participantName: user?.user_nickname,
    participantIdentity: user?.user_id,
  };
  // if (ingressType === IngressInput.WHIP_INPUT) {
  //   options.bypassTranscoding = true;
  // } else {
  //   options.video = {
  //     source: TrackSource.CAMERA,
  //   };
  //   options.audio = {
  //     source: TrackSource.MICROPHONE,
  //     preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
  //   };
  // }

  const ingress = await ingressClient.createIngress(ingressType, options);
  // if (!ingress || !ingress.url || !ingress.streamKey) {
  //   throw new Error("Failed to create Ingress");
  // }
  // console.log("다만든 잉그레스 객체는?", ingress);
  // return ingress;
  console.log("잉그레스 클라이언트 엿보기", ingressClient);
};
