import { Participant, Room } from "livekit-client";
import { useEffect, useState } from "react";

interface streamDurationProps {
  room: Room;
  streamer_id: string;
}

export const useStreamDuration = ({
  room,
  streamer_id,
}: streamDurationProps) => {
  const [start_time, set_start_time] = useState(0);
  const [duration, set_duration] = useState("00:00");

  useEffect(() => {
    if (room && streamer_id) {
      const meta_object = {
        stream_start: Date.now(),
      };
      const metadata_into_string = JSON.stringify(meta_object);
      room.localParticipant.setMetadata(metadata_into_string);
    }
  }, [room]);

  useEffect(() => {
    if (!room) return;

    const parseMetadata = (participant: Participant | undefined) => {
      if (participant?.metadata) {
        try {
          const metadata = JSON.parse(participant.metadata);
          if (metadata && typeof metadata.stream_start === "number") {
            set_start_time(metadata);
            return;
          }
        } catch (error) {
          console.error("메타데이터 패싱 실패", error);
          try {
            const parse_time = parseInt(participant?.metadata, 10);
            if (!isNaN(parse_time)) {
              set_start_time(parse_time);
            }
          } catch (e) {
            console.error("메타데이터 파싱에 최종 실패했습니다.", e);
          }
        }
      }
    };
    //처음 접속시 스트리머 찾아서 시간 설정
    findStreamer();
  });
};
