import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  // If already authenticated, redirect to dashboard
  if (session?.user) {
    const role = (session.user as any).role;
    if (role === 'ADMIN') {
      redirect('/dashboard/admin');
    } else {
      redirect('/dashboard/officer');
    }
  }

  return <LoginClient />;
}
