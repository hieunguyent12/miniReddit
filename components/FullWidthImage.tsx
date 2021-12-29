import React, { Component } from "react";
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from "react-native";
import FastImage from "react-native-fast-image";

interface Props {
  ratio?: number;
  width?: number;
  height?: number;
  source?: any;
  style?: StyleProp<ImageStyle>;

  onLoad?: any;
  onLoadEnd?: any;
  onLoadStart?: any;
  blurRadius: number;
}

export default class FullWidthImage extends Component<
  Props,
  { width: number | undefined; height: number | undefined }
> {
  _root: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      width: props.width || undefined,
      height: props.height || undefined,
    };
  }

  setNativeProps(nativeProps: any) {
    this._root.setNativeProps(nativeProps);
  }

  _onLayout(event: any) {
    const containerWidth = event.nativeEvent.layout.width;

    if (this.props.ratio) {
      this.setState({
        width: containerWidth,
        height: containerWidth * this.props.ratio,
      });
    } else if (this.props.width && this.props.height) {
      this.setState({
        width: containerWidth,
        height: containerWidth * (this.props.height / this.props.width),
      });
    } else if (this.props.source) {
      let source = this.props.source;
      if (typeof source !== "string") {
        source = this.props.source.uri;
      }
      Image.getSize(source, (width, height) => {
        this.setState({
          width: containerWidth,
          height: (containerWidth * height) / width,
        });
      });
    }
  }

  render() {
    return (
      <View
        ref={(component) => (this._root = component)}
        onLayout={this._onLayout.bind(this)}
        style={styles.container}
      >
        <Image
          source={this.props.source}
          style={{
            width: this.state.width,
            height: this.state.height,
          }}
          blurRadius={this.props.blurRadius}
          onLoad={this.props.onLoad}
          onLoadEnd={this.props.onLoadEnd}
          onLoadStart={this.props.onLoadStart}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
  },
});
