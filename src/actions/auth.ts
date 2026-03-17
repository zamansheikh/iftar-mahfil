'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  signToken,
  validateAdminCredentials,
  validateModeratorCredentials,
  getAdminSession,
} from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'ইউজারনেম প্রয়োজন'),
  password: z.string().min(1, 'পাসওয়ার্ড প্রয়োজন'),
});

export type LoginFormState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const parsed = loginSchema.safeParse({ username, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (!validateAdminCredentials(username, password)) {
    return { error: 'ইউজারনেম বা পাসওয়ার্ড ভুল।' };
  }

  const token = await signToken({ role: 'admin', username });
  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  redirect('/admin/dashboard');
}

export async function moderatorLoginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const parsed = loginSchema.safeParse({ username, password });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (!validateModeratorCredentials(username, password)) {
    return { error: 'ইউজারনেম বা পাসওয়ার্ড ভুল।' };
  }

  const token = await signToken({ role: 'moderator', username });
  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  redirect('/moderator/dashboard');
}

export async function logoutAction() {
  const session = await getAdminSession();
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  if (session?.role === 'moderator') {
    redirect('/moderator');
  }
  redirect('/admin');
}

export async function checkAdminSession() {
  return await getAdminSession();
}
