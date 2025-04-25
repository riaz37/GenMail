import { StreamingTextResponse } from 'ai';
import { geminiModel } from '@/lib/gemini';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(req: Request) {
    const { prompt } = await req.json();

    const result = await geminiModel.generateContentStream({
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `You are a helpful AI embedded in a notion text editor app that is used to autocomplete sentences.
                        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
                        AI is a well-behaved and well-mannered individual.
                        AI is always friendly, kind, and inspiring, and eager to provide vivid and thoughtful responses to the user.
                        
                        I am writing a piece of text in a notion text editor app.
                        Help me complete my train of thought here: ##${prompt}##
                        keep the tone of the text consistent with the rest of the text.
                        keep the response short and sweet.`,
                    },
                ],
            },
        ],
    });

    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of result.stream) {
                    controller.enqueue(chunk.text());
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return new StreamingTextResponse(stream);
}
