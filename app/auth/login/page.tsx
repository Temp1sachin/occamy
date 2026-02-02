import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import LoginClient from './LoginClient';

const prisma = new PrismaClient();

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role === 'ADMIN') redirect('/dashboard/admin');
    if (user?.role === 'OFFICER') redirect('/dashboard/officer');
    if (user?.role === 'FARMER') redirect('/dashboard/farmer');
  }

  return <LoginClient />;
}
