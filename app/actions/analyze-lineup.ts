'use server'

import { spotifyApi } from '../../lib/spotify';
import BaseOpenAI from "openai";
import { checkExistingResponse, saveResponse } from '../../lib/db';
import { cookies } from 'next/headers';
import { FESTIVALS } from '../../lib/festivals'

let promptLayerClient: any;
let OpenAI: any;

// Only import PromptLayer on the server side
if (typeof window === 'undefined') {
  const { PromptLayer } = require('promptlayer');
  promptLayerClient = new PromptLayer({ 
    apiKey: process.env.PROMPTLAYER_API_KEY
  });
  OpenAI = promptLayerClient.OpenAI;
} else {
  OpenAI = BaseOpenAI;
}

export async function analyzeLineup(festivalId: string, accessToken: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true 
  });

  const festival = FESTIVALS[festivalId];
  if (!festival) {
    throw new Error('Festival not found');
  }

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    spotifyApi.setAccessToken(accessToken);
    const userProfile = await spotifyApi.getMe();
    const userId = userProfile.body.id;

    // Check for existing response
    const existingResponse = await checkExistingResponse(userId, festivalId);
    if (existingResponse) {
      return { recommendation: existingResponse };
    }

    const topArtists = await spotifyApi.getMyTopArtists({ limit: 25 });

    const inputVars = {
      topArtists: topArtists.body.items.map(artist => artist.name).join(', '),
      festivalName: festival.name,
      festivalArtists: festival.artists.join(', ')
    }

    let recommendation;
    if (promptLayerClient) {
      const response = await promptLayerClient.run({
        promptName: "Lineup Searcher", 
        inputVariables: inputVars,
      });
      recommendation = response.raw_response.choices[0].message.content;
    }

    // Save the new response
    await saveResponse(userId, festivalId, recommendation);

    return { recommendation };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to analyze lineup');
  }
} 