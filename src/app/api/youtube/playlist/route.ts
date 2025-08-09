import { google } from "googleapis";
import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse, handleApiError, validateRequiredFields, sanitizeUrl, rateLimiter } from "@/lib/api-utils";
import type { YouTubeVideo } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!rateLimiter.isAllowed(clientIp)) {
      return createErrorResponse(
        'Rate limit exceeded',
        'Too many requests. Please try again later.',
        429
      );
    }

    const body = await request.json();
    const { isValid, missingFields } = validateRequiredFields(body, ['playlistUrl', 'accessToken']);
    
    if (!isValid) {
      return createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        'Please provide all required information',
        400
      );
    }

    const { playlistUrl, accessToken } = body;
    
    // Sanitize and validate URL
    let sanitizedUrl: string;
    try {
      sanitizedUrl = sanitizeUrl(playlistUrl);
    } catch {
      // Allow playlist URLs that might not be full URLs
      if (typeof playlistUrl === 'string' && playlistUrl.trim()) {
        sanitizedUrl = playlistUrl.trim();
      } else {
        return createErrorResponse(
          'Invalid playlist URL',
          'Please provide a valid YouTube playlist URL',
          400
        );
      }
    }

    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(sanitizedUrl);
    if (!playlistId) {
      return createErrorResponse(
        'Invalid YouTube playlist URL',
        'Unable to extract playlist ID from the provided URL',
        400
      );
    }

    // Create OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Initialize YouTube API
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const videos: YouTubeVideo[] = [];
    let nextPageToken: string | undefined;

    do {
      const response = await youtube.playlistItems.list({
        part: ["snippet"],
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      if (response.data.items) {
        for (const item of response.data.items) {
          if (item.snippet?.title && item.snippet?.resourceId?.videoId) {
            videos.push({
              id: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
              description: item.snippet.description || undefined,
              publishedAt: item.snippet.publishedAt || undefined,
              thumbnails: item.snippet.thumbnails ? {
                default: item.snippet.thumbnails.default?.url || '',
                medium: item.snippet.thumbnails.medium?.url || '',
                high: item.snippet.thumbnails.high?.url || '',
              } : undefined,
            });
          }
        }
      }

      nextPageToken = response.data.nextPageToken || undefined;
    } while (nextPageToken);

    return createSuccessResponse(
      { videos },
      `Successfully fetched ${videos.length} videos from playlist`
    );
  } catch (error) {
    return handleApiError(error, 'YouTube Playlist API');
  }
}

function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const listParam = urlObj.searchParams.get("list");
    if (listParam) {
      return listParam;
    }
    
    // Check if it's a direct playlist ID
    if (url.startsWith("PL") || url.startsWith("UU") || url.startsWith("FL") || url.startsWith("RD")) {
      return url;
    }
    
    return null;
  } catch {
    // If URL parsing fails, check if it's just a playlist ID
    if (url.startsWith("PL") || url.startsWith("UU") || url.startsWith("FL") || url.startsWith("RD")) {
      return url;
    }
    return null;
  }
}