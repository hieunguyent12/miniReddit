import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Buffer } from "buffer";

import { REDDIT_CLIENT_ID } from "./constants";
import { AccessTokenResponseType } from "./types";

const ACCESS_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";

export const getAccessToken: (code: string) => AccessTokenResponseType = async (
  code
) => {
  try {
    const form = new FormData();
    form.append("code", code);
    form.append("grant_type", "authorization_code");
    form.append("redirect_uri", makeRedirectUri({ useProxy: true }));

    // TODO is it safe to expose REDDIT_CLIENT_ID or should we make a proxy server to make this request?
    const response = await fetch(ACCESS_TOKEN_URL, {
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

    const data = await response.json();

    if (data.error) {
      return null;
    }

    return data;
  } catch (e) {
    console.log("error when retrieving access token", e);
    return null;
  }
};

export function fixLink(url: string) {
  const newUrl = url.replace(/amp;/g, "");

  return newUrl;
}
