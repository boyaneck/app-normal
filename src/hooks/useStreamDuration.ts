import { Participant, ParticipantEvent, Room } from "livekit-client";
import { useEffect, useState } from "react";

interface streamDurationProps {
  room: Room;
  streamer_id: string;
}

const formatDuration = (sec: number): string => {
  if (sec < 0) sec = 0;
  const total_sec = Math.floor(sec / 1000);
  const hours = Math.floor(total_sec / 3600);
  const minutes = Math.floor((total_sec % 3600) / 60);
  const seconds = total_sec % 60;
  const padded_minutes = String(minutes).padStart(2, "0");
  const padded_seconds = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${String(hours).padStart(
      2,
      "0"
    )}:${padded_minutes}:${padded_seconds}`;
  }
  return `${padded_minutes}:${padded_seconds}`;
};
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
            set_start_time(metadata.stream_start);
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
    const streamer = room.getParticipantByIdentity(streamer_id);
    parseMetadata(streamer);

    const changeMetadata = (
      metadata: string | undefined,
      participant: Participant
    ) => {
      if (participant.identity === streamer_id) {
        parseMetadata(participant);
      }
    };
    room.on(ParticipantEvent.ParticipantMetadataChanged, changeMetadata);

    return () => {
      room.off(ParticipantEvent.ParticipantMetadataChanged, changeMetadata);
    };
  }, [room, streamer_id]);

  useEffect(() => {
    if (start_time === null) {
      set_duration("00:00");
      return;
    }
    const interval = setInterval(() => {
      const elapsed = Date.now() - start_time;
      set_duration(formatDuration(elapsed));
    }, 1000);
  });
};
