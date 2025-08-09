// Shared TypeScript interfaces for the application

// YouTube API Types
export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  description?: string;
  publishedAt?: string;
  thumbnails?: {
    default: string;
    medium: string;
    high: string;
  };
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description?: string;
  videos: YouTubeVideo[];
  totalVideos: number;
}

// Google Sheets API Types
export interface SheetsCreateRequest {
  playlistTitle: string;
  videos: YouTubeVideo[];
}

export interface SheetsCreateResponse {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  error?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Authentication Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken?: string;
}

// Component Props Types
export interface PlaylistConverterProps {
  className?: string;
}

export interface AuthButtonProps {
  className?: string;
}

// Form Types
export interface PlaylistFormData {
  playlistUrl: string;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Loading States
export interface LoadingStates {
  isLoading: boolean;
  isAuthenticating: boolean;
  isProcessingPlaylist: boolean;
  isCreatingSheet: boolean;
}