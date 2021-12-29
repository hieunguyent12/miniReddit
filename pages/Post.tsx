import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState, useMemo } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";

import ImagePost from "../components/ImagePost";
import VideoPost from "../components/VideoPost";
import LinkPost from "../components/LinkPost";
import GalleryPost from "../components/GalleryPost";
import {
  PostType,
  CommentType,
  MoreCommentType,
  FetchResponseCommentType,
  FetchResponseMoreCommentType,
} from "../types";
import { ContextValue } from "../AuthContext";
import CommentTree from "../components/comments/CommentTree";
import RedditAPI from "../redditAPI";

type Props = NativeStackScreenProps<any, "Post"> & {
  castVote: (id: string, value: "-1" | "1" | "0") => void;
};

// Filter through the data we fetched to include only the parts that we need
// otherwise, the array will be huge = high memory usage
function extractComment(
  comment: FetchResponseCommentType,
  comments: CommentType[]
) {
  switch (comment.kind) {
    case "t1":
      const c = {
        body: comment.data.body,
        author: comment.data.author,
        id: comment.data.id,
        parent_id: comment.data.parent_id,
        score: comment.data.score,
        loadMore: false,
        collapsed: false,
        vote: comment.data.likes,
      };

      comments.push(c);
      break;
    case "more":
      comments.push({
        id: comment.data.id,
        parent_id: comment.data.parent_id,
        loadMore: true,
        count: comment.data.count,
        loadMoreIds: comment.data.children,
        vote: null,
      });
      // if (comment.data.count > 0) {
      //   more.push(comment.data.children);
      // }
      break;
  }
}

function createRelationships(
  items: Array<CommentType>,
  relationships: any = {}
) {
  items.forEach((i) => {
    const parent_id = i.parent_id;

    if (parent_id) {
      const item = {
        id: i.id,
        loadMore: i.loadMore,
        count: i.count,
        body: i.body,
        loadMoreIds: i.loadMoreIds,
        author: i.author,
        parent_id: i.parent_id,
        collapsed: i.collapsed,
        score: i.score,
        vote: i.vote,
      };

      if (!relationships[parent_id]) {
        // initialize the array if the relation does not exist
        relationships[parent_id] = [item];
      } else {
        relationships[parent_id].push(item);
      }
    }
  });

  return relationships;
}

export default function Post({ route, castVote }: Props) {
  const _data: PostType = route.params?.data;
  const auth: ContextValue | null = route.params?.auth;

  const data = _data.data;

  const [vote, setVote] = useState(route.params?.vote);
  const [relationships, setRelationships] = useState<any>({});
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      setIsLoadingComment(true);

      try {
        const body = await RedditAPI.getComments(data.subreddit, data.id);

        const comments = body[1];

        const _comments: any = [];

        comments.data.children.forEach((comment: FetchResponseCommentType) => {
          extractComment(comment, _comments);
        });

        const relationships = createRelationships(_comments);

        setRelationships(relationships);
        setIsLoadingComment(false);
        // setComments(_comments);
      } catch (e) {
        console.log("error fetching comments", e);
      }
    }

    if (auth) {
      fetchComments();
    }
  }, [data.id, auth]);

  const loadMoreComments = async (
    ids: string[],
    parent_id: string,
    index: number
  ) => {
    if (!auth) return;

    try {
      const selection = ids.splice(1, 100).join(",");

      const body = await RedditAPI.getMoreComments(data.name, selection);

      const comments = body.json.data.things;
      const _comments: CommentType[] = [];

      // TODO bad for performance, just do this inside createRelationships directly
      comments.forEach((c: FetchResponseCommentType) => {
        extractComment(c, _comments);
      });

      const newRelationships = createRelationships(_comments, {
        ...relationships,
      });

      // Hide "load more comments" when it is clicked
      const itemToRemove = ids[0];

      const relation = newRelationships[parent_id];

      relation.splice(index, 1);

      setRelationships(newRelationships);
    } catch (e) {
      console.log("error fetching more comments", e);
    }
  };

  const collapseCommentTree = (parent: string, childId: string) => {
    // Find the correct element and update the "collapsed" property
    // If collapse is true then the chidlren of this comment won't show, otherwise it will.
    const newData = {
      ...relationships,
      [parent]: relationships[parent].map((i: CommentType) => {
        if (i.id === childId) {
          return {
            ...i,
            collapsed: !i.collapsed,
          };
        } else {
          return i;
        }
      }),
    };

    setRelationships(newData);
  };

  const _castVote = async (id: string, value: "-1" | "1" | "0") => {
    try {
      castVote(id, value);

      if (value === "-1") {
        setVote(false);
      } else if (value === "1") {
        setVote(true);
      } else {
        setVote(null);
      }
    } catch (e) {
      console.log("cast vote error", e);
    }
  };

  const isImage = data.post_hint === "image";
  const isVideo = data.post_hint === "hosted:video";
  const isLink = data.post_hint === "link";
  const isGallery = data.gallery_data && data.media_metadata;

  // null = not upvote or downvote yet
  // true = upvoted
  // false = downvoted
  const upvoted = vote;
  const downvoted = vote === false;

  if (!data || !auth) return <Text>Error fetching post</Text>;

  return (
    <ScrollView>
      <View style={styles.postContainer}>
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
          >
            {data.title}
          </Text>
        </View>

        <View>
          {isImage ? (
            <ImagePost url={data.url} over_18={data.over_18} />
          ) : isGallery ? (
            <GalleryPost data={data} />
          ) : isVideo ? (
            <VideoPost
              fallback_url={data.secure_media.reddit_video.fallback_url}
            />
          ) : isLink ? (
            <LinkPost url={data.url} />
          ) : null}
        </View>

        <View
          style={{
            // flex: 1,
            alignItems: "flex-end",
            flexDirection: "row",
            paddingHorizontal: 5,
            marginTop: 8,
          }}
        >
          <Text
            onPress={() => {
              _castVote(data.name, upvoted ? "0" : "1");
            }}
          >
            {upvoted ? "⬆️" : "Upvote"}
          </Text>
          <Text style={{ paddingHorizontal: 3 }}>{data.score}</Text>
          <Text
            onPress={() => {
              _castVote(data.name, downvoted ? "0" : "-1");
            }}
          >
            {downvoted ? "⬇️" : "Downvote"}
          </Text>
        </View>
      </View>
      {isLoadingComment ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text>Loading comments...</Text>
        </View>
      ) : (
        <CommentTree
          relationships={relationships}
          loadMoreComments={loadMoreComments}
          collapseCommentTree={collapseCommentTree}
          postData={_data}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "white",
    width: "100%",
    marginVertical: 5,
    // padding: 10,
    paddingVertical: 10,
    // overflow: "hidden",
    // height: 900,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  commentContainer: {
    backgroundColor: "white",
    padding: 5,
    marginVertical: 5,
  },

  commentItem: {
    marginVertical: 3,
  },

  authorText: {
    fontWeight: "700",
    marginBottom: 4,
  },
});
