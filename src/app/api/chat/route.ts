import { Message, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import { OramaManager } from "@/lib/orama";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { getSubscriptionStatus } from "@/lib/stripe-actions";
import { FREE_CREDITS_PER_DAY } from "@/app/constants";
import { deepseek } from "@/lib/deepseek";

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // First verify the user exists
        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isSubscribed = await getSubscriptionStatus()
        if (!isSubscribed) {
            const chatbotInteraction = await db.chatbotInteraction.findUnique({
                where: {
                    day_userId: {
                        day: new Date().toDateString(),
                        userId
                    }
                }
            })

            if (!chatbotInteraction) {
                try {
                    await db.chatbotInteraction.create({
                        data: {
                            day: new Date().toDateString(),
                            count: 1,
                            userId
                        }
                    })
                } catch (error) {
                    console.error("Failed to create chatbot interaction:", error);
                    // Continue execution even if tracking fails
                }
            } else if (chatbotInteraction.count >= FREE_CREDITS_PER_DAY) {
                return NextResponse.json({ error: "Limit reached" }, { status: 429 });
            } else {
                await db.chatbotInteraction.update({
                    where: {
                        day_userId: {
                            day: new Date().toDateString(),
                            userId
                        }
                    },
                    data: {
                        count: chatbotInteraction.count + 1
                    }
                })
            }
        }

        const { messages, accountId } = await req.json();
        const oramaManager = new OramaManager(accountId)
        await oramaManager.initialize()

        const lastMessage = messages[messages.length - 1]
        const context = await oramaManager.vectorSearch({ prompt: lastMessage.content })

        const prompt = {
            role: "system",
            content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
            THE TIME NOW IS ${new Date().toLocaleString()}
      
            START CONTEXT BLOCK
            ${context.hits.map((hit) => JSON.stringify(hit.document)).join('\n')}
            END OF CONTEXT BLOCK`
        };

        const response = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                prompt,
                ...messages.filter((message: Message) => message.role === "user"),
            ],
            stream: true,
        });

        return new StreamingTextResponse(response.toReadableStream());
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
