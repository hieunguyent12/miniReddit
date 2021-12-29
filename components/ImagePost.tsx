import React, { memo, useState } from "react";
import { Pressable, View, Modal, Text, StyleSheet } from "react-native";
import ReactNativeZoomableView from "@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView";

import { fixLink } from "../utils";
import FullWidthImage from "./FullWidthImage";

interface ImagePostProps {
  url: string;
  over_18: boolean;
}

const ImagePost = memo(({ url, over_18 }: ImagePostProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const onImagePress = () => {
    setModalVisible(true);
  };

  return (
    <>
      <Modal visible={modalVisible}>
        <View style={styles.container}>
          {/* <Pressable
            onPress={() => {
              console.log(fixLink(url));
              setModalVisible(false);
            }}
          > */}
          <View style={styles.modalContainer}>
            <ReactNativeZoomableView
              maxZoom={1.5}
              minZoom={1}
              zoomStep={0.5}
              initialZoom={1}
              bindToBorders={true}
            >
              <FullWidthImage
                source={{ uri: fixLink(url) }}
                // style={{ maxHeight: 800 }}
                blurRadius={over_18 ? 15 : 0}
              />
            </ReactNativeZoomableView>
          </View>
          {/* </Pressable> */}
        </View>
      </Modal>
      <Pressable onPress={onImagePress}>
        <View style={{ maxHeight: 800, marginBottom: 8 }}>
          <FullWidthImage
            source={{ uri: fixLink(url) }}
            style={{ maxHeight: 800 }}
            blurRadius={over_18 ? 15 : 0}
          />
        </View>
      </Pressable>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    // marginTop: 22,
    backgroundColor: "#242424",
  },

  modalContainer: {
    height: "100%",
    // margin: 20,
    justifyContent: "center",
    // alignItems: "center",
  },
});

export default ImagePost;
