
'use server';

/**
 * @fileOverview A flow to fetch audio from YouTube.
 *
 * - getYoutubeAudio - A function that fetches audio and thumbnail from an external API.
 * - GetYoutubeAudioInput - The input type for the getYoutubeAudio function.
 * - GetYoutubeAudioOutput - The return type for the getYoutubeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetYoutubeAudioInputSchema = z.object({
  query: z.string().describe('The search query for the song or video.'),
});
export type GetYoutubeAudioInput = z.infer<typeof GetYoutubeAudioInputSchema>;

const GetYoutubeAudioOutputSchema = z.object({
  success: z.boolean(),
  title: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  message: z.string().optional(),
});
export type GetYoutubeAudioOutput = z.infer<typeof GetYoutubeAudioOutputSchema>;


export async function getYoutubeAudio(input: GetYoutubeAudioInput): Promise<GetYoutubeAudioOutput> {
  return getYoutubeAudioFlow(input);
}


const getYoutubeAudioFlow = ai.defineFlow(
  {
    name: 'getYoutubeAudioFlow',
    inputSchema: GetYoutubeAudioInputSchema,
    outputSchema: GetYoutubeAudioOutputSchema,
  },
  async (input) => {
    try {
        const response = await fetch(`https://api.diioffc.web.id/api/search/ytplay?query=${encodeURIComponent(input.query)}`);
        
        if (!response.ok) {
            return { success: false, message: 'Failed to fetch from API.' };
        }
        
        const data = await response.json();
        
        // The API returns a 'result' object on success
        if (data.result && data.result.url) {
             return {
                success: true,
                title: data.result.title,
                imageUrl: data.result.thumb,
                audioUrl: data.result.url,
            };
        } else {
             return { success: false, message: data.message || 'Could not find audio for this query.' };
        }

    } catch(e) {
        console.error("Error in getYoutubeAudioFlow:", e);
        return { success: false, message: 'An unexpected error occurred.' };
    }
  }
);
