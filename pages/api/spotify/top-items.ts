import { spotifyApi } from "../../../lib/spotify";
import { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access_token = req.cookies.spotify_access_token;

  if (!access_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    spotifyApi.setAccessToken(access_token);
    
    const [tracksResponse, artistsResponse] = await Promise.all([
      spotifyApi.getMyTopTracks({ limit: 10 }),
      spotifyApi.getMyTopArtists({ limit: 10 }),
    ]);

    res.status(200).json({
      tracks: tracksResponse.body.items,
      artists: artistsResponse.body.items,
    });
  } catch (error) {
    console.error("Error fetching top items:", error);
    res.status(500).json({ error: "Failed to fetch top items" });
  }
} 