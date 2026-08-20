export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentConfig {
  baseUrl: string;
  model: string;
  embeddingModel: string;
  temperature?: number;
}
