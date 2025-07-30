'use server';

import { promises as fs } from 'fs';
import path from 'path';

// NOTE: This is a simplified, insecure local auth system for demonstration.
// DO NOT use this in a production environment.
// Passwords are stored in plain text.

const dbPath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users: any[]) {
  await fs.writeFile(dbPath, JSON.stringify(users, null, 2), 'utf-8');
}

export async function registerUser({ name, email, password }: any) {
  const users = await readUsers();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return { success: false, message: 'User with this email already exists.' };
  }

  const newUser = {
    id: new Date().getTime().toString(), // simple unique id
    name,
    email,
    password, // In a real app, hash this password!
  };

  users.push(newUser);
  await writeUsers(users);

  return { success: true, user: { name: newUser.name, email: newUser.email } };
}

export async function loginUser({ email, password }: any) {
  const users = await readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  // In a real app, compare hashed passwords!
  if (user.password !== password) {
    return { success: false, message: 'Invalid email or password.' };
  }

  return { success: true, user: { name: user.name, email: user.email } };
}

export async function deleteUser(email: string) {
  let users = await readUsers();
  const userIndex = users.findIndex((user) => user.email === email);

  if (userIndex === -1) {
    return { success: false, message: 'User not found.' };
  }

  // In a real system, you would also delete all associated data like chat history.
  users.splice(userIndex, 1);
  await writeUsers(users);

  return { success: true, message: 'User deleted successfully.' };
}
