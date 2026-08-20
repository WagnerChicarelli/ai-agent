import Database from "better-sqlite3";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export interface ChatMessage {
  id: number;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

let db: Database.Database | null = null;
const DB_PATH = path.resolve("data/agent.db");

async function ensureDbExists(): Promise<void> {
  const dir = path.dirname(DB_PATH);
  await fs.mkdir(dir, { recursive: true });
}

function getDb(): Database.Database {
  if (db) return db;

  db = new Database(DB_PATH);

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_thread_id ON conversations(thread_id)
  `);

  return db;
}

export function saveMessage(
  threadId: string,
  role: "user" | "assistant",
  content: string
): void {
  const database = getDb();
  const stmt = database.prepare(
    "INSERT INTO conversations (thread_id, role, content) VALUES (?, ?, ?)"
  );
  stmt.run(threadId, role, content);
}

export function getConversationHistory(
  threadId: string,
  limit: number = 50
): ChatMessage[] {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT id, thread_id, role, content, timestamp FROM conversations WHERE thread_id = ? ORDER BY id DESC LIMIT ?"
  );
  const rows = stmt.all(threadId, limit) as Array<{
    id: number;
    thread_id: string;
    role: string;
    content: string;
    timestamp: string;
  }>;

  return rows.reverse().map((row) => ({
    id: row.id,
    threadId: row.thread_id,
    role: row.role as "user" | "assistant",
    content: row.content,
    timestamp: row.timestamp,
  }));
}

export function getAllThreads(): Array<{
  threadId: string;
  messageCount: number;
  lastMessage: string;
}> {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT 
      thread_id as threadId,
      COUNT(*) as messageCount,
      (SELECT content FROM conversations WHERE thread_id = c.thread_id ORDER BY id DESC LIMIT 1) as lastMessage
    FROM conversations c
    GROUP BY thread_id
    ORDER BY MAX(id) DESC
  `);
  return stmt.all() as Array<{
    threadId: string;
    messageCount: number;
    lastMessage: string;
  }>;
}

export function getThreadStats(threadId: string): {
  messageCount: number;
  firstMessage?: string;
  lastMessage?: string;
} {
  const database = getDb();

  const countStmt = database.prepare(
    "SELECT COUNT(*) as count FROM conversations WHERE thread_id = ?"
  );
  const { count } = countStmt.get(threadId) as { count: number };

  if (count === 0) {
    return { messageCount: 0 };
  }

  const firstStmt = database.prepare(
    "SELECT content FROM conversations WHERE thread_id = ? ORDER BY id ASC LIMIT 1"
  );
  const first = firstStmt.get(threadId) as { content: string } | undefined;

  const lastStmt = database.prepare(
    "SELECT content FROM conversations WHERE thread_id = ? ORDER BY id DESC LIMIT 1"
  );
  const last = lastStmt.get(threadId) as { content: string } | undefined;

  return {
    messageCount: count,
    firstMessage: first?.content,
    lastMessage: last?.content,
  };
}

export function clearThread(threadId: string): number {
  const database = getDb();
  const stmt = database.prepare(
    "DELETE FROM conversations WHERE thread_id = ?"
  );
  const result = stmt.run(threadId);
  return result.changes;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
