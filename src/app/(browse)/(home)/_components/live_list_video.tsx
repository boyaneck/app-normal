import { useTrack, useTracks } from "@livekit/components-react";
import { RemoteTrackPublication, Track, VideoQuality } from "livekit-client";
import React, { useEffect } from "react";

const LiveListVideo = () => {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const track_reference = tracks[0];

  useEffect(() => {
    // 화질 설정은 track이 아니라 publication(구독 정보)에 있는 메서드
    const publication = track_reference?.publication;
    if (publication instanceof RemoteTrackPublication) {
      publication.setVideoQuality(VideoQuality.LOW);
    }
  }, [track_reference]);

  return <div>LiveListVideo</div>;
};

export default LiveListVideo;
