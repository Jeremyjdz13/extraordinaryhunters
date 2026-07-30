import { createContext } from "react";
import type { User, UserCredential } from "firebase/auth";

export type AuthContextValue = {
  currentUser: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<UserCredential>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
