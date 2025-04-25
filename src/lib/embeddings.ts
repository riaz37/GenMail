import { embeddingModel } from "./gemini";

export async function getEmbeddings(text: string) {
  try {
    const result = await embeddingModel.embedContent(text.replace(/\n/g, " "));
    const embedding = await result.embedding;
    
    if (!embedding) {
      throw new Error("No embedding returned from API");
    }
    return embedding;
  } catch (error) {
    console.error("Gemini Embedding API Error:", {
      error,
      text: text.substring(0, 100) + "...",
    });
    return fallbackEmbedding();
  }
}

function fallbackEmbedding() {
  return new Array(1536).fill(0);
}
