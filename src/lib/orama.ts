import {
  create,
  insert,
  search,
  type AnyOrama,
} from "@orama/orama";
import { persist, restore } from "@orama/plugin-data-persistence";
import { db } from "@/server/db";
import { getEmbeddings } from "@/lib/embeddings";

export class OramaManager {
  private orama: AnyOrama | null = null;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async initialize() {
    if (this.orama) return; // Already initialized

    const account = await db.account.findUnique({
      where: { id: this.accountId },
      select: { binaryIndex: true },
    });

    if (!account) throw new Error("Account not found");

    if (account.binaryIndex) {
      this.orama = await restore("json", account.binaryIndex as any);
    } else {
      this.orama = await create({
        schema: {
          title: "string",
          body: "string",
          rawBody: "string",
          from: "string",
          to: "string[]",
          sentAt: "string",
          embeddings: "vector[1536]",
          threadId: "string",
        },
      });
      await this.saveIndex();
    }
  }

  async insert(document: any) {
    if (!this.orama) {
      await this.initialize();
    }
    if (!this.orama) throw new Error("Failed to initialize Orama");

    await insert(this.orama, document);
    await this.saveIndex();
  }

  async vectorSearch({
    prompt,
    numResults = 10,
  }: {
    prompt: string;
    numResults?: number;
  }) {
    if (!this.orama) throw new Error("Orama not initialized");
    
    try {
      const embeddings = await getEmbeddings(prompt);
      const results = await search(this.orama, {
        mode: "vector",
        vector: {
          value: embeddings as number[],
          property: "embeddings",
        },
        limit: numResults,
      });

      return results;
    } catch (error) {
      console.error("Vector search error:", error);
      return {
        hits: [],
        count: 0,
        elapsed: 0,
      };
    }
  }

  async search({ term }: { term: string }) {
    if (!this.orama) throw new Error("Orama not initialized");
    return await search(this.orama, {
      term: term,
    });
  }

  async saveIndex() {
    if (!this.orama) throw new Error("Orama not initialized");
    const index = await persist(this.orama, "json");
    await db.account.update({
      where: { id: this.accountId },
      data: { binaryIndex: index as Buffer },
    });
  }
}

// Usage example:
async function main() {
  const oramaManager = new OramaManager("67358");
  await oramaManager.initialize();

  // Insert a document
  // const emails = await db.email.findMany({
  //     where: {
  //         thread: { accountId: '67358' }
  //     },
  //     select: {
  //         subject: true,
  //         bodySnippet: true,
  //         from: { select: { address: true, name: true } },
  //         to: { select: { address: true, name: true } },
  //         sentAt: true,
  //     },
  //     take: 100
  // })
  // await Promise.all(emails.map(async email => {
  //     // const bodyEmbedding = await getEmbeddings(email.bodySnippet || '');
  //     // console.log(bodyEmbedding)
  //     await oramaManager.insert({
  //         title: email.subject,
  //         body: email.bodySnippet,
  //         from: `${email.from.name} <${email.from.address}>`,
  //         to: email.to.map(t => `${t.name} <${t.address}>`),
  //         sentAt: email.sentAt.getTime(),
  //         // bodyEmbedding: bodyEmbedding,
  //     })
  // }))

  // Search
  const searchResults = await oramaManager.search({
    term: "cascading",
  });

  console.log(searchResults.hits.map((hit) => hit.document));
}

// main().catch(console.error);
