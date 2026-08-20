# 🤖 AI Agent — Trilha de Aprendizado IA com Node.js

> Projeto criado como parte de uma trilha prática para aprender a construir agentes de IA utilizando Node.js, LangChain.js e Ollama.

## 📌 Sobre esta trilha

A proposta é aprender a construir agentes de IA de forma progressiva, desde um simples CLI até uma aplicação completa com interface web.

| Etapa | O que pratica | Dificuldade |
|-------|---------------|-------------|
| ✅ Etapa 1 — CLI com Ollama | Node.js, LLM local, readline | Inicial |
| ✅ Etapa 2 — Agent com Tools | LangChain.js, tool calling, Web Search, File System | Inicial/Intermediário |
| ✅ Etapa 3 — RAG | Document loading, busca por similaridade | Intermediário |
| ✅ Etapa 4 — Memória | SQLite, better-sqlite3, conversas persistentes | Intermediário/Avançado |
| 🟣 Etapa 5 — Interface Web | Express, WebSocket, streaming | Avançado |

---

# 🟢 Etapa 1 — CLI com Ollama

Nesta etapa, criamos um simples CLI interativo que se conecta ao Ollama para gerar respostas.

## Conceitos praticados

- Node.js
- TypeScript
- Módulos
- readline
- Variáveis de ambiente
- Conexão com LLM local

## Estrutura

```text
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
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Como rodar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar em modo desenvolvimento
npm run dev
```

## Pré-requisitos

- [Ollama](https://ollama.ai) instalado
- Modelo baixado: `ollama pull llama3.1`
- Node.js 18+

---

# 📌 Roadmap

- [x] Etapa 1 — CLI com Ollama
- [x] Etapa 2 — Agent com Tools
- [x] Etapa 3 — RAG
- [x] Etapa 4 — Memória
- [ ] Etapa 5 — Interface Web

---

## 📄 Licença

Este projeto é destinado a fins de estudo e evolução técnica.
