'use server'

import { spotifyApi } from '../../lib/spotify';
import BaseOpenAI from "openai";
// import { checkExistingResponse, saveResponse } from '../../lib/db';
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

export async function analyzeLineup(festivalId: string) {
  const accessToken = 'BQAQW4aPXG4TEE1DOud_ZMF_ELsp9U_Dr6pJD2AeXc8RTHHZkp-EEd96r2JG8Afg7_LA4LCSWKfzW2QcsOLM9wvmfhVrgmz8vlOoyZqS6wScC2D5jUvzN_JKPA-PIVQy6x1Kq1lo66B62a_T6HuQJauJ9wzZMuACJoL2NW69ZdXzERbmbhVPpE-5QTg1iEgUU044FC58940qB2czcQ29Zb7s7UZwecxUAU9zSY8';

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true 
  });

  const festival = FESTIVALS[festivalId];
  if (!festival) {
    throw new Error('Festival not found');
  }
  console.log("festival: ", festival);
  try {
    spotifyApi.setAccessToken(accessToken);
    const userProfile = await spotifyApi.getMe();
    const userId = userProfile.body.id;

    // Check for existing response
    // const existingResponse = await checkExistingResponse(userId, festivalId);
    // if (existingResponse) {
    //   return { recommendation: existingResponse };
    // }

    const topArtists = await spotifyApi.getMyTopArtists({ limit: 25 });

    console.log("topArtists: ", topArtists.body.items);
    const inputVars = {
      topArtists: topArtists.body.items.map(artist => artist.name).join(', '),
      // festivalName: festival.name,
      festivalArtists: festival.artists.join(', ')
    }

    let recommendation;
    if (promptLayerClient) {
      console.log("we here");
      const response = await promptLayerClient.run({
        promptName: "Lineup Searcher", 
        inputVariables: inputVars,
      });
      recommendation = response.raw_response.choices[0].message.content;
      console.log("recommendation: ", recommendation);
    }

    // Save the new response
    // await saveResponse(userId, festivalId, recommendation);

    return { recommendation };
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to analyze lineup');
  }
} 