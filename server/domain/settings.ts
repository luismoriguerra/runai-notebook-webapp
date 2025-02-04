import { executeQuery, runQuery } from "../infrastructure/d1";
import { v4 as uuidv4 } from "uuid";

export interface Setting {
  id: string;
  user_id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export async function getSettings(userId: string): Promise<Setting[]> {
  return executeQuery<Setting>(
    "SELECT * FROM settings WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
}

export async function getSetting(id: string, userId: string): Promise<Setting | null> {
  const results = await executeQuery<Setting>(
    "SELECT * FROM settings WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return results[0] || null;
}

export async function createSetting(userId: string, key: string, value: string): Promise<Setting> {
  const id = uuidv4();
  await runQuery(
    "INSERT INTO settings (id, user_id, key, value) VALUES (?, ?, ?, ?)",
    [id, userId, key, value]
  );
  const setting = await getSetting(id, userId);
  if (!setting) throw new Error("Failed to create setting");
  return setting;
}

export async function updateSetting(id: string, userId: string, key: string, value: string): Promise<Setting> {
  await runQuery(
    "UPDATE settings SET key = ?, value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    [key, value, id, userId]
  );
  const setting = await getSetting(id, userId);
  if (!setting) throw new Error("Failed to update setting");
  return setting;
}

export async function deleteSetting(id: string, userId: string): Promise<void> {
  await runQuery("DELETE FROM settings WHERE id = ? AND user_id = ?", [id, userId]);
} 