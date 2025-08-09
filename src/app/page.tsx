import { AuthButton } from "@/components/AuthButton";
import { PlaylistConverter } from "@/components/PlaylistConverter";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { FileSpreadsheet } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Playlist to Sheet</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Convert YouTube Playlists to Google Sheets
            </h2>
            <p className="text-xl text-muted-foreground">
              Transform any YouTube playlist into an organized Google Sheet with video titles and URLs
            </p>
          </div>

          {/* Converter Section */}
          <div className="bg-card rounded-lg border p-8">
            <PlaylistConverter />
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="font-semibold">Secure Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Sign in with your Google account securely through Firebase
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold">Instant Conversion</h3>
              <p className="text-sm text-muted-foreground">
                Convert playlists to organized spreadsheets in seconds
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🎥</span>
              </div>
              <h3 className="font-semibold">Complete Data</h3>
              <p className="text-sm text-muted-foreground">
                Get video titles and direct URLs in a clean format
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}