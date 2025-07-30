'use server';

/**
 * @fileOverview A general-purpose chat AI agent that can also generate code.
 *
 * - chat - A function that handles the chat process.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  query: z.string().describe('The user query.'),
  file: z
    .string()
    .optional()
    .describe(
      "A file, if provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z
    .string()
    .describe(
      'The AI response. This can include markdown, including code blocks.'
    ),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(
  input: ChatInput
): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  system: `You are V-technology or Vtech AI, created by Farel Alfareza.
- You are a helpful assistant.
- You should be able to generate code snippets when asked. Use markdown for code blocks.
- When you generate code, you MUST provide a clear and concise explanation for what the code does.
- If the user provides a file (image), you MUST analyze the image in conjunction with the user's text query to understand their full intent. Your response must be based on both the image and the text.
- Your final output MUST BE a valid JSON object that strictly conforms to the output schema.
- Do not output anything other than the JSON object itself.`,
  prompt: `{{#if file}}{{media url=file}}{{/if}}

{{query}}`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const llmResponse = await chatPrompt(input);
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
        "I'm sorry, I encountered an error while processing your request. Please try again.",
    };
  }
);
