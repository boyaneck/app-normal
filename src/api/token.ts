"use server";

import { AccessToken } from "livekit-server-sdk";
import { v4 } from "uuid";
//supabase에서 유저의 db가져오기

export const createViewerToken = async (host_identity: string) => {
  let self;

  try {
    // self =유저자신의 정보
  } catch (error) {

      const id = v4();
      const user_name = `guest#${Math.floor(Math.random() * 1000)}`;
      self = { id, user_name };
  }

  const host =await 아이디를 통해서 받아오기

if (!host ){
 throw new Error("User not Found")
}

const is_blocked= await 블락드바이유저(host.id)
if(is_blocked){
    throw new Error("User is blocked")
}

 const is_host =self.id === host.id
 
 const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,    
    process.env.LIVEKIT_API_SECRET
 )
}
