import { tool } from "@langchain/core/tools";
import { z } from "zod";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export const readFileTool = tool(
  async ({ filePath }) => {
    try {
      const resolvedPath = path.resolve(filePath);
      const content = await fs.readFile(resolvedPath, "utf-8");
      return `Conteúdo de ${filePath}:\n\n${content}`;
    } catch (error) {
      return `Erro ao ler arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
    }
  },
  {
    name: "read_file",
    description:
      "Lê o conteúdo de um arquivo no sistema de arquivos. Use esta ferramenta para verificar o conteúdo de arquivos existentes.",
    schema: z.object({
      filePath: z
        .string()
        .describe(
          "O caminho completo ou relativo do arquivo a ser lido"
        ),
    }),
  }
);

export const writeFileTool = tool(
  async ({ filePath, content }) => {
    try {
      const resolvedPath = path.resolve(filePath);
      const dir = path.dirname(resolvedPath);

      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(resolvedPath, content, "utf-8");

      return `Arquivo criado/atualizado com sucesso: ${filePath}`;
    } catch (error) {
      return `Erro ao escrever arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
    }
  },
  {
    name: "write_file",
    description:
      "Escreve conteúdo em um arquivo no sistema de arquivos. Use esta ferramenta para criar ou atualizar arquivos de texto.",
    schema: z.object({
      filePath: z
        .string()
        .describe(
          "O caminho completo ou relativo do arquivo a ser escrito"
        ),
      content: z
        .string()
        .describe("O conteúdo a ser escrito no arquivo"),
    }),
  }
);

export const listFilesTool = tool(
  async ({ dirPath }) => {
    try {
      const resolvedPath = path.resolve(dirPath);
      const entries = await fs.readdir(resolvedPath, {
        withFileTypes: true,
      });

      const files = entries.map((entry) => {
        const type = entry.isDirectory() ? "📁" : "📄";
        return `${type} ${entry.name}`;
      });

      if (files.length === 0) {
        return `Diretório vazio: ${dirPath}`;
      }

      return `Conteúdo de ${dirPath}:\n${files.join("\n")}`;
    } catch (error) {
      return `Erro ao listar diretório: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
    }
  },
  {
    name: "list_files",
    description:
      "Lista os arquivos e diretórios em um caminho específico. Use esta ferramenta para explorar a estrutura de arquivos.",
    schema: z.object({
      dirPath: z
        .string()
        .describe(
          "O caminho do diretório a ser listado"
        ),
    }),
  }
);
