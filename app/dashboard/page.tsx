import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // Read authoritative role from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin');
  } else {
    redirect('/dashboard/officer');
  }
}
