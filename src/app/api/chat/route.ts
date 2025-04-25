import { StreamingTextResponse, Message } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { geminiModel } from "@/lib/gemini";
import { db } from "@/server/db";
import { FREE_CREDITS_PER_DAY } from "@/app/constants";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check subscription status
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { stripeSubscription: true }
    });

    const today = new Date().toDateString();
    
    // If user is not subscribed, check and update daily limit
    if (!user?.stripeSubscription) {
      const interaction = await db.chatbotInteraction.upsert({
        where: {
          day_userId: {
            day: today,
            userId: userId
          }
        },
        update: {
          count: { increment: 1 }
        },
        create: {
          day: today,
          userId: userId,
          count: 1
        }
      });

      if (interaction.count > FREE_CREDITS_PER_DAY) {
        return NextResponse.json(
          { error: "Limit reached. Please upgrade to pro for unlimited messages." },
          { status: 429 }
        );
      }
    }

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            const messageChunk = JSON.stringify({ role: 'assistant', content: text });
            controller.enqueue(encoder.encode(messageChunk + "\n"));
          }
          controller.close();
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        }
      }
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
