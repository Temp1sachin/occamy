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
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const { id } = await params;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Activity Details</h1>
          <p className="text-gray-600 mt-1">View complete activity information</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <ActivityDetails id={id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
