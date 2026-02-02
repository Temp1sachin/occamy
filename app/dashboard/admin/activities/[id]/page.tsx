import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ActivityDetails } from '@/components/ActivityDetails';
import { BarChart3, Map, Eye } from 'lucide-react';

const sidebarItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Map View', href: '/dashboard/admin/map', icon: <Map className="w-5 h-5" /> },
  { label: 'All Activities', href: '/dashboard/admin/activities', icon: <Eye className="w-5 h-5" /> },
];

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // Read authoritative role from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard/officer');
  }

  const { id } = await params;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold">Activity Details</h1>
          <p className="mt-2 text-purple-100 text-lg">View complete activity information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 p-8">
          <ActivityDetails id={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
