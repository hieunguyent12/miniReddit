import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Buffer } from "buffer";

import { MY_SECURE_AUTH_STATE_KEY, REDDIT_CLIENT_ID } from "../constants";

type VoteType = "-1" | "1" | "0";

class RedditAPI {
  private access_token: string | null = null;
  private refresh_token: string | null = null;

  public setAuth(access_token: string, refresh_token: string) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
  }

  public async getMySubreddits() {
    const URL = "https://oauth.reddit.com/subreddits/mine/subscriber";

    return await this.fetchData(URL);
  }

  public async getPosts(
    subreddit: string,
    category: string = "hot",
    limit: number = 10,
    after?: string
  ) {
    let URL = `https://oauth.reddit.com/r/${subreddit}/${category}?limit=${limit}`;

    if (after) {
      URL += `&after=${after}`;
    }

    return await this.fetchData(URL);
  }

  public async getMyProfile() {
    const URL = "https://oauth.reddit.com/api/v1/me";

    return await this.fetchData(URL);
  }

  public async getComments(subreddit: string, postId: string, limit = 50) {
    const URL = `https://oauth.reddit.com/r/${subreddit}/comments/${postId}?threaded=${false}&sort=top&limit=${limit}`;

    return await this.fetchData(URL);
  }

  public async getMoreComments(postFullname: string, selection: string) {
    const URL = `http://oauth.reddit.com/api/morechildren?link_id=${postFullname}&children=${selection}&api_type=json`;

    return await this.fetchData(URL);
  }

  public async castVote(value: VoteType, id: string) {
    const URL = `https://oauth.reddit.com/api/vote?dir=${value}&id=${id}&rank=2`;

    const response = await fetch(URL, {
      headers: this.getFetchHeaders(),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  }

  private async fetchData(URL: string) {
    const response = await fetch(URL, {
      headers: this.getFetchHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return data;
  }

  private getFetchHeaders() {
    if (!this.access_token) {
      throw new Error("Access Token not provided.");
    }

    const headers = {
      Authorization: `Bearer ${this.access_token}`,
    };

    return headers;
  }

  // For every x minutes, we refresh the access token
  public autoRegenerateAccessToken() {
    if (!this.refresh_token) {
      throw new Error("Refresh Token is not provided");
    }

    const oneMinute = 60000;

    const TIME = oneMinute * 55; // 55 minutes

    let timer = setInterval(() => {
      if (!this.refresh_token) {
        clearInterval(timer);
        throw new Error("Refresh Token is not provided");
      }

      this.refreshAccessToken();
    }, TIME);
  }

  public async refreshAccessToken() {
    if (!this.refresh_token) {
      throw new Error("Refresh Token not provided");
    }

    const form = new FormData();
    form.append("refresh_token", this.refresh_token);
    form.append("grant_type", "refresh_token");

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `BASIC ${Buffer.from(
          REDDIT_CLIENT_ID + ":" + "",
          "utf8"
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });

    const tokenData = await response.json();

    if (!response.ok) {
      throw new Error("Unable to refresh access token");
    } else {
      if (tokenData) {
        this.setAuth(tokenData.access_token, tokenData.refresh_token);

        const storageValue = JSON.stringify({
          access_token: tokenData?.access_token,
          refresh_token: tokenData?.refresh_token,
        });

        if (Platform.OS !== "web") {
          // Securely store the auth on your device
          SecureStore.setItemAsync(MY_SECURE_AUTH_STATE_KEY, storageValue);
        }

        return tokenData.access_token;
      }
    }
  }
}

const redditAPI = new RedditAPI();

export default redditAPI;
