import React from "react";
import { Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  promptAsync: any;
}

export default function SignIn({ promptAsync }: Props) {
  return (
    <SafeAreaView>
      <Button
        title="Sign in with Reddit"
        onPress={() => promptAsync({ useProxy: true })}
      />
    </SafeAreaView>
  );
}
