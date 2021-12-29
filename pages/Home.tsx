import { Text, View, Button, Platform } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Buffer } from "buffer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { AuthContext } from "../AuthContext";
import { Tokens, User, Subreddit, PostType } from "../types";
import { MY_SECURE_AUTH_STATE_KEY, REDDIT_CLIENT_ID } from "../constants";
import Profile from "./Profile";
import Feed from "./Feed";
import RedditAPI from "../redditAPI";

const Tab = createBottomTabNavigator();

type Category = "hot" | "popular" | "new";

const DEFAULT_SUBREDDIT = "popular";
const DEFAULT_CATEGORY = "hot";

export default function Home() {
  const auth = useContext(AuthContext);
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [currentSubreddit, setCurrentSubreddit] = useState(DEFAULT_SUBREDDIT);
  const [currentCategory, setCurrentCategory] = useState(DEFAULT_CATEGORY);
  const [postsData, setPostsData] = useState<{
    after: null | string;
    posts: PostType[];
  }>({
    after: null,
    posts: [],
  });

  useEffect(() => {
    // In the home screen, we show a feed of the posts of the user's subscribed subreddits.
    async function fetchSubreddits() {
      try {
        const [_subreddits, _posts] = await Promise.all([
          RedditAPI.getMySubreddits(),
          RedditAPI.getPosts(currentSubreddit, currentCategory),
        ]);

        const posts: PostType[] = _posts.data.children;
        const subreddits: Subreddit[] = _subreddits.data.children;

        setSubreddits(subreddits);
        setPostsData({
          after: _posts.data.after,
          posts,
        });
      } catch (e) {
        // TODO Ideally, we want to refresh the token every 60 minutes instead of relying
        // on this "catch" because there might be other errors which could make this run infinitely

        // use refresh_token to get new access_token
        console.log("refresh token", e);
      }
    }

    if (auth && auth.userTokens) {
      // fetch user data
      fetchSubreddits();
    }
  }, [auth, currentCategory, currentSubreddit]);

  const loadMoreData = async () => {
    if (!postsData.after) return;

    const _posts = await RedditAPI.getPosts(
      currentSubreddit,
      currentCategory,
      10,
      postsData.after
    );
    const posts: PostType[] = _posts.data.children;

    let allPosts: any = [...postsData.posts, ...posts];

    // We are using a Set here to ensure that all of the posts are unique
    // sometimes, the API return the same posts which can cause errors
    allPosts = allPosts.map((post: any) => JSON.stringify(post));

    setPostsData({
      after: _posts.data.after,
      posts: [...new Set<any>(allPosts)].map((shit) => JSON.parse(shit)),
    });
  };

  if (!auth) {
    return <Text>Something went wrong</Text>;
  }

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Feed"
        options={{
          headerShown: false,
        }}
      >
        {(props) => (
          <Feed
            {...props}
            posts={postsData.posts}
            after={postsData.after}
            loadMoreData={loadMoreData}
            currentSubreddit={currentSubreddit}
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
            auth={auth}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <Profile {...props} subreddits={subreddits} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
