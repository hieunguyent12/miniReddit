export type Tokens = { access_token: string; refresh_token: string };

export interface User {
  name: string;
  total_karma: number;
  num_friends: number;
  id: string;
  snoovatar_img: string;
  [key: string]: any;
}

export interface PostType {
  data: {
    id: string;
    name: string;
    title: string;
    over_18: boolean;
    selftext: string;
    thumbnail: string;
    thumbnail_height: number;
    thumbnail_width: number;
    url: string;
    score: number;
    num_comments: number;
    author: string;
    post_hint: string;
    subreddit: string;
    subreddit_id: string;
    subreddit_name_prefixed: string;
    likes: null | boolean;
    preview?: {
      images: Array<{
        id: string;
        resolutions: Array<{ height: number; width: number; url: string }>;
      }>;
    };
    media_metadata?: {
      [key: string]: {
        e: string;
        id: string;
        m: string;
        p: Array<{
          u: string;
          x: number;
          y: number;
        }>;
      };
    };
    gallery_data?: {
      items: Array<{ id: number; media_id: string }>;
    };
    [key: string]: any;
  };
}

export interface CommentType {
  id: string;
  body?: string;
  author?: string;
  parent_id: string;
  score?: number;
  vote: null | boolean;
  loadMore: boolean; // indicate whether or not this comment has replies (children)
  collapsed?: boolean;
  count?: number; // the number of the rest of the comments that can be fetched
  loadMoreIds?: string[]; // The ids of the comments that need to be fetched when clicking on "load more comments"
}

export interface MoreCommentType {
  id: string;
  parent_id: string;
  loadMore: boolean;
  count: number;
  loadMoreIds: string[];
  author: null;
}

export type FetchResponseCommentType =
  | {
      kind: "t1";
      data: {
        body: string;
        author: string;
        id: string;
        parent_id: string;
        score: number;
        likes: null | boolean;
        [key: string]: any;
      };

      // count: number,
    }
  | {
      kind: "more";

      data: {
        count: number;
        parent_id: string;
        id: string;
        children: string[];
      };
    };

export type FetchResponseMoreCommentType = {
  kind: "more";
  count: number;
  children: string[];
};

export interface Subreddit {
  data: {
    id: string;
    display_name_prefixed: string;
  };
}

export type AccessTokenResponseType = Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: number;
  scope: string;
  token_type: string;
} | null>;

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userTokens: Tokens | null;
  error: boolean;
}

export type ReducerAction = {
  type: "RESTORE_TOKEN" | "SIGN_IN" | "SIGN_OUT" | "AUTH_ERROR";
  payload?: any;
};
