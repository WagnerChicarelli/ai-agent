# 🤖 AI Agent

CLI interativo com agente de IA utilizando LangChain.js e Ollama (LLM local). Projeto de estudo com foco em RAG, memória persistente, Docker e CI/CD.

## Funcionalidades

- Conversa interativa via CLI com IA local (Ollama)
- 7 ferramentas integradas (web search, file system, RAG)
- RAG: carregar e buscar documentos (.txt, .md)
- Memória persistente com SQLite (histórico de conversas)
- Múltiplas threads de conversa
- Containerização com Docker
- CI/CD com GitHub Actions (ghcr.io)

## Pré-requisitos

- Node.js 20+
- npm
- [Ollama](https://ollama.ai) (LLM local)
- Docker (opcional, para containerização)

## Instalação

```bash
git clone https://github.com/WagnerChicarelli/ai-agent.git
cd ai-agent
npm install
```

### Configurar Ollama

```bash
# Instalar Ollama (https://ollama.ai)
# Baixar modelo
ollama pull llama3.1

# Verificar se está rodando
ollama serve
```

### Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Uso via CLI

```bash
# Rodar em modo desenvolvimento
npm run dev

# Ou rodar versão buildada
npm run build
npm start
```

### Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `/help` | Mostra ajuda com todos os comandos |
| `/historico` | Exibe últimas mensagens da conversa |
| `/limpar` | Limpa o histórico da conversa atual |
| `/threads` | Lista todas as conversas anteriores |
| `/nova` | Cria uma nova conversa |
| `/sair` | Encerra o agente |

### Exemplo de uso

```
🤖 AI Agent — Etapa 4: Memória

Ferramentas disponíveis:
  - 🔍 web_search: Buscar informações na web
  - 📄 read_file: Ler arquivos
  - ✏️  write_file: Criar/atualizar arquivos
  - 📁 list_files: Explorar diretórios
  - 📚 load_documents: Carregar documentos para RAG
  - 🔎 search_documents: Buscar nos documentos
  - 📊 get_document_stats: Ver estatísticas

Memória: ✅ Ativa (SQLite)
Digite /help para ver os comandos disponíveis

Digite sua mensagem (ou 'sair' para encerrar):

Você: O que é RAG?
🤖 Assistente: RAG (Retrieval-Augmented Generation) é uma técnica...

Você: /historico
📜 Histórico da conversa:
──────────────────────────────────────────────────
👤 Você: O que é RAG?
🤖 Assistente: RAG (Retrieval-Augmented Generation) é uma técnica...
──────────────────────────────────────────────────
Total: 2 mensagens
```

## Uso via Docker

### Rodar localmente

```bash
docker compose up -d
```

A aplicação estará disponível em `http://localhost:3000`.

### Ver logs

```bash
docker compose logs -f
```

### Parar

```bash
docker compose down
```

### Buildar imagem manualmente

```bash
docker build -t ai-agent .
docker run -p 3000:3000 ai-agent
```

### Nota sobre Ollama

O container acessa o Ollama que roda na máquina host via `host.docker.internal`. Certifique-se de que o Ollama está rodando antes de iniciar o container.

## Funcionalidades do Agent

### Ferramentas disponíveis

| Tool | Descrição | Uso |
|------|-----------|-----|
| `web_search` | Busca informações na web (DuckDuckGo) | Pesquisar notícias, documentação |
| `read_file` | Lê conteúdo de arquivos | Analisar código, configurações |
| `write_file` | Cria ou atualiza arquivos | Gerar scripts, criar documentos |
| `list_files` | Lista arquivos de um diretório | Explorar estrutura do projeto |
| `load_documents` | Carrega documentos para RAG | Indexar .txt, .md |
| `search_documents` | Busca nos documentos carregados | Encontrar informações específicas |
| `get_document_stats` | Mostra estatísticas dos documentos | Ver quantidade de docs carregados |

### Exemplo: Busca Web

```
Você: Quais as novidades do Node.js 22?
🤖 Assistente: [Usando web_search] As principais novidades do Node.js 22 incluem...
```

### Exemplo: RAG

```
Você: carregue os documentos da pasta data/docs/
🤖 Assistente: [Usando load_documents] 3 documentos carregados com sucesso.

Você: O que diz sobre Docker?
🤖 Assistente: [Usando search_documents] De acordo com os documentos carregados...
```

## RAG (Retrieval-Augmented Generation)

O agent possui busca por similaridade em memória para documentos locais.

### Como usar

1. **Carregar documentos**:

   ```
   Você: carregue os documentos da pasta data/docs/
   ```

2. **Buscar informações**:

   ```
   Você: o que os documentos dizem sobre LangChain?
   ```

### Formatos suportados

- `.txt` — texto simples
- `.md` — Markdown

### Documentos de exemplo

O projeto inclui documentos de teste em `data/docs/`:

- `ai-agent.md` — informações sobre o projeto
- `ferramentas.md` — documentação das ferramentas

## Memória

O agente utiliza **SQLite** para persistência de conversas.

### Funcionalidades

- **Histórico completo**: todas as mensagens são salvas
- **Múltiplas threads**: crie conversas separadas
- **Restauração automática**: conversa anterior é restaurada ao iniciar
- **Limpeza**: comando `/limpar` remove mensagens da conversa atual

### Comandos de memória

| Comando | Descrição |
|---------|-----------|
| `/historico` | Ver últimas 20 mensagens |
| `/limpar` | Limpar conversa atual |
| `/threads` | Listar todas as conversas |
| `/nova` | Criar nova conversa |

### Armazenamento

- Banco: `data/agent.db`
- Engine: better-sqlite3
- Formato: JSON (mensagens LangChain)

## Estrutura do Projeto

```
ai-agent/
├── src/
│   ├── index.ts              # Entry point - CLI interativo
│   ├── llm/
│   │   └── ollama.ts         # Configuração do Ollama
│   ├── types/
│   │   └── index.ts          # Tipos TypeScript
│   ├── agent/
│   │   └── agent.ts          # Configuração do Agent
│   ├── tools/
│   │   ├── index.ts          # Exportação das tools
│   │   ├── web-search.ts     # Busca web (DuckDuckGo)
│   │   ├── file-system.ts    # Leitura/escrita de arquivos
│   │   └── rag-tools.ts      # Tools para RAG
│   ├── rag/
│   │   └── simple-rag.ts     # Implementação simples de RAG
│   └── memory/
│       ├── sqlite.ts         # Persistência SQLite
│       └── index.ts          # Exportações
├── data/
│   ├── agent.db              # Banco de dados SQLite
│   └── docs/                 # Documentos para teste
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD GitHub Actions
├── Dockerfile                # Multi-stage build
├── docker-compose.yml        # Serviços Docker
├── .dockerignore             # Arquivos ignorados pelo Docker
├── .env.example              # Variáveis de ambiente exemplo
├── package.json              # Dependências e scripts
├── tsconfig.json             # Configuração TypeScript
└── README.md                 # Esta documentação
```

## Arquitetura

```
User Input (CLI)
     ↓
src/index.ts              → readline, comandos
     ↓
src/agent/agent.ts        → createAgent (LangChain)
     ↓
src/tools/*.ts            → 7 ferramentas disponíveis
     ↓
src/rag/simple-rag.ts     → busca por similaridade
     ↓
src/memory/sqlite.ts      → persistência de mensagens
     ↓
src/llm/ollama.ts         → ChatOllama (LLM local)
     ↓
Ollama Server (localhost:11434)
```

### Fluxo de uma mensagem

1. Usuário digita mensagem
2. Mensagem é salva no SQLite
3. Histórico completo é enviado ao agent
4. Agent decide se usa alguma tool
5. Se usar, executa a tool e gera resposta
6. Resposta é salva no SQLite
7. Resposta é exibida ao usuário

## Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | 20+ | Runtime |
| **TypeScript** | 5.4+ | Tipagem estática |
| **LangChain.js** | 1.5+ | Framework de agentes |
| **@langchain/ollama** | 1.3+ | Integração com Ollama |
| **Ollama** | local | LLM (llama3.1) |
| **better-sqlite3** | 9.6+ | Banco de dados local |
| **DuckDuckGo** | - | Busca web |
| **Zod** | 3.23+ | Validação de schemas |
| **Docker** | - | Containerização |
| **GitHub Actions** | - | CI/CD |

## CI/CD

O projeto utiliza **GitHub Actions** para automação.

### Pipeline

```
push/PR → Testes → Build Docker → ghcr.io/wagnerchicarelli/ai-agent:latest
```

### Jobs

| Job | Trigger | Descrição |
|-----|---------|-----------|
| `test` | push/PR para main | Build TypeScript |
| `build` | push para main | Build e push da imagem Docker |

### Container Registry

- **Registry**: GitHub Container Registry (ghcr.io)
- **Imagem**: `ghcr.io/wagnerchicarelli/ai-agent:latest`
- **Tag**: `latest` (apenas main branch)

## Roadmap

- [x] Etapa 1 — CLI com Ollama
- [x] Etapa 2 — Agent com Tools
- [x] Etapa 3 — RAG
- [x] Etapa 4 — Memória
- [ ] Etapa 5 — Interface Web (Express + WebSocket)
- [x] Docker
- [x] CI/CD
- [ ] PostgreSQL
- [ ] Testes automatizados
- [ ] API REST
- [ ] Frontend React

## Licença

MIT
