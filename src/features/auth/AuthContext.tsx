import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
} from "firebase/auth";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth } from "../../lib/firebase";
import { AuthContext, type AuthContextValue } from "./authContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthContextValue["currentUser"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      loading,
      async signIn(email, password, rememberMe = false) {
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence,
        );

        return signInWithEmailAndPassword(auth, email, password);
      },
      async signUp(email, password, displayName) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        if (credential.user) {
          await updateProfile(credential.user, { displayName });
          await credential.user.reload();
          setCurrentUser(auth.currentUser);
        }

        return credential;
      },
      async signOut() {
        await firebaseSignOut(auth);
        setCurrentUser(null);
      },
      resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
      },
      updateEmail(email) {
        if (!auth.currentUser) {
          throw new Error("User is not authenticated.");
        }

        return firebaseUpdateEmail(auth.currentUser, email);
      },
      updatePassword(password) {
        if (!auth.currentUser) {
          throw new Error("User is not authenticated.");
        }

        return firebaseUpdatePassword(auth.currentUser, password);
      },
      async updateDisplayName(displayName) {
        if (!auth.currentUser) {
          throw new Error("User is not authenticated.");
        }

        await updateProfile(auth.currentUser, { displayName });
        await auth.currentUser.reload();
        setCurrentUser(auth.currentUser);
      },
    }),
    [currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
