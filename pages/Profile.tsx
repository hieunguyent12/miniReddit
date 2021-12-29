import React, { useContext, useEffect, useState } from "react";
import { Platform, Text, Image, View, StyleSheet, Button } from "react-native";
import { AuthContext } from "../AuthContext";
import { MY_SECURE_AUTH_STATE_KEY, REDDIT_CLIENT_ID } from "../constants";
import { Subreddit, Tokens, User } from "../types";
import * as SecureStore from "expo-secure-store";
import { Buffer } from "buffer";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";

import RedditAPI from "../redditAPI";

interface Props {
  subreddits: Subreddit[];
}

export default function Profile({ subreddits }: Props) {
  const auth = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await RedditAPI.getMyProfile();

        setUser(data);
      } catch (e) {
        // use refresh_token to get new access_token
        console.log(e);

        return;
      }
    }

    if (auth && auth.userTokens) {
      // fetch user data
      fetchUser();
    }
  }, [auth]);

  if (!user) {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.profileImageContainer}>
          <Image
            style={styles.profileImage}
            source={{
              uri: user.snoovatar_img,
            }}
          />
        </View>
        <Text style={styles.username}>{user.name}</Text>

        <View style={{ flexDirection: "row", marginTop: 5 }}>
          <Text>Karma: {user.total_karma}</Text>
          <Text style={{ marginLeft: 20 }}>Friends: {user.num_friends}</Text>
        </View>
      </View>

      <View style={styles.subredditsContainer}>
        <Text style={{ marginTop: 10 }}>My Subreddits</Text>
        {subreddits.map((sub) => (
          <View key={sub.data.id} style={styles.subredditItem}>
            <Text>{sub.data.display_name_prefixed}</Text>
          </View>
        ))}
      </View>

      <Button title="Sign out" onPress={() => auth?.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    alignItems: "center",
    // flexDirection: "column",
  },
  profileImageContainer: {
    width: 100,
    height: 100,
  },
  profileImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  username: {
    fontSize: 17,
  },
  subredditsContainer: {
    // textAlign: "center",
    // backgroundColor: "white",
    paddingHorizontal: 10,
  },
  subredditItem: {
    paddingVertical: 5,
  },
});
