import { NextApiRequest, NextApiResponse } from 'next';
import { spotifyApi } from '../../lib/spotify';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This would normally be in a separate file
const FESTIVALS: Record<string, { name: string; artists: string[] }> = {
  'coachella-2024': {
    name: 'Coachella 2024',
    artists: ['Tyler, The Creator', 'Doja Cat', 'Lana Del Rey', 'No Doubt', 'Justice', 'Blur']
  },
  'glastonbury-2024': {
    name: 'Glastonbury 2024',
    artists: ['Coldplay', 'Dua Lipa', 'SZA', 'Foo Fighters', 'The Killers']
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { festivalId } = req.body;
  const festival = FESTIVALS[festivalId];

  if (!festival) {
    return res.status(404).json({ error: 'Festival not found' });
  }

  const access_token = req.cookies.spotify_access_token;
  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    spotifyApi.setAccessToken(access_token);
    const topArtists = await spotifyApi.getMyTopArtists({ limit: 20 });
    
    const prompt = `As a music expert, analyze this music fan's top artists and recommend which artists they should see at an upcoming festival.

User's top artists: ${topArtists.body.items.map(artist => artist.name).join(', ')}

Festival: ${festival.name}
Festival lineup: ${festival.artists.join(', ')}

Please provide a friendly, conversational recommendation about which festival artists they might enjoy based on their music taste. Explain the connections between their favorite artists and the festival artists. Keep the response under 200 words.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 300,
    });

    const recommendation = completion.choices[0]?.message?.content || 
      "Sorry, I couldn't generate a recommendation at this time.";

    res.status(200).json({ recommendation });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze lineup' });
  }
} 