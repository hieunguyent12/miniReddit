import { LinkPreview } from "@flyerhq/react-native-link-preview";
import { Video } from "expo-av";
import React, { memo } from "react";
import { View, Image, Text } from "react-native";
import { URL } from "react-native-url-polyfill";

interface LinkPostProps {
  url: string;
}
const LinkPost = memo(({ url }: LinkPostProps) => {
  return (
    <View style={{ width: "100%", height: 100, marginBottom: 20 }}>
      <LinkPreview
        text={url}
        renderLinkPreview={({ aspectRatio, containerWidth, previewData }) => {
          return (
            <View>
              {previewData && (
                <>
                  {previewData.link ? (
                    <Text>{new URL(previewData.link).hostname}</Text>
                  ) : (
                    <Text>Can't parse URL</Text>
                  )}
                  <Image
                    source={{ uri: previewData.image?.url }}
                    style={{
                      width: 100,
                      height: 100,
                    }}
                  />
                </>
              )}
            </View>
          );
        }}
      />
    </View>
  );
});
export default LinkPost;
