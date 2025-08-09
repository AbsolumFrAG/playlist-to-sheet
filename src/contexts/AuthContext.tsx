"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase.config";
import { SecureTokenManager, sanitizeUserData } from "@/lib/token-security";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isTokenValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Create sanitized user object
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          
          setUser(sanitizeUserData(authUser));
          
          // Check if we have a valid token
          const hasValidToken = SecureTokenManager.isTokenValid();
          setIsTokenValid(hasValidToken);
          
        } catch (error) {
          console.error('Error processing user authentication:', error);
          setUser(null);
          setIsTokenValid(false);
          SecureTokenManager.clearToken();
        }
      } else {
        setUser(null);
        setIsTokenValid(false);
        SecureTokenManager.clearToken();
      }
      setLoading(false);
    });

    // Cleanup token on page unload
    const handleBeforeUnload = () => {
      // Keep token in sessionStorage but clear any in-memory sensitive data
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        // Store token securely with expiration
        const expiresIn = 3600; // 1 hour
        SecureTokenManager.storeToken(credential.accessToken, expiresIn);
        setIsTokenValid(true);
      } else {
        throw new Error('Failed to obtain access token');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setIsTokenValid(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      SecureTokenManager.clearToken();
      setUser(null);
      setIsTokenValid(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isTokenValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

