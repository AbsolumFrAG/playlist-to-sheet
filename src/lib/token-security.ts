/**
 * Secure token management utilities
 * Provides secure storage and retrieval of authentication tokens
 */

import type { AuthUser } from "@/types";

const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";

export class SecureTokenManager {
  /**
   * Store token with expiration time
   */
  static storeToken(token: string, expiresIn: number = 3600): void {
    try {
      if (typeof window === "undefined") return;

      const expiryTime = Date.now() + expiresIn * 1000;

      // Store in sessionStorage (cleared when browser closes)
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  }

  /**
   * Retrieve token if it hasn't expired
   */
  static getToken(): string | null {
    try {
      if (typeof window === "undefined") return null;

      const token = sessionStorage.getItem(TOKEN_KEY);
      const expiryStr = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

      if (!token || !expiryStr) return null;

      const expiry = parseInt(expiryStr, 10);
      if (Date.now() > expiry) {
        // Token expired, clean up
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error("Failed to retrieve token:", error);
      return null;
    }
  }

  /**
   * Check if token is valid and not expired
   */
  static isTokenValid(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Clear stored token
   */
  static clearToken(): void {
    try {
      if (typeof window === "undefined") return;

      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error("Failed to clear token:", error);
    }
  }

  /**
   * Refresh token if needed (placeholder for future implementation)
   */
  static async refreshTokenIfNeeded(): Promise<boolean> {
    // This would integrate with Firebase Auth token refresh
    // For now, just check if token is still valid
    return this.isTokenValid();
  }
}

/**
 * Create secure headers for API requests
 */
export function createSecureHeaders(): HeadersInit {
  const token = SecureTokenManager.getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Sanitize user data before storing
 */
export function sanitizeUserData(user: AuthUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    // Don't store access token in user object
  };
}
