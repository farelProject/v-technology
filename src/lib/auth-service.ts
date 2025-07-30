'use server';

import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const dbPath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
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

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: new Date().getTime().toString(),
    name,
    email,
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
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

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
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

  users.splice(userIndex, 1);
  await writeUsers(users);

  return { success: true, message: 'User deleted successfully.' };
}

export async function generatePasswordResetToken(email: string) {
    const users = await readUsers();
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hour from now

    users[userIndex].resetPasswordToken = resetToken;
    users[userIndex].resetPasswordExpires = tokenExpiry;

    await writeUsers(users);

    return { success: true, token: resetToken };
}


export async function resetPassword(token: string, newPassword: any) {
    const users = await readUsers();
    const userIndex = users.findIndex(
        (u) => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now()
    );

    if (userIndex === -1) {
        return { success: false, message: 'Password reset token is invalid or has expired.' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    users[userIndex].resetPasswordToken = null;
    users[userIndex].resetPasswordExpires = null;
    
    await writeUsers(users);

    return { success: true, message: 'Password has been reset successfully.' };
}

export async function getUserByResetToken(token: string) {
    const users = await readUsers();
    const user = users.find(
        (u) => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now()
    );

    if (!user) {
        return { success: false, message: 'Token is invalid or has expired.' };
    }

    return { success: true, email: user.email };
}
