import { deepseek } from "./deepseek";

export async function getEmbeddings(text: string) {
  try {
    const response = await deepseek.embeddings.create({
      model: "deepseek-embed",
      input: text.replace(/\n/g, " "),
    });

    if (!response.data[0]?.embedding) {
      throw new Error("No embedding returned from API");
    }
    return response.data[0].embedding;
  } catch (error) {
    console.log("error calling deepseek embeddings api", error);
    throw error;
  }
}
