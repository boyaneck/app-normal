import { useTrack, useTracks } from "@livekit/components-react";
import { RemoteVideoTrack, Track, VideoQuality } from "livekit-client";
import React, { useEffect } from "react";

const LiveListVideo = () => {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const track_reference = tracks[0];

  useEffect(() => {
    const real_track = track_reference?.publication.track;
    if (real_track instanceof RemoteVideoTrack) {
      real_track.setVideoQuality(VideoQuality.LOW);
    }
  }, [track_reference]);

  return <div>LiveListVideo</div>;
};

export default LiveListVideo;
