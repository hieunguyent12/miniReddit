import React, { useState } from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import type { CommentType } from "../../types";
import RedditAPI from "../../redditAPI";

interface Props {
  style: StyleProp<ViewStyle>;
  // parent_id: string,
  // id: string,
  data: CommentType;
  index: number;
  collapseCommentTree: (parent_id: string, childId: string) => void;
  renderChildren?: (parent: string) => JSX.Element[][];
  loadMoreComments: (
    loadMoreIds: string[],
    parent_id: string,
    index: number
  ) => void;
}

export default function Comment({
  data,
  collapseCommentTree,
  renderChildren,
  loadMoreComments,
  style,
  index,
  ...props
}: Props) {
  const [vote, setVote] = useState(data.vote);

  // null = not upvote or downvote yet
  // true = upvoted
  // false = downvoted
  const upvoted = vote;
  const downvoted = vote === false;

  if (data.loadMore && data.count) {
    return (
      <Text
        style={[style, styles.loadMoreText]}
        onPress={() => {
          loadMoreComments(data.loadMoreIds ?? [], data.parent_id, index);
        }}
      >
        load more comments {data.count}
      </Text>
    );
  }

  return (
    <View style={style}>
      <Text
        style={styles.authorText}
        onPress={() => {
          collapseCommentTree(data.parent_id, data.id);
        }}
      >
        {data.author}
      </Text>

      {!data.collapsed && (
        <>
          <Text>{data.body}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <AntDesign
              name="arrowup"
              size={15}
              color={upvoted ? "orange" : "black"}
              onPress={() => {
                if (upvoted) {
                  // if we already reacted to the comment, then undo it
                  RedditAPI.castVote("0", `t1_${data.id}`);
                  setVote(null);
                } else {
                  RedditAPI.castVote("1", `t1_${data.id}`);
                  setVote(true);
                }
              }}
            />
            <Text style={{ paddingHorizontal: 3 }}>{data.score ?? 0}</Text>
            <AntDesign
              name="arrowdown"
              size={15}
              color={downvoted ? "orange" : "black"}
              onPress={() => {
                if (downvoted) {
                  RedditAPI.castVote("0", `t1_${data.id}`);
                  setVote(null);
                } else {
                  RedditAPI.castVote("-1", `t1_${data.id}`);
                  setVote(false);
                }
              }}
            />
          </View>
        </>
      )}

      {renderChildren
        ? data.collapsed
          ? null
          : data.collapsed
          ? null
          : renderChildren(`t1_${data.id}`)
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
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

  loadMoreText: {
    marginVertical: 4,
    color: "#176ae6",
  },
});
