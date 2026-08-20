import "dotenv/config";
import * as readline from "node:readline";
import { createChatAgent, createAgentConfig } from "./agent/agent.js";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
import {
  saveMessage,
  getConversationHistory,
  getAllThreads,
  clearThread,
  closeDb,
} from "./memory/index.js";

const DEFAULT_THREAD_ID = "default-thread";

function showHelp(): void {
  console.log("\n📋 Comandos disponíveis:");
  console.log("  /help     - Mostrar esta ajuda");
  console.log("  /historico - Ver últimas mensagens");
  console.log("  /limpar   - Limpar conversa atual");
  console.log("  /threads  - Listar conversas anteriores");
  console.log("  /nova     - Criar nova conversa");
  console.log("  /sair     - Encerrar\n");
}

function showHistory(threadId: string): void {
  const history = getConversationHistory(threadId, 20);

  if (history.length === 0) {
    console.log("\n📭 Nenhuma mensagem nesta conversa.\n");
    return;
  }

  console.log("\n📜 Histórico da conversa:");
  console.log("─".repeat(50));

  for (const msg of history) {
    const role = msg.role === "user" ? "👤 Você" : "🤖 Assistente";
    const content =
      msg.content.length > 100
        ? msg.content.substring(0, 100) + "..."
        : msg.content;
    console.log(`${role}: ${content}`);
  }

  console.log("─".repeat(50));
  console.log(`Total: ${history.length} mensagens\n`);
}

function showThreads(): void {
  const threads = getAllThreads();

  if (threads.length === 0) {
    console.log("\n📭 Nenhuma conversa encontrada.\n");
    return;
  }

  console.log("\n📋 Conversas anteriores:");
  console.log("─".repeat(50));

  for (const thread of threads) {
    const lastMsg =
      thread.lastMessage.length > 50
        ? thread.lastMessage.substring(0, 50) + "..."
        : thread.lastMessage;
    console.log(`  ID: ${thread.threadId.substring(0, 8)}...`);
    console.log(`  Mensagens: ${thread.messageCount}`);
    console.log(`  Última: ${lastMsg}`);
    console.log();
  }

  console.log("─".repeat(50));
}

async function main() {
  console.log("🤖 AI Agent — Etapa 4: Memória\n");
  console.log("Ferramentas disponíveis:");
  console.log("  - 🔍 web_search: Buscar informações na web");
  console.log("  - 📄 read_file: Ler arquivos");
  console.log("  - ✏️  write_file: Criar/atualizar arquivos");
  console.log("  - 📁 list_files: Explorar diretórios");
  console.log("  - 📚 load_documents: Carregar documentos para RAG");
  console.log("  - 🔎 search_documents: Buscar nos documentos");
  console.log("  - 📊 get_document_stats: Ver estatísticas");
  console.log("\nMemória: ✅ Ativa (SQLite)");
  console.log("Digite /help para ver os comandos disponíveis\n");

  const agent = createChatAgent();
  let threadId = DEFAULT_THREAD_ID;
  let config = createAgentConfig(threadId);

  const history = getConversationHistory(threadId);
  if (history.length > 0) {
    console.log(`\n🔄 Conversa anterior restaurada (${history.length} mensagens)`);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  console.log("Digite sua mensagem (ou 'sair' para encerrar):\n");

  while (true) {
    const input = await question("Você: ");

    const normalizedInput = input.trim().toLowerCase();

    if (normalizedInput === "sair" || normalizedInput === "exit") {
      console.log("\n👋 Até logo!");
      closeDb();
      rl.close();
      break;
    }

    if (normalizedInput === "/help") {
      showHelp();
      continue;
    }

    if (normalizedInput === "/historico") {
      showHistory(threadId);
      continue;
    }

    if (normalizedInput === "/limpar") {
      const count = clearThread(threadId);
      console.log(`\n🗑️  Conversa limpa (${count} mensagens removidas).\n`);
      continue;
    }

    if (normalizedInput === "/threads") {
      showThreads();
      continue;
    }

    if (normalizedInput === "/nova") {
      threadId = uuidv4();
      config = createAgentConfig(threadId);
      console.log(`\n🆕 Nova conversa criada (ID: ${threadId.substring(0, 8)}...)\n`);
      continue;
    }

    if (!input.trim()) continue;

    saveMessage(threadId, "user", input);

    try {
      process.stdout.write("\n🤖 Assistente: ");

      const history = getConversationHistory(threadId);
      const messages = history.map((msg) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      );

      const result = await agent.invoke(
        { messages },
        config
      );

      const lastMessage = result.messages[result.messages.length - 1];

      if (!lastMessage) {
        console.log("\nNenhuma resposta recebida.");
        continue;
      }

      const content =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      console.log(content);

      saveMessage(threadId, "assistant", content);
    } catch (error) {
      console.error(
        "\n❌ Erro ao processar mensagem:",
        error instanceof Error ? error.message : error
      );
      console.log("Verifique se o Ollama está rodando: ollama serve\n");
    }

    console.log();
  }
}

main();
