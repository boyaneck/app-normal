import { Room } from "livekit-client";
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
    if (!room) return;

    const findStreamer = () => {
      const streamer = room.getParticipantByIdentity(streamer_id);
      if (streamer?.metadata) {
        try {
          const metadata = JSON.parse(streamer.metadata);
          if (metadata) {
          }
        } catch (error) {}
      }
    };
  });
};
