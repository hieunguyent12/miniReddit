import { useAuthRequest } from "expo-auth-session";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import {
  ENDPOINTS,
  REDIRECT_URI,
  REDDIT_CLIENT_ID,
  MY_SECURE_AUTH_STATE_KEY,
  OAUTH_SCOPES,
} from "./constants";
import { getAccessToken } from "./utils";
import { ContextValue } from "./AuthContext";
import { Tokens } from "./types";

export const useAuth = (dispatch: any) => {
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: REDDIT_CLIENT_ID,
      scopes: OAUTH_SCOPES,
      redirectUri: REDIRECT_URI,
      extraParams: {
        duration: "permanent",
        response_type: "code",
      },
    },
    ENDPOINTS
  );

  useEffect(() => {
    async function fetchData() {
      if (response?.type === "success") {
        const { code } = response.params;

        const tokenData = await getAccessToken(code as string);

        if (!tokenData) {
          return;
        }

        dispatch({
          type: "RESTORE_TOKEN",
          payload: {
            tokens: {
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token,
            },
          },
        });

        const storageValue = JSON.stringify({
          access_token: tokenData?.access_token,
          refresh_token: tokenData?.refresh_token,
        });

        if (Platform.OS !== "web") {
          // Securely store the auth on your device
          SecureStore.setItemAsync(MY_SECURE_AUTH_STATE_KEY, storageValue);
        }
      }
    }

    fetchData();
  }, [response]);

  return [request, response, promptAsync];
};

export const useAPI = (auth: ContextValue | null) => {
  const fetchSubreddits = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${auth?.userTokens?.access_token}`,
      };
      // const response = await fetch("https://oauth.reddit.com/api/v1/me", {
      // headers: {
      //   Authorization: `Bearer ${auth?.userTokens?.access_token}`,
      // },
      // });

      const response = await fetch(
        "https://oauth.reddit.com/subreddits/mine/subscriber",
        {
          headers,
        }
      );

      const subreddits = await response.json();

      // let [user, subreddits] = await Promise.all([
      //   fetch("https://oauth.reddit.com/api/v1/me", { headers }).then((res) =>
      //     res.json()
      //   ),
      //   fetch("https://oauth.reddit.com/subreddits/mine/subscriber", {
      //     headers,
      //   }).then((res) => res.json()),
      // ]);

      // subreddits.data.children.forEach((a) => {
      //   console.log(a.data.display_name_prefixed);
      // });
    } catch (e) {
      // use refresh_token to get new access_token
      console.log(e);

      async function getTokens() {
        const tokensString = await SecureStore.getItemAsync(
          MY_SECURE_AUTH_STATE_KEY
        );

        if (!tokensString) {
          // No tokens were stored, sign in is required
          return;
        }

        const tokens: Tokens = JSON.parse(tokensString);

        if (!tokens.refresh_token) {
          return;
        }

        const form = new FormData();
        form.append("refresh_token", tokens.refresh_token);
        form.append("grant_type", "refresh_token");

        const response = await fetch(
          "https://www.reddit.com/api/v1/access_token",
          {
            method: "POST",
            headers: {
              Authorization: `BASIC ${Buffer.from(
                REDDIT_CLIENT_ID + ":" + "",
                "utf8"
              ).toString("base64")}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form,
          }
        );

        const tokenData = await response.json();

        if (tokenData && auth) {
          auth.dispatch({
            type: "RESTORE_TOKEN",
            payload: {
              tokens: tokenData,
            },
          });
          // store new access token
          const storageValue = JSON.stringify({
            access_token: tokenData?.access_token,
            refresh_token: tokenData?.refresh_token,
          });

          if (Platform.OS !== "web") {
            // Securely store the auth on your device
            SecureStore.setItemAsync(MY_SECURE_AUTH_STATE_KEY, storageValue);
          }
        }
      }

      // getTokens();
      return;
    }
  };

  return {
    fetchSubreddits,
  };
};
