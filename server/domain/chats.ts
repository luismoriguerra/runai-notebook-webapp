import { executeQuery, runQuery } from "../infrastructure/d1";
import { nanoid } from 'nanoid';

export interface Chat {
    id: string;
    user_id: string;
    notebook_id: string;
    llm_name: string;
    messages: string;
    created_at: string;
    updated_at: string;
}

export async function getChats(userId: string, notebookId: string): Promise<Chat[]> {
    return executeQuery<Chat>(
        "SELECT id, user_id, notebook_id, llm_name, messages, created_at, updated_at FROM chats WHERE user_id = ? and notebook_id = ? ORDER BY created_at DESC",
        [userId, notebookId]
    );
}

export async function getChat(id: string, userId: string, notebookId: string): Promise<Chat | null> {
    const results = await executeQuery<Chat>(
        "SELECT id, user_id, notebook_id, llm_name, messages, created_at, updated_at FROM chats WHERE id = ? AND user_id = ? AND notebook_id = ?",
        [id, userId, notebookId]
    );
    return results[0] || null;
}

export async function createChat(
    userId: string,
    notebookId: string,
    llmName: string,
    messages: string
): Promise<Chat> {
    const id = nanoid();
    const result = await runQuery(
        "INSERT INTO chats (id, user_id, notebook_id, llm_name, messages) VALUES (?, ?, ?, ?, ?) returning *",
        [id, userId, notebookId, llmName, messages]
    );
    const chat = result[0] as Chat;
    if (!chat) throw new Error("Failed to create chat");
    return chat;
}

export async function updateChat(
    id: string,
    userId: string,
    llmName: string,
    messages: string
): Promise<Chat> {

    if (!id || !userId || !llmName || !messages) {
        throw new Error("Invalid input");
    }


    // console.log('updateChat', id, userId, llmName, messages);

    const result = await runQuery(
        "UPDATE chats SET llm_name = ?, messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? returning *",
        [llmName, messages, id, userId]
    );
    // console.log('result', result);
    const chat = result[0] as Chat;
    if (!chat) throw new Error("Failed to update chat");
    return chat;
}

export async function deleteChat(id: string, userId: string): Promise<void> {
    await runQuery("DELETE FROM chats WHERE id = ? AND user_id = ?", [id, userId]);
} 