import { Video } from "expo-av";
import React, { memo } from "react";
import { View } from "react-native";
import { fixLink } from "../utils";

import FullWidthImage from "./FullWidthImage";

interface GalleryPostProps {
  data: any;
}
// TODO some images are blurry
const GalleryPost = memo(({ data }: GalleryPostProps) => {
  return (
    <View style={{ maxHeight: 800 }}>
      <FullWidthImage
        source={{
          uri: fixLink(
            data.media_metadata[data.gallery_data.items[0].media_id].p[1].u
          ),
        }}
        style={{ maxHeight: 800 }}
        blurRadius={0}
      />
    </View>
  );
});

export default GalleryPost;
