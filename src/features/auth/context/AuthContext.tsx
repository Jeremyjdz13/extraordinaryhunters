"use client"
import React, { useContext, useState, useEffect } from 'react';
import { auth } from '@/config/firebaseconfig';
import * as Auth from 'firebase/auth'

interface AuthContextValue {
  currentUser: Auth.User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<Auth.UserCredential>;
  signUp: (email: string, password: string, displayName: string) => Promise<Auth.UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateDisplayName: (newDisplayName: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export default AuthContext;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signUp(email: string, password: string, displayName: string) {
    const userCredential = await Auth.createUserWithEmailAndPassword(auth, email, password)

    if(userCredential.user) {
      await Auth.updateProfile(
          userCredential.user, {
          displayName,
        }
      );
      await userCredential.user.reload();
    }

    return userCredential;
  }

  async function signIn(email: string, password: string, rememberMe: boolean = false) {
    await Auth.setPersistence(auth, rememberMe ? Auth.browserLocalPersistence : Auth.browserSessionPersistence);
    return  Auth.signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    await Auth.signOut(auth);
    setCurrentUser(null);
  }

  function resetPassword(email: string) {
    return Auth.sendPasswordResetEmail(auth, email);
  }

  function updateEmail(email: string) {
    if (!auth.currentUser) throw new Error('User is not authenticated.');

    return Auth.updateEmail(auth.currentUser, email);
  }

  function updatePassword(password: string) {
     if (!auth.currentUser) throw new Error('User is not authenticated.')
     return Auth.updatePassword(auth.currentUser, password);     
  }

  async function updateDisplayName(newDisplayName: string) {
    
    if(!auth.currentUser) throw new Error('User is not authenticated')
    await Auth.updateProfile(auth.currentUser, {
      displayName: newDisplayName,
    });
   
    await auth.currentUser?.reload();
    setCurrentUser(auth.currentUser)
  }

  useEffect(() => {
    const unsubscribe = Auth.onAuthStateChanged(auth, (user) => {
      console.log("Auth State Changed")
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateEmail,
    updatePassword,
    updateDisplayName,
  }

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
}
