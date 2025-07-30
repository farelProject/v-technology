
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { ChatSession } from './types';

const chatDbPath = path.join(process.cwd(), 'src', 'data', 'chats.json');

type ChatDatabase = Record<string, ChatSession[]>;

async function readChatDatabase(): Promise<ChatDatabase> {
  try {
    const data = await fs.readFile(chatDbPath, 'utf-8');
    // If the file is empty, return an empty object
    if (!data) {
        return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If file doesn't exist, create it with an empty object
      await fs.writeFile(chatDbPath, '{}', 'utf-8');
      return {};
    }
    throw error;
  }
}

async function writeChatDatabase(db: ChatDatabase) {
  await fs.writeFile(chatDbPath, JSON.stringify(db, null, 2), 'utf-8');
}

export async function createNewChatSession(userId: string): Promise<ChatSession> {
    return {
        id: new Date().getTime().toString(),
        userId,
        title: '', // Title will be set on first message
        timestamp: new Date().toISOString(),
        messages: [],
    }
}

export async function getAllChatSessions(userId: string): Promise<ChatSession[]> {
  const db = await readChatDatabase();
  return db[userId] || [];
}

export async function getChatSession(
  userId: string,
  sessionId: string
): Promise<ChatSession | null> {
  const userSessions = await getAllChatSessions(userId);
  return userSessions.find((s) => s.id === sessionId) || null;
}

export async function saveChatSession(userId: string, session: ChatSession) {
  const db = await readChatDatabase();
  if (!db[userId]) {
    db[userId] = [];
  }

  const sessionIndex = db[userId].findIndex((s) => s.id === session.id);
  if (sessionIndex > -1) {
    // Update existing session
    db[userId][sessionIndex] = session;
  } else {
    // Add new session
    db[userId].push(session);
  }

  await writeChatDatabase(db);
  return { success: true };
}

export async function deleteChatSession(userId: string, sessionId: string) {
  const db = await readChatDatabase();
  if (!db[userId]) {
    return { success: false, message: 'User not found.' };
  }

  const initialLength = db[userId].length;
  db[userId] = db[userId].filter((s) => s.id !== sessionId);

  if (db[userId].length === initialLength) {
    return { success: false, message: 'Chat session not found.' };
  }

  await writeChatDatabase(db);
  return { success: true };
}
