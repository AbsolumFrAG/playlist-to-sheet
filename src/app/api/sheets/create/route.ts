import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  rateLimiter,
  validateRequiredFields,
} from "@/lib/api-utils";
import type { SheetsCreateRequest, YouTubeVideo } from "@/types";
import { google } from "googleapis";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    if (!rateLimiter.isAllowed(clientIp)) {
      return createErrorResponse(
        "Rate limit exceeded",
        "Too many requests. Please try again later.",
        429
      );
    }

    const body = await request.json();
    const { isValid, missingFields } = validateRequiredFields(body, [
      "videos",
      "playlistTitle",
      "accessToken",
    ]);

    if (!isValid) {
      return createErrorResponse(
        `Missing required fields: ${missingFields.join(", ")}`,
        "Please provide all required information",
        400
      );
    }

    const {
      videos,
      playlistTitle,
      accessToken,
    }: SheetsCreateRequest & { accessToken: string } = body;

    if (!Array.isArray(videos) || videos.length === 0) {
      return createErrorResponse(
        "Invalid videos data",
        "Videos must be a non-empty array",
        400
      );
    }

    // Create OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Initialize Sheets API
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `YouTube Playlist: ${
            playlistTitle || new Date().toLocaleDateString()
          }`,
        },
        sheets: [
          {
            properties: {
              title: "Videos",
              gridProperties: {
                rowCount: videos.length + 1,
                columnCount: 2,
              },
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error("Failed to create spreadsheet");
    }

    // Get the actual sheet ID from the created spreadsheet
    const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId;
    if (sheetId === undefined) {
      throw new Error("Failed to get sheet ID");
    }

    // Prepare data for the spreadsheet
    const values = [
      ["Video Title", "Video URL"], // Header row
      ...videos.map((video: YouTubeVideo) => [video.title, video.url]),
    ];

    // Update the spreadsheet with data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Videos!A1:B" + (videos.length + 1),
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    // Format the header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.2,
                    blue: 0.2,
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1,
                      green: 1,
                      blue: 1,
                    },
                    fontSize: 11,
                    bold: true,
                  },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetId,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 2,
              },
            },
          },
        ],
      },
    });

    // Return the URL to the created spreadsheet
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    return createSuccessResponse(
      {
        spreadsheetId,
        spreadsheetUrl,
        videoCount: videos.length,
      },
      `Successfully created spreadsheet with ${videos.length} videos`
    );
  } catch (error) {
    return handleApiError(error, "Google Sheets API");
  }
}
