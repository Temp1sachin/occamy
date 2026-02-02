import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapView } from '@/components/MapView';
import { PrismaClient } from '@prisma/client';
import { BarChart3, Map, Eye } from 'lucide-react';

const prisma = new PrismaClient();

const sidebarItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Map View', href: '/dashboard/admin/map', icon: <Map className="w-5 h-5" /> },
  { label: 'All Activities', href: '/dashboard/admin/activities', icon: <Eye className="w-5 h-5" /> },
];

export default async function MapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const activities = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, id: true, role: true } },
      meeting: true,
      sale: true,
      distribution: true,
    },
    orderBy: { timestamp: 'desc' },
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Field Operations Map</h1>
          <p className="text-gray-600 mt-1">Real-time tracking of all field activities</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <MapView activities={activities} height="h-screen" />
        </div>
      </div>
    </DashboardLayout>
  );
}
