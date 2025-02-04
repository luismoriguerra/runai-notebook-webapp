/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export function getDb() {
  return getRequestContext().env.DB;
}

export async function executeQuery<T>(query: string, bind: any[] = []) {
  const db = getDb();
  const stmt = db.prepare(query).bind(...bind);
  const { results } = await stmt.all<T>();
  return results;
}

export async function runQuery<T>(query: string, bind: any[] = []) {
  const db = getDb();
  const stmt = db.prepare(query).bind(...bind);
  const { results } = await stmt.run<T>();
  return results;
} 