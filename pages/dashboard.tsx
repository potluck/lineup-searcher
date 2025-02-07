import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type TimeRange = 'shortTerm' | 'mediumTerm' | 'longTerm';

// Add these interfaces at the top of the file
interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  timeRanges?: TimeRange[]; // Used in our unique artists list
}

interface SpotifyAlbum {
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

interface TopItems {
  artists: {
    shortTerm: SpotifyArtist[];
    mediumTerm: SpotifyArtist[];
    longTerm: SpotifyArtist[];
  };
  tracks: SpotifyTrack[];
}

export default function Dashboard() {
  const [topItems, setTopItems] = useState<TopItems | null>(null);
  const [loading, setLoading] = useState(true);

  const getBadgeColor = (range: TimeRange) => {
    switch (range) {
      case 'shortTerm': return 'bg-blue-500';
      case 'mediumTerm': return 'bg-purple-500';
      case 'longTerm': return 'bg-green-500';
    }
  };

  const getBadgeText = (range: TimeRange) => {
    switch (range) {
      case 'shortTerm': return '4W';
      case 'mediumTerm': return '6M';
      case 'longTerm': return 'ALL-TIME';
    }
  };

  const getAllUniqueArtists = () => {
    if (!topItems) return [];

    const artistMap = new Map<string, SpotifyArtist & { timeRanges: TimeRange[] }>();

    const addArtistsFromTimeRange = (artists: SpotifyArtist[], timeRange: TimeRange) => {
      artists.forEach((artist) => {
        if (artistMap.has(artist.id)) {
          const existing = artistMap.get(artist.id)!;
          artistMap.set(artist.id, { ...existing, timeRanges: [...existing.timeRanges, timeRange] });
        } else {
          artistMap.set(artist.id, { ...artist, timeRanges: [timeRange] });
        }
      });
    };

    // Add artists from all time ranges
    addArtistsFromTimeRange(topItems.artists.shortTerm, 'shortTerm');
    addArtistsFromTimeRange(topItems.artists.mediumTerm, 'mediumTerm');
    addArtistsFromTimeRange(topItems.artists.longTerm, 'longTerm');

    // Convert map to array and sort by number of time ranges (most present first)
    return Array.from(artistMap.values()).sort((a, b) =>
      b.timeRanges.length - a.timeRanges.length
    );
  };

  useEffect(() => {
    fetch("/api/spotify/top-items")
      .then((res) => res.json())
      .then((data) => {
        setTopItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!topItems) return <div>Not authenticated</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Spotify Top Items</h1>
        <Link
          href="/lineup-searcher"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
        >
          Find Festival Matches
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold mb-4">Top Tracks</h2>
          <div className="space-y-4">
            {topItems.tracks.map((track: SpotifyTrack) => (
              <div key={track.id} className="flex items-center gap-4">
                <Image
                  src={track.album.images[2].url}
                  alt={track.name}
                  width={40}
                  height={40}
                />
                <div>
                  <p className="font-medium">{track.name}</p>
                  <p className="text-sm text-gray-600">
                    {track.artists.map((a: SpotifyArtist) => a.name).join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Top Artists</h2>
          <div className="space-y-4">
            {getAllUniqueArtists().map((artist: SpotifyArtist & { timeRanges: TimeRange[] }) => (
              <div key={artist.id} className="flex items-center gap-4">
                <Image
                  src={artist.images[2].url}
                  alt={artist.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <p className="font-medium">{artist.name}</p>
                  <div className="flex gap-1 mt-1">
                    {artist.timeRanges.map((range: TimeRange) => (
                      <span
                        key={range}
                        className={`${getBadgeColor(range)} text-white text-xs px-2 py-0.5 rounded-full`}
                      >
                        {getBadgeText(range)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 