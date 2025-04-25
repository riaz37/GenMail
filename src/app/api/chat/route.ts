import { StreamingTextResponse, Message } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { geminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
    console.log('Processing chat request:', { messages, lastMessage });

    const result = await geminiModel.generateContentStream({
      contents: [{
        role: "user",
        parts: [{
          text: lastMessage.content
        }]
      }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    console.log('Gemini response received:', result);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chunks: string[] = [];
          for await (const chunk of result.stream) {
            const text = chunk.text();
            console.log('Streaming chunk:', text);
            chunks.push(text);
            controller.enqueue(text);
          }
          console.log('All chunks:', chunks.join(''));
          controller.close();
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        }
      }
    });

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error("Chat API error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 },
    );
  }
}
