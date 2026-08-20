import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { loadDocuments, searchDocuments, getAllDocuments, clearDocuments } from "../rag/simple-rag.js";
import * as path from "node:path";

export const loadDocumentsTool = tool(
  async ({ path: docPath }) => {
    try {
      clearDocuments();
      const resolvedPath = path.resolve(docPath);
      const documents = await loadDocuments(resolvedPath);

      return `Carregados ${documents.length} documentos de: ${docPath}`;
    } catch (error) {
      return `Erro ao carregar documentos: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
    }
  },
  {
    name: "load_documents",
    description:
      "Carrega documentos de um arquivo ou diretório para busca. Suporta arquivos .txt e .md. Use esta ferramenta antes de fazer perguntas sobre documentos.",
    schema: z.object({
      path: z
        .string()
        .describe(
          "O caminho do arquivo ou diretório a ser carregado"
        ),
    }),
  }
);

export const searchDocumentsTool = tool(
  async ({ query, k }) => {
    try {
      const allDocs = getAllDocuments();

      if (allDocs.length === 0) {
        return "Nenhum documento carregado. Use a ferramenta load_documents primeiro.";
      }

      const results = searchDocuments(query, k);

      if (results.length === 0) {
        return `Nenhum resultado encontrado para: ${query}`;
      }

      const formatted = results.map((doc, i) => {
        const source = doc.metadata.source || "Desconhecido";
        const content = doc.content.substring(0, 500);
        return `**Resultado ${i + 1}** (Fonte: ${source}):\n${content}...`;
      });

      return `**Resultados encontrados:**\n\n${formatted.join("\n\n")}`;
    } catch (error) {
      return `Erro ao buscar documentos: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
    }
  },
  {
    name: "search_documents",
    description:
      "Busca documentos similares nos documentos carregados. Use esta ferramenta para encontrar informações específicas.",
    schema: z.object({
      query: z
        .string()
        .describe("A consulta de busca em português ou inglês"),
      k: z
        .number()
        .optional()
        .default(3)
        .describe("Número de resultados a retornar (padrão: 3)"),
    }),
  }
);

export const getDocumentStatsTool = tool(
  async () => {
    const allDocs = getAllDocuments();

    if (allDocs.length === 0) {
      return "Nenhum documento carregado.";
    }

    const sources = allDocs.map((doc) => doc.metadata.source);
    const uniqueSources = [...new Set(sources)];

    return `**Status do RAG:**\n- Documentos carregados: ${allDocs.length}\n- Fontes únicas: ${uniqueSources.length}\n- Arquivos: ${uniqueSources.join(", ")}`;
  },
  {
    name: "get_document_stats",
    description:
      "Retorna estatísticas sobre os documentos carregados.",
    schema: z.object({}),
  }
);
