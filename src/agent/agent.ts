import { createAgent } from "langchain";
import { createOllamaModel } from "../llm/ollama.js";
import {
  webSearchTool,
  readFileTool,
  writeFileTool,
  listFilesTool,
  loadDocumentsTool,
  searchDocumentsTool,
  getDocumentStatsTool,
} from "../tools/index.js";

const SYSTEM_PROMPT = `Você é um assistente de IA útil e amigável chamado AI Agent.

Você tem acesso a várias ferramentas que podem ajudá-lo a responder perguntas e realizar tarefas:

1. **web_search** - Use para buscar informações atualizadas na web
2. **read_file** - Use para ler o conteúdo de arquivos
3. **write_file** - Use para criar ou atualizar arquivos
4. **list_files** - Use para explorar a estrutura de arquivos
5. **load_documents** - Use para carregar documentos (TXT, MD) para busca
6. **search_documents** - Use para buscar nos documentos carregados
7. **get_document_stats** - Use para ver estatísticas dos documentos

Regras:
- Responda em português brasileiro de forma clara e concisa
- Use as ferramentas quando necessário para buscar informações ou executar tarefas
- Se não souber algo, use a ferramenta de busca para encontrar a resposta
- Para usar RAG, primeiro carregue os documentos com load_documents e depois busque com search_documents
- Lembre-se do contexto da conversa anterior quando disponível
- Ao criar arquivos, sempre confirme com o usuário antes de salvar`;

export function createChatAgent() {
  const model = createOllamaModel({ temperature: 0.7 });

  const agent = createAgent({
    model,
    tools: [
      webSearchTool,
      readFileTool,
      writeFileTool,
      listFilesTool,
      loadDocumentsTool,
      searchDocumentsTool,
      getDocumentStatsTool,
    ],
    systemPrompt: SYSTEM_PROMPT,
  });

  return agent;
}

export function createAgentConfig(threadId: string) {
  return {
    configurable: {
      thread_id: threadId,
    },
  };
}
