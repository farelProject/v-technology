
'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { ChatSession, StoredUser, ChatLimit } from './types';

const chatDbPath = path.join(process.cwd(), 'src', 'data', 'chats.json');
const userDbPath = path.join(process.cwd(), 'src', 'data', 'users.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

type ChatDatabase = Record<string, ChatSession[]>;

// User DB Functions
async function readUsers(): Promise<StoredUser[]> {
  try {
    const data = await fs.readFile(userDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: StoredUser[]) {
  await fs.writeFile(userDbPath, JSON.stringify(users, null, 2), 'utf-8');
}


// Chat DB Functions
async function readChatDatabase(): Promise<ChatDatabase> {
  try {
    const data = await fs.readFile(chatDbPath, 'utf-8');
    if (!data) {
        return {};
    }
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
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
    db[userId][sessionIndex] = session;
  } else {
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

  const sessionToDelete = db[userId].find((s) => s.id === sessionId);
  const initialLength = db[userId].length;
  
  db[userId] = db[userId].filter((s) => s.id !== sessionId);

  if (db[userId].length === initialLength) {
    return { success: false, message: 'Chat session not found.' };
  }

  // If a session was found and deleted, also delete its associated image files.
  if (sessionToDelete) {
    for (const message of sessionToDelete.messages) {
        // Check for locally hosted images
        if(message.image_url && message.image_url.startsWith('/uploads/')) {
            try {
                const filename = path.basename(message.image_url);
                await fs.unlink(path.join(uploadsDir, filename));
            } catch(error) {
                // Log error but continue, as the chat data is more important.
                console.error(`Failed to delete image file: ${message.image_url}`, error);
            }
        }
    }
  }

  await writeChatDatabase(db);
  return { success: true };
}

// Chat Limit Functions
export async function getAndUpdateChatLimit(userId: string, increment: boolean = true): Promise<ChatLimit | null> {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return null;
    }
    
    const user = users[userIndex];
    const now = new Date();
    const lastResetDate = new Date(user.chatLimit.lastReset);

    // Reset limit if it's a new day (based on calendar date, not 24 hours)
    const isNewDay = now.toDateString() !== lastResetDate.toDateString();

    if (isNewDay) {
        user.chatLimit.count = increment ? 1 : 0; // Reset to 1 as this is the first chat of the new day
        user.chatLimit.lastReset = now.toISOString();
    } else {
        if(increment) {
            user.chatLimit.count += 1;
        }
    }

    await writeUsers(users);
    return user.chatLimit;
}
