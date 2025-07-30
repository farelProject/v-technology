// The AI chat flow with integrated web search.
//
// - chatWithSearch - A function that handles the chat process.
// - ChatWithSearchInput - The input type for the chatWithSearch function.
// - ChatWithSearchOutput - The return type for the chatWithSearch function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithSearchInputSchema = z.object({
  query: z.string().describe('The user query.'),
});
export type ChatWithSearchInput = z.infer<typeof ChatWithSearchInputSchema>;

const SearchResultItemSchema = z.object({
  title: z.string(),
  description: z.string().describe('AI-generated description for the search result.'),
  link: z.string().url(),
});

const ChatWithSearchOutputSchema = z.object({
  response: z.string().describe('A brief, one-sentence introductory response from the AI.'),
  searchResults: z.array(SearchResultItemSchema).optional(),
});
export type ChatWithSearchOutput = z.infer<typeof ChatWithSearchOutputSchema>;

export async function chatWithSearch(input: ChatWithSearchInput): Promise<ChatWithSearchOutput> {
  return chatWithSearchFlow(input);
}

const webSearch = ai.defineTool({
  name: 'webSearch',
  description: 'Searches the web for relevant information.',
  inputSchema: z.object({
    query: z.string().describe('The search query.'),
  }),
  outputSchema: z.array(z.object({
    title: z.string(),
    link: z.string().url(),
    // The websearch tool no longer provides its own description.
  })),
},
async (input) => {
    // Placeholder for web search implementation.
    return [
      { title: 'Dummy Search Result 1', link: `https://google.com/search?q=${encodeURIComponent('Dummy Search Result 1')}` },
      { title: 'Dummy Search Result 2', link: `https://google.com/search?q=${encodeURIComponent('Dummy Search Result 2')}` },
      { title: 'Dummy Search Result 3', link: `https://google.com/search?q=${encodeURIComponent('Dummy Search Result 3')}` },
      { title: 'Dummy Search Result 4', link: `https://google.com/search?q=${encodeURIComponent('Dummy Search Result 4')}` },
      { title: 'Dummy Search Result 5', link: `https://google.com/search?q=${encodeURIComponent('Dummy Search Result 5')}` },
    ];
  }
);

const chatWithSearchPrompt = ai.definePrompt({
  name: 'chatWithSearchPrompt',
  input: {schema: ChatWithSearchInputSchema},
  output: {schema: ChatWithSearchOutputSchema},
  tools: [webSearch],
  system: `You are V-technology or Vtech AI, created by Farel Alfareza.
- You are a helpful assistant.
- You MUST use the webSearch tool to answer the user's query.
- After getting the search results, you MUST generate a new, insightful description for EACH of the 5 search results.
- Your final output MUST BE a valid JSON object that strictly conforms to the output schema.
- The 'response' field should be a single, short introductory sentence like "Here are the search results for your query."
- The 'searchResults' field must contain an array of 5 objects, each with a title, the AI-generated description, and a link.
- Do not output anything other than the JSON object itself.`,
  prompt: `{{query}}`,
});


const chatWithSearchFlow = ai.defineFlow(
  {
    name: 'chatWithSearchFlow',
    inputSchema: ChatWithSearchInputSchema,
    outputSchema: ChatWithSearchOutputSchema,
  },
  async (input) => {
    const llmResponse = await chatWithSearchPrompt(input);
    const output = llmResponse.output;

    if (output) {
      return output;
    }

    // Fallback if the model fails to return structured JSON
    console.error("AI did not return valid JSON output. Using fallback.", llmResponse.text);
    return {
        response: "I'm sorry, I encountered an error while processing the search results. Please try again.",
        searchResults: [],
    };
  }
);
