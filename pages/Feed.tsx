import React, { useCallback, memo, useEffect, useState, useMemo } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  FlatList,
  Linking,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
// import FullWidthImage from "react-native-fullwidth-image";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Video } from "expo-av";

import FullWidthImage from "../components/FullWidthImage";
import { PostType } from "../types";
import { ContextValue } from "../AuthContext";
import Post from "./Post";
import ImagePost from "../components/ImagePost";
import VideoPost from "../components/VideoPost";
import LinkPost from "../components/LinkPost";
import GalleryPost from "../components/GalleryPost";
import RedditAPI from "../redditAPI";

interface Props {
  posts: PostType[];
  after: string | null;
  loadMoreData: () => void;
  currentSubreddit: string;
  currentCategory: string;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string>>;
  auth: ContextValue | null;
  navigation: any;
}

const Stack = createNativeStackNavigator();

export default function Feed({
  posts,
  after,
  loadMoreData,
  currentSubreddit,
  currentCategory,
  setCurrentCategory,
  auth,
  navigation,
}: Props) {
  if (posts.length === 0) {
    return <Text>Loading posts...</Text>;
  }

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("hot");
  const [items, setItems] = useState([
    { label: "Hot", value: "hot" },
    { label: "New", value: "new" },
  ]);

  const [votes, setVotes] = useState(() => {
    return posts.reduce((prev: { [key: string]: boolean | null }, cur) => {
      const newObj = { ...prev };
      newObj[cur.data.name] = cur.data.likes;

      return newObj;
    }, {});
  });

  const handleLinkPress = useCallback(async (url: string) => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      console.log("cannot open link");
    }
  }, []);

  const castVote = React.useCallback(
    async (id: string, value: "-1" | "1" | "0") => {
      try {
        await RedditAPI.castVote(value, id);

        if (value === "-1") {
          setVotes((s) => ({ ...s, [id]: false }));
        } else if (value === "1") {
          setVotes((s) => ({ ...s, [id]: true }));
        } else {
          setVotes((s) => ({ ...s, [id]: null }));
        }
      } catch (e) {
        console.log("cast vote error", e);
      }
    },
    []
  );

  const renderItem = ({ item }: { item: PostType }) => {
    return (
      <ListItem
        item={item}
        auth={auth}
        viewPost={viewPost}
        vote={votes[item.data.name]}
        castVote={castVote}
      />
    );
  };

  const viewPost = useCallback(
    (data: PostType, vote: boolean | null) => {
      navigation.navigate("Post", {
        data,
        auth: { ...auth, signOut: null, dispatch: null },
        vote,
      });
    },
    [auth]
  );

  return posts.length === 0 ? (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading Posts...</Text>
    </View>
  ) : (
    <Stack.Navigator>
      <Stack.Screen
        name="Deez"
        options={{
          headerShown: false,
        }}
      >
        {(props) => {
          return (
            <SafeAreaView>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  zIndex: 99,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                  }}
                >
                  {"r/" + currentSubreddit}
                </Text>

                <View
                  style={{
                    width: 100,
                  }}
                >
                  <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    onChangeValue={(value) => {
                      if (!value) return;

                      if (typeof value === "string") {
                        setCurrentCategory(value);
                      }
                    }}
                  />
                </View>
              </View>
              <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.data.id}
                onEndReachedThreshold={0.1}
                onEndReached={() => {
                  loadMoreData();
                }}
                initialNumToRender={10}
              />
            </SafeAreaView>
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="Post">
        {(props) => <Post {...props} castVote={castVote} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

interface ListItemProps {
  item: PostType;
  auth: ContextValue | null;
  viewPost: (data: PostType, vote: boolean | null) => void;
  vote: boolean | null;
  castVote: (id: string, value: "-1" | "1" | "0") => void;
}

const ListItem = memo(
  ({ item, auth, viewPost, vote: _vote, castVote }: ListItemProps) => {
    const data = item.data;

    const [vote, setVote] = useState(_vote);

    // null = not upvote or downvote yet
    // true = upvoted
    // false = downvoted

    // update the state to match with the prop
    useEffect(() => {
      if (_vote !== vote) {
        setVote(_vote);
      }
    }, [_vote]);

    const isImage = data.post_hint === "image";
    const isVideo = data.post_hint === "hosted:video";
    const isLink = data.post_hint === "link";
    const isGallery = data.gallery_data && data.media_metadata;

    // null = not upvote or downvote yet
    // true = upvoted
    // false = downvoted
    const upvoted = vote;
    // const notReacted = hasLikedOrDisliked === null;
    const downvoted = vote === false;

    return (
      <View key={data.id} style={styles.postContainer}>
        <View
          style={{
            paddingHorizontal: 5,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 5,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              {data.subreddit_name_prefixed}
            </Text>
            <Text
              style={{
                marginLeft: 10,
              }}
            >
              u/{data.author}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 17,
            }}
            onPress={() => {
              viewPost(item, vote);
            }}
          >
            {data.title}
          </Text>
        </View>
        <View style={{ width: "100%", maxHeight: 800 }}>
          {isImage ? (
            <ImagePost url={data.url} over_18={data.over_18} />
          ) : isVideo ? (
            <VideoPost
              fallback_url={data.secure_media.reddit_video.fallback_url}
            />
          ) : isLink ? (
            <LinkPost url={data.url} />
          ) : isGallery ? (
            <GalleryPost data={data} />
          ) : null}
        </View>
        <View
          style={{
            // flex: 1,
            alignItems: "flex-end",
            flexDirection: "row",
            paddingHorizontal: 5,
            // marginTop: 8,
          }}
        >
          <Text
            onPress={() => {
              const value = upvoted ? "0" : "1";
              castVote(data.name, value);

              if (value === "1") {
                setVote(true);
              } else {
                setVote(null);
              }
            }}
          >
            {upvoted ? "⬆️" : "Upvote"}
          </Text>
          <Text style={{ paddingHorizontal: 3 }}>{data.score}</Text>
          <Text
            onPress={() => {
              const value = downvoted ? "0" : "-1";
              castVote(data.name, value);

              if (value === "-1") {
                setVote(false);
              } else {
                setVote(null);
              }
            }}
          >
            {downvoted ? "⬇️" : "Downvote"}
          </Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "white",
    width: "100%",
    marginVertical: 5,
    // padding: 10,
    paddingVertical: 10,
    overflow: "hidden",
    maxHeight: 1000,
    flexDirection: "column",
    justifyContent: "space-between",
  },
});
