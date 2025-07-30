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
      {
        title: 'Dummy Search Result 3',
        description: 'A third dummy item for the web search results.',
        link: 'https://example.com/result3',
      },
      {
        title: 'Dummy Search Result 4',
        description: 'And a final, fourth dummy item to complete the list.',
        link: 'https://example.com/result4',
      },
    ];
  }
);

const chatWithSearchPrompt = ai.definePrompt({
  name: 'chatWithSearchPrompt',
  input: {schema: ChatWithSearchInputSchema},
  tools: [webSearch],
  system: `You are V-technology or Vtech AI, created by Farel Alfareza.
- You are a helpful assistant that provides informative and accurate responses.
- If the user asks a question that requires up-to-date information, specific facts, or knowledge beyond your training data, you MUST use the webSearch tool.
- When using the webSearch tool, analyze the search results and incorporate them into your response to provide a comprehensive answer.
- You MUST cite the sources from the search results when you use them.
- If the question is conversational or can be answered from your existing knowledge, you do not need to use the webSearch tool.
- Your final output MUST BE a valid JSON object that strictly conforms to the output schema.
- The JSON object must have a 'response' property containing your answer.
- Do not output anything other than the JSON object itself. For example, do not include markdown formatting like \`\`\`json\`\`\`.`,
  output: {
    format: 'json'
  },
  prompt: `{{query}}`,
});

const chatWithSearchFlow = ai.defineFlow(
  {
    name: 'chatWithSearchFlow',
    inputSchema: ChatWithSearchInputSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    const llmResponse = await chatWithSearchPrompt(input);
    const toolCalls = llmResponse.toolCalls;

    let parsedResponse: ChatWithSearchOutput;
    try {
      const outputText = llmResponse.text;
      const jsonResponse = JSON.parse(outputText);
      const validation = ChatWithSearchOutputSchema.safeParse(jsonResponse);
      if (validation.success) {
        parsedResponse = validation.data;
      } else {
        parsedResponse = { response: outputText };
      }
    } catch (e) {
      // Not a JSON response, just use the text.
      parsedResponse = { response: llmResponse.text ?? "I'm sorry, I couldn't generate a response." };
    }


    const assistantMessage = {
      response: parsedResponse.response,
      toolCalls: [] as any,
    };

    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const toolOutput = await toolCall.tool.fn(toolCall.input);
      assistantMessage.toolCalls.push({
        tool: {
          webSearch: {
            output: toolOutput,
          },
        },
      });
    }

    return assistantMessage;
  }
);
