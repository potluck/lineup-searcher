import { NextApiRequest, NextApiResponse } from 'next';
import { spotifyApi } from '../../lib/spotify';
import OpenAI from 'openai';
import { checkExistingResponse, saveResponse } from '../../lib/db';


export const FESTIVALS: Record<string, { name: string; id: string; artists: string[] }> = {
  'edc-korea-2025': {
    name: 'EDC Korea 2025',
    id: 'edc-korea-2025',
    artists: [
      '2Spade', '5sta', 'ACRAZE', 'Advanced', 'AK Sports', 'Apachi', 'APRO', 'ARMNHMR',
      'Aster + Neo', 'ATLiens', 'Avalon', 'Bagagee Viphex13', 'Benny Benassi',
      'Black Tiger Sex Machine', 'Blastoyz', 'BLOND:ISH', 'Boys Noize', 'Casepeat',
      'Charlotte de Witte', 'ChaseWest', 'Closet Yi', 'Conan', 'Cream + Pure 100%',
      'Da Tweekaz', 'Deorro', 'Devault', 'Dillon Francis', 'DJ Sally', 'Dom Dolla',
      'Eli Brown', 'GANJA', 'Giuseppe Ottaviani', 'Howmini', 'I Hate Models', 'Illenium',
      'IÖN', 'IZREAL', 'jeonghyeon', 'Jessica Audiffred', 'Joody + Roha', 'Kataploks',
      'Layton Giordani', 'Loud Luxury', 'Maddix', 'Malaa', 'MaRLo', 'Martin Garrix',
      'Matroda', 'Mia Moretti', 'Miu', 'MORTEN', 'Nifra', 'Paul van Dyk', 'Peggy Gou',
      'Pierre Blanche', 'Raiden', 'Roots', 'Rubato', 'Sam Feldt', 'SAYMYNAME',
      'Skrillex', 'Sosa', 'Steve Aoki', 'Sub Zero Project', 'Trym',
      'Vandal Rock + Glory', 'Yann', 'Yungin'
    ]
  },
  'lib-2025': {
    name: 'Lightning in a Bottle 2025',
    id: 'lib-2025',
    artists: [
      'AHADADREAM', 'Amaarae', 'AndreasOne & FMLY BZNS', 'Audrey Nuna', 'Azzecca',
      'Bianca Oblivion', 'BIIANCO', 'Black House Radio', 'Bou', 'Brijean',
      'Cesco', 'Channel Tres', 'Chloé Caillet', 'Claude VonStroke', 'Coco & Breezy',
      'Dimond Saints', 'Dust and Beau', 'Eli & Fur', 'EPISCOOL', 'Flowdan',
      'Four Tet', 'Francis Mercier', 'Girl Math (VNSSA & NALA)', 'Gru.di', 'Hamdi',
      'Hybrid Minds', 'Interplanetary Criminal', 'Jade Cicada', 'Jaguar', 'Jamie xx',
      'John Summit', 'Jo Jones', 'Joy Orbison', 'Just Her', 'Khruangbin',
      'Kiasmos', 'KILIMANJARO', 'KNGSPRNGS', 'Kito', 'LEISAN',
      'Magdalena Bay', 'Mary Droppinz', 'Mira', 'MNTRA', 'Monolink',
      'O\'Snap', 'PEEKABOO', 'Priya Ragu', 'Rafael', 'Reyna Tropical',
      'salute', 'Sama\' Abdulhadi', 'Sammy Virji', 'Shygirl', 'Sicaria',
      'Sofia Kourtesis', 'Subtronics', 'Sultan + Shepard', 'SYREETA', 'Taiki Nulight',
      'TAPE B', 'The Blessed Madonna', 'The Librarian', 'Tinlicker', 'Tinzo + Jojo',
      'TroyBoi', 'Underworld', 'Yaw Appiah'
    ]
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

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
    const userProfile = await spotifyApi.getMe();
    const userId = userProfile.body.id;

    // Check for existing response
    const existingResponse = await checkExistingResponse(userId, festivalId);
    if (existingResponse) {
      return res.status(200).json({ recommendation: existingResponse });
    }

    const topArtists = await spotifyApi.getMyTopArtists({ limit: 25 });

    const prompt = `User's top artists: ${topArtists.body.items.map(artist => artist.name).join(', ')}

Festival: ${festival.name}
Festival lineup: ${festival.artists.join(', ')}

Please provide a list of festival artists they might enjoy based on their music taste. Include one set of artists that they already know, and another of ones they don't. Explain the connection to their favorite artists, for the ones they don't already know. Keep the response under 400 words.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "As a music expert, analyze this music fan's top artists and recommend which artists, particularly those that are lesser-known, they should see at an upcoming festival. Format it as an HTML list." },
        { role: "user", content: prompt },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 300,
    });

    const recommendation = completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a recommendation at this time.";

    // Save the new response
    await saveResponse(userId, festivalId, recommendation);

    res.status(200).json({ recommendation });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze lineup' });
  }
} 