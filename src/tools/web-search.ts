import { tool } from "@langchain/core/tools";
import { z } from "zod";

interface DuckDuckGoResponse {
  Abstract: string;
  AbstractSource: string;
  AbstractURL: string;
  RelatedTopics: Array<{ Text?: string }>;
}

export const webSearchTool = tool(
  async ({ query }) => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`
      );

      if (!response.ok) {
        return `Erro ao buscar na web: ${response.statusText}`;
      }

      const data = (await response.json()) as DuckDuckGoResponse;

      const results: string[] = [];

      if (data.Abstract) {
        results.push(`**Resumo:** ${data.Abstract}`);
      }

      if (data.AbstractSource) {
        results.push(`**Fonte:** ${data.AbstractSource}`);
      }

      if (data.AbstractURL) {
        results.push(`**URL:** ${data.AbstractURL}`);
      }

      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        const topics = data.RelatedTopics.slice(0, 5)
          .map((topic) => topic.Text)
          .filter(Boolean);

        if (topics.length > 0) {
          results.push(`\n**Tópicos relacionados:**`);
          topics.forEach((topic, i) => {
            results.push(`${i + 1}. ${topic}`);
          });
        }
      }

      if (results.length === 0) {
        return `Nenhum resultado encontrado para: ${query}`;
      }

      return results.join("\n");
    } catch (error) {
      return `Erro ao buscar na web: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
    }
  },
  {
    name: "web_search",
    description:
      "Busca informações na web usando DuckDuckGo. Use esta ferramenta para encontrar informações atualizadas, notícias, ou qualquer informação que não esteja no seu conhecimento.",
    schema: z.object({
      query: z
        .string()
        .describe("A consulta de busca em português ou inglês"),
    }),
  }
);
