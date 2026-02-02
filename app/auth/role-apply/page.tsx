import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function RoleApplyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/auth/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect('/auth/login');

  if (user.role === 'ADMIN') redirect('/dashboard/admin');
  if (user.role === 'OFFICER') redirect('/dashboard/officer');
  if (user.role === 'FARMER') redirect('/dashboard/farmer');

  redirect('/auth/login');
}
