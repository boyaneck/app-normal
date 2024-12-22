"use server";
import {
  IngressAudioEncodingPreset,
  IngressInput,
  IngressClient,
  RoomServiceClient,
  type CreateIngressOptions,
} from "livekit-server-sdk";

import { TrackSource } from "livekit-server-sdk/dist/proto/livekit_models";
// import { TrackSource } from "@livekit/protocol";

const roomServiceClient = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);
// //api_url을 담아 ingress 생성
const ingressClient = new IngressClient(process.env.LIVEKIT_API_URL!);

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
  const options: CreateIngressOptions = {
    name: user?.user_nickname,
    roomName: user?.user_id,
    participantName: user?.user_nickname,
    participantIdentity: user?.user_id,
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

  // try {
  //   const ingress = await ingressClient.createIngress(ingressType);
  //   console.log("되나 ??");
  // } catch (error) {
  //   console.log("오류메세지", error);
  //   throw error;
  // }
  const ingress = await ingressClient.createIngress(ingressType, options);
  if (!ingress || !ingress.url || !ingress.streamKey) {
    alert("잉그레스 객체가 잘 생성되지 않았음 ");
    throw new Error("Failed to create Ingress");
  }
  console.log("다만든 잉그레스 객체는?", ingress);
  return ingress;
  console.log("콘솔이 몇번찍히려냐 ???");
};
