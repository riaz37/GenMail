'use server';

import { createStreamableValue } from 'ai/rsc';
import { geminiModel } from '@/lib/gemini';

export async function generate(input: string) {
    const stream = createStreamableValue('');

    (async () => {
        const result = await geminiModel.generateContentStream({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `You are a helpful AI embedded in a email client app that is used to answer questions about the emails in the inbox.
                            ${input}`,
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
