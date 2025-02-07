import { useEffect, useState } from "react";
import Image from "next/image";

export default function Dashboard() {
  const [topItems, setTopItems] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <h1 className="text-2xl font-bold mb-8">Your Spotify Top Items</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold mb-4">Top Tracks</h2>
          <div className="space-y-4">
            {topItems.tracks.map((track: any) => (
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
                    {track.artists.map((a: any) => a.name).join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Top Artists</h2>
          <div className="space-y-4">
            {topItems.artists.map((artist: any) => (
              <div key={artist.id} className="flex items-center gap-4">
                <Image
                  src={artist.images[2].url}
                  alt={artist.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <p className="font-medium">{artist.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 