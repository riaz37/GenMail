'use server';
import { createStreamableValue } from 'ai/rsc';
import { geminiModel } from '@/lib/gemini';

export async function generateEmail(context: string, prompt: string) {
    const stream = createStreamableValue('');

    (async () => {
        const result = await geminiModel.generateContentStream({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by providing suggestions and relevant information based on the context of their previous emails.
                            
                            THE TIME NOW IS ${new Date().toLocaleString()}
                            
                            START CONTEXT BLOCK
                            ${context}
                            END OF CONTEXT BLOCK
                            
                            USER PROMPT:
                            ${prompt}`,
                        },
                    ],
                },
            ],
        });

        for await (const chunk of result.stream) {
            stream.update(chunk.text());
        }

        stream.done();
    })();

    return { output: stream.value };
}

