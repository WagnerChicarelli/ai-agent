import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface SimpleDocument {
  content: string;
  metadata: {
    source: string;
    pageNumber?: number;
  };
}

const documents: SimpleDocument[] = [];

export async function loadTextFile(filePath: string): Promise<SimpleDocument[]> {
  const resolvedPath = path.resolve(filePath);
  const content = await fs.readFile(resolvedPath, "utf-8");

  const doc: SimpleDocument = {
    content,
    metadata: { source: resolvedPath },
  };

  documents.push(doc);
  return [doc];
}

export async function loadDirectory(dirPath: string): Promise<SimpleDocument[]> {
  const resolvedPath = path.resolve(dirPath);
  const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
  const loadedDocs: SimpleDocument[] = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if ([".txt", ".md"].includes(ext)) {
        const filePath = path.join(resolvedPath, entry.name);
        const docs = await loadTextFile(filePath);
        loadedDocs.push(...docs);
      }
    }
  }

  return loadedDocs;
}

export async function loadDocuments(docPath: string): Promise<SimpleDocument[]> {
  const stat = await fs.stat(docPath);

  if (stat.isDirectory()) {
    return loadDirectory(docPath);
  } else {
    return loadTextFile(docPath);
  }
}

export function getAllDocuments(): SimpleDocument[] {
  return documents;
}

export function clearDocuments(): void {
  documents.length = 0;
}

export function searchDocuments(query: string, k: number = 3): SimpleDocument[] {
  const queryLower = query.toLowerCase();

  const scored = documents.map((doc) => {
    const contentLower = doc.content.toLowerCase();
    const words = queryLower.split(/\s+/);
    let score = 0;

    for (const word of words) {
      if (contentLower.includes(word)) {
        score += 1;
      }
    }

    return { doc, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((item) => item.doc);
}
