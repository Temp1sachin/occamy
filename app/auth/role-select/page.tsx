import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RoleSelectClient from './RoleSelectClient';

export default async function RoleSelectPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/auth/login');

  return <RoleSelectClient />;
}
