import { StatusBar } from "expo-status-bar";
import React, {
  createContext,
  useEffect,
  useState,
  useMemo,
  useReducer,
  Reducer,
  Dispatch,
} from "react";
import { Button, StyleSheet, Text, View, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuth } from "./hooks";
import { MY_SECURE_AUTH_STATE_KEY } from "./constants";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import { AuthContextProvider } from "./AuthContext";
import type { Tokens, AuthState, ReducerAction } from "./types";
import Post from "./pages/Post";
import RedditAPI from "./redditAPI";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const authStateReducer: Reducer<AuthState, ReducerAction> = (
  prevState,
  action
) => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...prevState,
        userTokens: action.payload.tokens,
        isLoading: false,
      };
    case "SIGN_IN":
      return {
        ...prevState,
        isSignout: false,
        userTokens: action.payload.tokens,
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        isSignout: true,
        userTokens: null,
      };
    case "AUTH_ERROR":
      return {
        ...prevState,
        userTokens: null,
        isLoading: false,
        error: true,
      };
    default:
      return prevState;
  }
};

export default function App() {
  const [authState, dispatch] = useReducer(authStateReducer, {
    isLoading: true,
    isSignout: false,
    userTokens: null,
    error: false,
  });
  const [request, response, promptAsync] = useAuth(dispatch);

  const authContextValue = useMemo(
    () => ({
      userTokens: authState.userTokens,
      signOut: async () => {
        // TODO remove the tokens from the storage
        await SecureStore.deleteItemAsync(MY_SECURE_AUTH_STATE_KEY);
        // const tokensString = await SecureStore.getItemAsync(
        //   MY_SECURE_AUTH_STATE_KEY
        // );

        // if (!tokensString) {
        //   console.log("error signing out");
        //   return;
        // }

        // const tokens = JSON.parse(tokensString);

        // const newTokens = {
        //   ...tokens,
        //   access_token: "",
        // };

        // await SecureStore.setItemAsync(MY_SECURE_AUTH_STATE_KEY, newTokens);

        dispatch({ type: "SIGN_OUT" });
      },
      dispatch,
    }),
    [authState]
  );

  useEffect(() => {
    // Initial check when user starts app to see if we already have tokens
    async function getAuthData() {
      try {
        let tokensString = await SecureStore.getItemAsync(
          MY_SECURE_AUTH_STATE_KEY
        );

        if (!tokensString) {
          // no tokens, user must sign in
          dispatch({
            type: "AUTH_ERROR",
          });
          return;
        }

        const tokens: Tokens = JSON.parse(tokensString);

        RedditAPI.setAuth(tokens.access_token, tokens.refresh_token);

        const newAccessToken = await RedditAPI.refreshAccessToken();

        tokens.access_token = newAccessToken;

        dispatch({
          type: "RESTORE_TOKEN",
          payload: {
            tokens,
          },
        });

        RedditAPI.autoRegenerateAccessToken();
      } catch (e) {
        // failed to retrieve tokens
        dispatch({
          type: "AUTH_ERROR",
        });
        return;
      }
    }

    getAuthData();
  }, []);

  const isSignedIn = !!authState.userTokens;

  return (
    <SafeAreaProvider>
      {authState.isLoading ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Loading...</Text>
        </View>
      ) : (
        <NavigationContainer>
          <AuthContextProvider value={authContextValue}>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              {isSignedIn ? (
                <>
                  <Stack.Screen name="Home" component={Home} />
                </>
              ) : (
                <Stack.Screen
                  name="SignIn"
                  options={
                    {
                      // animationTypeForReplace: authState.isSignout ? "pop" : "push",
                    }
                  }
                >
                  {(props) => <SignIn {...props} promptAsync={promptAsync} />}
                </Stack.Screen>
              )}
            </Stack.Navigator>
          </AuthContextProvider>
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 30,
    padding: 10,
  },
  description: {
    fontSize: 15,
    marginBottom: 10,
  },
});
