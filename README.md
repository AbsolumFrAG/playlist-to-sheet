# Playlist to Sheet

A Next.js application that converts YouTube playlists to Google Sheets. Simply enter a YouTube playlist URL, authenticate with Google, and get a formatted spreadsheet with all video titles and URLs.

## Features

- 🎥 YouTube playlist parsing and validation
- 📊 Google Sheets integration with automatic formatting
- 🔐 Secure Google OAuth authentication
- 🎨 Modern UI with dark/light theme support
- ⚡ Built with Next.js 15 and TypeScript

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm (recommended)
- Google API credentials (for Google Sheets and YouTube APIs)
- Firebase project (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd playlist-to-sheet
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Firebase configuration
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... etc
```

### Required Google APIs

The application requires Google API access for:
- Google Sheets API (creating and formatting spreadsheets)
- Google Drive API (file permissions)
- YouTube Data API v3 (reading playlist data)

Make sure to enable these APIs in your Google Cloud Console and configure OAuth consent screen.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Authentication**: Firebase Auth with Google OAuth
- **APIs**: Google Sheets API, Google Drive API, YouTube Data API v3
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

## Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   │   ├── sheets/     # Google Sheets integration
│   │   └── youtube/    # YouTube API integration
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # shadcn/ui base components
│   └── ...            # Application components
├── contexts/          # React contexts
├── lib/               # Utility functions
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the linter: `pnpm lint`
5. Submit a pull request

## License

This project is licensed under the MIT License.