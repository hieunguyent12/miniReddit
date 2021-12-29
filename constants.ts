import { makeRedirectUri } from "expo-auth-session";

export const REDDIT_CLIENT_ID = "mhZd9I7DO-6oKyGgzcz1XA";

export const ENDPOINTS = {
  authorizationEndpoint: "https://www.reddit.com/api/v1/authorize.compact",
  tokenEndpoint: "https://www.reddit.com/api/v1/access_token",
};

export const REDIRECT_URI = makeRedirectUri({
  useProxy: true,
});

export const MY_SECURE_AUTH_STATE_KEY = "MY_SECURE_AUTH_STATE_KEY";

export const OAUTH_SCOPES = ["identity", "mysubreddits", "read", "vote"];
