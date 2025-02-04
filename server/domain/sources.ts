import { executeQuery, runQuery } from "../infrastructure/d1";
import { nanoid } from 'nanoid';

export interface Source {
  id: string;
  user_id: string;
  notebook_id: string;
  title: string;
  content: string;
  type: 'doc' | 'app' | 'link';
  url: string;
  created_at: string;
  updated_at: string;
}

export async function getSources(userId: string, notebookId: string): Promise<Source[]> {
  return executeQuery<Source>(
    "SELECT * FROM sources WHERE user_id = ? AND notebook_id = ? ORDER BY created_at DESC",
    [userId, notebookId]
  );
}

export async function getSource(id: string, userId: string, notebookId: string): Promise<Source | null> {
  const results = await executeQuery<Source>(
    "SELECT * FROM sources WHERE id = ? AND user_id = ? AND notebook_id = ?",
    [id, userId, notebookId]
  );
  return results[0] || null;
}

export async function createSource(
  userId: string,
  notebookId: string,
  title: string,
  content: string,
  type: 'doc' | 'app' | 'link',
  url: string
): Promise<Source> {
  const id = nanoid();
  await runQuery(
    "INSERT INTO sources (id, user_id, notebook_id, title, content, type, url) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, userId, notebookId, title, content, type, url]
  );
  const source = await getSource(id, userId, notebookId);
  if (!source) throw new Error("Failed to create source");
  return source;
}

export async function updateSource(
  id: string,
  userId: string,
  notebookId: string,
  title: string,
  content: string,
  type: 'doc' | 'app' | 'link',
  url: string
): Promise<Source> {
  const results = await runQuery(
    "UPDATE sources SET title = ?, content = ?, type = ?, url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND notebook_id = ? RETURNING *",
    [title, content, type, url, id, userId, notebookId]
  );
  if (results.length === 0) throw new Error("Failed to update source");
  return results[0];
}

export async function deleteSource(id: string, userId: string, notebookId: string): Promise<void> {
  await runQuery("DELETE FROM sources WHERE id = ? AND user_id = ? AND notebook_id = ?", [id, userId, notebookId]);
} 