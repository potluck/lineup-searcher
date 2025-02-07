import { queryParamString } from "../../../lib/spotify";
import { NextApiRequest, NextApiResponse } from 'next'; 

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Redirect URI:', process.env.SPOTIFY_REDIRECT_URI);
  const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&${queryParamString}`;
  res.redirect(authorizeURL);
}