import { spotifyApi } from "../../../lib/spotify";
import { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const access_token = req.cookies.spotify_access_token;
  console.log("access_token: ", access_token);

  if (!access_token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    spotifyApi.setAccessToken(access_token);

    const [
      tracksResponse,
      shortTermArtists,
      mediumTermArtists,
      longTermArtists
    ] = await Promise.all([
      spotifyApi.getMyTopTracks({ limit: 10 }),
      spotifyApi.getMyTopArtists({ limit: 25, time_range: 'short_term' }),
      spotifyApi.getMyTopArtists({ limit: 25, time_range: 'medium_term' }),
      spotifyApi.getMyTopArtists({ limit: 25, time_range: 'long_term' }),
    ]);

    console.log("short term: ", shortTermArtists.body.items.length);
    console.log("medium term: ", mediumTermArtists.body.items.length);
    console.log("long term: ", longTermArtists.body.items.length);


    res.status(200).json({
      tracks: tracksResponse.body.items,
      artists: {
        shortTerm: shortTermArtists.body.items,
        mediumTerm: mediumTermArtists.body.items,
        longTerm: longTermArtists.body.items
      }
    });
  } catch (error) {
    console.error("Error fetching top items:", error);
    res.status(500).json({ error: "Failed to fetch top items" });
  }
} 