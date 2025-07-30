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

const ChatWithSearchOutputSchema = z.object({
  response: z.string().describe('The AI response to the query.'),
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
    description: z.string(),
    link: z.string().url(),
  })),
},
async (input) => {
    // Placeholder for web search implementation.
    // In a real application, this would call an external search API.
    // For this example, we return dummy data.
    return [
      {
        title: 'Dummy Search Result 1',
        description: 'This is a dummy search result for testing purposes.',
        link: 'https://example.com/result1',
      },
      {
        title: 'Dummy Search Result 2',
        description: 'Another dummy search result to demonstrate web search functionality.',
        link: 'https://example.com/result2',
      },
    ];
  }
);

const chatWithSearchPrompt = ai.definePrompt({
  name: 'chatWithSearchPrompt',
  input: {schema: ChatWithSearchInputSchema},
  output: {
    schema: ChatWithSearchOutputSchema,
    format: 'json',
  },
  tools: [webSearch],
  system: `You are V-technology or Vtech AI, created by Farel Alfareza. Use the webSearch tool if the user asks a question that requires up-to-date information or specific facts. If using the webSearch tool, incorporate the search results into your response, citing the source.  If the question can be answered without external information, you do not need to use the webSearch tool.
Your final output must be a JSON object that conforms to the output schema.`,
  prompt: `{{query}}`,
});

const chatWithSearchFlow = ai.defineFlow(
  {
    name: 'chatWithSearchFlow',
    inputSchema: ChatWithSearchInputSchema,
    outputSchema: ChatWithSearchOutputSchema,
  },
  async input => {
    const {output} = await chatWithSearchPrompt(input);
    return output!;
  }
);
