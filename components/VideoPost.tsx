import { Video } from "expo-av";
import React, { memo } from "react";

interface VideoPostProps {
  fallback_url: string;
}

const VideoPost = memo(({ fallback_url }: VideoPostProps) => {
  return (
    <Video
      source={{ uri: fallback_url }}
      useNativeControls
      style={{
        height: 300,
        marginBottom: 8,
      }}
    />
  );
});

export default VideoPost;
