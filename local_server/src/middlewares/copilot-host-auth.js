export const authorizeHost = async (socket, next) => {
  try {
    //-- socket의 handshake 에 auth 할만한 정보가 있는지를 확인
    const token = socket.handshake.auth?.token;
    if (!token) return;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //--
  } catch (error) {}
  // 1. 너 누구야 (authenticate 부분)
  //     const token = socket.handshake.auth?.token;
  //     if (!token) return next(new Error("UNAUTHORIZED"));
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //     // 2. 너 이 방송 주인이야 (authorizeHost 부분)
  //     const streamId = socket.handshake.auth?.streamId;
  //     const stream = await getStreamById(streamId);
  //     if (!stream || stream.status !== "live") return next(new Error("STREAM_NOT_LIVE"));
  //     if (stream.hostId !== decoded.userId) return next(new Error("FORBIDDEN_NOT_HOST"));

  //     socket.data.user = { id: decoded.userId, role: decoded.role };
  //     socket.data.streamId = streamId;
  //     next();
  //   } catch {
  //     next(new Error("UNAUTHORIZED"));
  //   }
};

/** 1 -const authorizeHost = async (socket, next) => {                                      
       1 +import { TokenVerifier } from "livekit-server-sdk";                                  
       2 +import { redis_client } from "../config/redis.js";                                   
       3 +import { getRedisKeys } from "../live/redis-keys.js";                                
       4 +                                                                                     
       5 +const verifier = new TokenVerifier(                                                  
       6 +  process.env.LIVEKIT_API_KEY,                                                       
       7 +  process.env.LIVEKIT_API_SECRET,                                                    
       8 +);                                                                                   
       9 +                                                                                     
      10 +// 방송 시작 시 발급된 호스트용 LiveKit 토큰으로 호스트 신원 + 라이브 여부를 한 번에 
         +검증                                                                                 
      11 +export const authorizeHost = async (socket, next) => {                               
      12    try {
       3 -    //-- socket의 handshake 에 auth 할만한 정보가 있는지를 확인                      
       4 -    const token = socket.handshake.auth?.token;                                      
       5 -    if (!token) return;                                                              
       6 -    const decoded = jwt.verify(token, process.env.JWT_SECRET);                       
       7 -    //--                                                                             
       8 -  } catch (error) {}                                                                 
       9 -  // 1. 너 누구야 (authenticate 부분)                                                
      10 -  //     const token = socket.handshake.auth?.token;                                 
      11 -  //     if (!token) return next(new Error("UNAUTHORIZED"));                         
      12 -  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);                  
      13 +    const livekitToken = socket.handshake.auth?.token;                               
      14 +    if (!livekitToken) return next(new Error("UNAUTHORIZED"));                       
      15
      14 -  //     // 2. 너 이 방송 주인이야 (authorizeHost 부분)                              
      15 -  //     const streamId = socket.handshake.auth?.streamId;                           
      16 -  //     const stream = await getStreamById(streamId);                               
      17 -  //     if (!stream || stream.status !== "live") return next(new Error("STREAM_NOT_L
         -IVE"));                                                                              
      18 -  //     if (stream.hostId !== decoded.userId) return next(new Error("FORBIDDEN_NOT_H
         -OST"));                                                                              
      16 +    const claims = await verifier.verify(livekitToken);                              
      17 +    const identity = claims.sub;                                                     
      18 +    const roomName = claims.video?.room;                                             
      19
      20 -  //     socket.data.user = { id: decoded.userId, role: decoded.role };              
      21 -  //     socket.data.streamId = streamId;                                            
      22 -  //     next();                                                                     
      23 -  //   } catch {                                                                     
      24 -  //     next(new Error("UNAUTHORIZED"));                                            
      25 -  //   }                                                                             
      20 +    // token.js에서 호스트 토큰은 identity를 `host-${userId}`로 발급함               
      21 +    if (!identity?.startsWith("host-") || !roomName) {                               
      22 +      return next(new Error("FORBIDDEN_NOT_HOST"));                                  
      23 +    }                                                                                
      24 +                                                                                     
      25 +    // 토큰은 발급 시점에 고정되므로, "지금도 방송 중"인지는 별도로 확인             
      26 +    const isLive = await redis_client.exists(getRedisKeys(roomName).INFO);           
      27 +    if (!isLive) {                                                                   
      28 +      return next(new Error("NOT_LIVE"));                                            
      29 +    }                                                                                
      30 +                                                                                     
      31 +    socket.data.hostId = identity.replace("host-", "");                              
      32 +    socket.data.roomName = roomName;                                                 
      33 +    next();                                                                          
      34 +  } catch (error) {                                                                  
      35 +    console.error("[Copilot] 호스트 인증 실패:", error.message);                     
      36 +    next(new Error("UNAUTHORIZED"));                                                 
      37 +  }                                                                                  
      38  }; */
