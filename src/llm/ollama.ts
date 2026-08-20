import { ChatOllama } from "@langchain/ollama";
import type { AgentConfig } from "../types/index.js";

export function createOllamaModel(config?: Partial<AgentConfig>): ChatOllama {
  return new ChatOllama({
    model: config?.model ?? process.env.OLLAMA_MODEL ?? "llama3.1",
    temperature: config?.temperature ?? 0.7,
    baseUrl: config?.baseUrl ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  });
}
