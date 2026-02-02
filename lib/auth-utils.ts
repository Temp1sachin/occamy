import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function requireRole(role: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  if ((user as any).role !== role) {
    redirect('/auth/error?error=AccessDenied');
  }
  return user;
}
