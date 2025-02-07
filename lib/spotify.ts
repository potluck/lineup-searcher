import SpotifyWebApi from "spotify-web-api-node";

const scopes = [
  "user-top-read",
  "user-read-private",
  "user-read-email",
].join(" ");

const params = {
  scope: scopes,
};

const queryParamString = new URLSearchParams(params).toString();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export { spotifyApi, queryParamString }; 