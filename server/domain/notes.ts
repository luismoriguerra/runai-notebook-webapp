import { executeQuery, runQuery } from "../infrastructure/d1";
import { nanoid } from 'nanoid';

export interface Note {
  id: string;
  user_id?: string;
  notebook_id?: string;
  chat_id?: string;
  title: string;
  url: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function getNotes(userId: string, notebookId: string): Promise<Note[]> {
  return executeQuery<Note>(
    "SELECT id, title, url, content, created_at, updated_at FROM notes WHERE user_id = ? AND notebook_id = ? ORDER BY created_at DESC",
    [userId, notebookId]
  );
}

export async function getNote(id: string, userId: string, notebookId: string): Promise<Note | null> {
  const results = await executeQuery<Note>(
    "SELECT id, title, url, content, created_at, updated_at FROM notes WHERE id = ? AND user_id = ? AND notebook_id = ?",
    [id, userId, notebookId]
  );
  return results[0] || null;
}

export async function createNote(
  userId: string,
  notebookId: string,
  chatId: string,
  title: string,
  url: string,
  content: string
): Promise<Note> {
  const id = nanoid();
  await runQuery(
    "INSERT INTO notes (id, user_id, notebook_id, chat_id, title, url, content) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, userId, notebookId, chatId, title, url, content]
  );
  const note = await getNote(id, userId, notebookId);
  if (!note) throw new Error("Failed to create note");
  return note;
}

export async function updateNote(
  id: string,
  userId: string,
  notebookId: string,
  title: string,
  url: string,
  content: string
): Promise<Note> {
  const results = await runQuery(
    "UPDATE notes SET title = ?, url = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND notebook_id = ? RETURNING *",
    [title, url, content, id, userId, notebookId]
  );
  if (results.length === 0) throw new Error("Failed to update note");
  return results[0];
}

export async function deleteNote(id: string, userId: string, notebookId: string): Promise<void> {
  await runQuery("DELETE FROM notes WHERE id = ? AND user_id = ? AND notebook_id = ?", [id, userId, notebookId]);
} 