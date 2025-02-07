import { spotifyApi } from "../../../lib/spotify";
import { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    const { access_token, refresh_token } = data.body;

    // Store tokens in cookies or session
    res.setHeader("Set-Cookie", [
      `spotify_access_token=${access_token}; Path=/; HttpOnly`,
      `spotify_refresh_token=${refresh_token}; Path=/; HttpOnly`,
    ]);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.redirect("/?error=spotify_auth_failed");
  }
} 