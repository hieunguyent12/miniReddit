import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

import Comment from "./Comment";
import type { CommentType, PostType } from "../../types";

interface Props {
  relationships: {
    [key: string]: CommentType[];
  };
  postData: PostType;
  loadMoreComments: (ids: string[], parent_id: string, index: number) => void;
  collapseCommentTree: (parent: string, childId: string) => void;
}

export default function CommentTree({
  relationships,
  loadMoreComments,
  collapseCommentTree,
  postData,
}: Props) {
  const data = postData.data;

  const renderTree = useMemo(() => {
    function renderChildren(parent: string, depth = 1) {
      const relation = relationships[parent];

      // if this parent don't have any children, return empty array
      if (!relation) {
        return [];
      }

      let finalTree = [];

      for (let i = 0; i < relation.length; i++) {
        let currentChild = relation[i];

        const children = renderChildren(`t1_${currentChild.id}`, depth + 1);

        const _children = (
          <View key={parent}>{currentChild.collapsed ? null : children}</View>
        );

        finalTree.push([
          <Comment
            key={currentChild.id}
            index={i}
            data={currentChild}
            collapseCommentTree={collapseCommentTree}
            loadMoreComments={loadMoreComments}
            style={{ paddingLeft: depth * 5, ...styles.commentItem }}
          />,
          _children,
        ]);
      }

      return finalTree;
    }

    if (Object.keys(relationships).length === 0) return null;

    return relationships[data.name].map((parent) => (
      <Comment
        key={parent.id}
        renderChildren={(parent_id) => renderChildren(`t1_${parent.id}`)}
        index={0}
        data={parent}
        style={styles.commentContainer}
        collapseCommentTree={collapseCommentTree}
        loadMoreComments={loadMoreComments}
      />
    ));
  }, [relationships]);

  return <View>{renderTree}</View>;
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
