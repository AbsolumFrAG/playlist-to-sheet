"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { SecureTokenManager, createSecureHeaders } from "@/lib/token-security";
import type { PlaylistConverterProps, LoadingStates, ApiResponse, YouTubeVideo } from "@/types";

export function PlaylistConverter({ className }: PlaylistConverterProps = {}) {
  const { user } = useAuth();
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    isLoading: false,
    isAuthenticating: false,
    isProcessingPlaylist: false,
    isCreatingSheet: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Memoized computed values
  const isValidUrl = useMemo(() => {
    if (!playlistUrl.trim()) return false;
    try {
      const url = new URL(playlistUrl);
      return url.hostname.includes('youtube.com') && url.searchParams.has('list');
    } catch {
      return false;
    }
  }, [playlistUrl]);

  const isProcessing = loadingStates.isLoading || loadingStates.isProcessingPlaylist || loadingStates.isCreatingSheet;

  const handleConvert = useCallback(async () => {
    if (!isValidUrl) {
      setError("Please enter a valid YouTube playlist URL");
      return;
    }

    setLoadingStates({ isLoading: true, isAuthenticating: false, isProcessingPlaylist: false, isCreatingSheet: false });
    setError(null);
    setSuccess(null);

    try {
      // Get the access token securely
      const accessToken = SecureTokenManager.getToken();
      if (!accessToken) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      // Fetch playlist videos through API route
      setLoadingStates(prev => ({ ...prev, isProcessingPlaylist: true }));
      
      const playlistResponse = await fetch("/api/youtube/playlist", {
        method: "POST",
        headers: createSecureHeaders(),
        body: JSON.stringify({
          playlistUrl,
          accessToken,
        }),
      });

      if (!playlistResponse.ok) {
        const errorData: ApiResponse = await playlistResponse.json();
        throw new Error(errorData.error || "Failed to fetch playlist");
      }

      const playlistData: ApiResponse<{ videos: YouTubeVideo[] }> = await playlistResponse.json();
      const videos = playlistData.data?.videos || [];
      
      if (!videos || videos.length === 0) {
        throw new Error("No videos found in the playlist");
      }

      // Create spreadsheet through API route
      setLoadingStates(prev => ({ ...prev, isProcessingPlaylist: false, isCreatingSheet: true }));
      
      const sheetResponse = await fetch("/api/sheets/create", {
        method: "POST",
        headers: createSecureHeaders(),
        body: JSON.stringify({
          videos,
          playlistName: `Playlist - ${new Date().toLocaleDateString()}`,
          accessToken,
        }),
      });

      if (!sheetResponse.ok) {
        const errorData: ApiResponse = await sheetResponse.json();
        throw new Error(errorData.error || "Failed to create spreadsheet");
      }

      const sheetData: ApiResponse<{ spreadsheetUrl: string }> = await sheetResponse.json();
      const spreadsheetUrl = sheetData.data?.spreadsheetUrl;
      
      if (spreadsheetUrl) {
        setSuccess(spreadsheetUrl);
        setPlaylistUrl("");
      } else {
        throw new Error("Failed to get spreadsheet URL");
      }
    } catch (err) {
      console.error('Playlist conversion error:', err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoadingStates({ isLoading: false, isAuthenticating: false, isProcessingPlaylist: false, isCreatingSheet: false });
    }
  }, [playlistUrl, isValidUrl]);

  if (!user) {
    return (
      <div className="text-center p-8 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground mb-4">
          Please sign in with Google to convert YouTube playlists to Google Sheets
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-6 ${className || ''}`}>
      <div className="space-y-2">
        <label htmlFor="playlist-url" className="text-sm font-medium">
          YouTube Playlist URL
        </label>
        <div className="flex gap-2">
          <input
            id="playlist-url"
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://www.youtube.com/playlist?list=..."
            className="flex-1 px-3 py-2 border rounded-md bg-background"
            disabled={isProcessing}
          />
          <Button onClick={handleConvert} disabled={isProcessing || !isValidUrl}>
            {loadingStates.isProcessingPlaylist ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching videos...
              </>
            ) : loadingStates.isCreatingSheet ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating sheet...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Convert to Sheet
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Success!</p>
              <p className="text-sm">Your Google Sheet has been created.</p>
            </div>
          </div>
          <a
            href={success}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            Open Spreadsheet →
          </a>
        </div>
      )}

      <div className="text-sm text-muted-foreground space-y-1">
        <p>• Enter a YouTube playlist URL to convert it to a Google Sheet</p>
        <p>• The sheet will contain video titles and URLs in two columns</p>
        <p>• Make sure the playlist is public or you have access to it</p>
      </div>
    </div>
  );
}