import { useTrack, useTracks } from "@livekit/components-react";
import { Track, VideoQuality } from "livekit-client";
import React, { useEffect } from "react";

const LiveListVideo = () => {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const trackRef = tracks[0];

  useEffect(() => {
    if (trackRef && trackRef.publication) {
      const pub = trackRef.publication;

      pub.setVideoQuality(VideoQuality.LOW);
      pub.setSubscribed(true);
    }
  }, []);

  return <div>LiveListVideo</div>;
};

export default LiveListVideo;
