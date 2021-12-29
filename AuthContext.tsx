import React, {
  createContext,
  ReactChild,
  ReactChildren,
  Dispatch,
} from "react";

import type { Tokens, ReducerAction } from "./types";

export interface ContextValue {
  userTokens: Tokens | null;
  signOut: () => void;
  dispatch: Dispatch<ReducerAction>;
}

interface AuxProps {
  children: ReactChild | ReactChildren;
  value: ContextValue;
}

export const AuthContext = createContext<ContextValue | null>(null);

export function AuthContextProvider({ children, value }: AuxProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
