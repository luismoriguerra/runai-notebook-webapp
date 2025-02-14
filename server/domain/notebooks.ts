// This file includes
// - Model 
// - repository dbt connection 
// - use cases 
// - adapters 

import { executeQuery, runQuery } from "../infrastructure/d1";
import { nanoid } from 'nanoid';

export interface Notebook {
  id: string;
  user_id: string;
  title: string;
  description: string;
  url: string;
  created_at: string;
  updated_at: string;
  instructions?: string;
}

export async function getNotebooks(userId: string): Promise<Notebook[]> {
  return executeQuery<Notebook>(
    "SELECT * FROM notebooks WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
}

export async function getNotebook(id: string, userId: string): Promise<Notebook | null> {
  const results = await executeQuery<Notebook>(
    "SELECT * FROM notebooks WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return results[0] || null;
}

export async function createNotebook(
  userId: string, 
  title: string, 
  description: string,
  url: string,
  instructions: string = ''
): Promise<Notebook> {
  const id = nanoid();
  await runQuery(
    "INSERT INTO notebooks (id, user_id, title, description, url, instructions) VALUES (?, ?, ?, ?, ?, ?)",
    [id, userId, title, description, url, instructions]
  );
  const notebook = await getNotebook(id, userId);
  if (!notebook) throw new Error("Failed to create notebook");
  return notebook;
}

export async function updateNotebook(
  id: string, 
  userId: string, 
  title?: string, 
  description?: string,
  url?: string,
  instructions?: string
): Promise<Notebook> {
  const updates: string[] = [];
  const values: (string | undefined)[] = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (url !== undefined) {
    updates.push('url = ?');
    values.push(url);
  }
  if (instructions !== undefined) {
    updates.push('instructions = ?');
    values.push(instructions);
  }

  // Always add updated_at
  updates.push('updated_at = CURRENT_TIMESTAMP');

  // Add WHERE clause parameters
  values.push(id, userId);

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  const query = `UPDATE notebooks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
  await runQuery(query, values);

  const notebook = await getNotebook(id, userId);
  if (!notebook) throw new Error("Failed to update notebook");
  return notebook;
}

export async function deleteNotebook(id: string, userId: string): Promise<void> {
  await runQuery("DELETE FROM notebooks WHERE id = ? AND user_id = ?", [id, userId]);
} 