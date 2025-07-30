'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithSearchInputSchema = z.object({
  query: z.string().describe('The user query.'),
  file: z
    .string()
    .optional()
    .describe(
      "A file, if provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ChatWithSearchInput = z.infer<typeof ChatWithSearchInputSchema>;

const SearchResultItemSchema = z.object({
  title: z.string(),
  description: z
    .string()
    .describe('AI-generated description for the search result.'),
  link: z.string().url(),
});

const ChatWithSearchOutputSchema = z.object({
  response: z
    .string()
    .describe(
      'A brief, one-sentence introductory response from the AI. This can include markdown, including code blocks.'
    ),
  searchResults: z.array(SearchResultItemSchema).optional(),
});
export type ChatWithSearchOutput = z.infer<typeof ChatWithSearchOutputSchema>;

export async function chatWithSearch(
  input: ChatWithSearchInput
): Promise<ChatWithSearchOutput> {
  return chatWithSearchFlow(input);
}

const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Searches the web for relevant information.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        link: z.string().url(),
        // The websearch tool no longer provides its own description.
      })
    ),
  },
  async (input) => {
    // Placeholder for web search implementation.
    return [
      {
        title: `Google: ${input.query}`,
        link: `https://google.com/search?q=${encodeURIComponent(input.query)}`,
      },
      {
        title: `Bing: ${input.query}`,
        link: `https://bing.com/search?q=${encodeURIComponent(input.query)}`,
      },
      {
        title: `DuckDuckGo: ${input.query}`,
        link: `https://duckduckgo.com/?q=${encodeURIComponent(input.query)}`,
      },
      {
        title: `Wikipedia: ${input.query}`,
        link: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(input.query)}`,
      },
      {
        title: `Yahoo: ${input.query}`,
        link: `https://search.yahoo.com/search?p=${encodeURIComponent(input.query)}`,
      },
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
- You can generate code snippets when asked. Use markdown for code blocks.
- If the user provides a file (image), you MUST analyze the image in conjunction with the user's text query to understand their full intent. Your response must be based on both the image and the text.
- You MUST use the webSearch tool to answer the user's query if it requires recent information or searching the web.
- After getting the search results, you MUST generate a new, insightful description for EACH of the 5 search results.
- Your final output MUST BE a valid JSON object that strictly conforms to the output schema.
- The 'response' field should be a single, short introductory sentence like "Here are the search results for your query." or an answer based on the context. The response can contain markdown, including code blocks.
- The 'searchResults' field must contain an array of 5 objects, each with a title, the AI-generated description, and a link.
- Do not output anything other than the JSON object itself.`,
  prompt: `{{#if file}}{{media url=file}}{{/if}}

{{query}}`,
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
    console.error(
      'AI did not return valid JSON output. Using fallback.',
      llmResponse.text
    );
    return {
      response:
        "I'm sorry, I encountered an error while processing the search results. Please try again.",
      searchResults: [],
    };
  }
);
