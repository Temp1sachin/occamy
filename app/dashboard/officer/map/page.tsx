import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapView } from '@/components/MapView';
import { PrismaClient } from '@prisma/client';
import { Plus, Map } from 'lucide-react';

const prisma = new PrismaClient();

const sidebarItems = [
  { label: 'Log Activity', href: '/dashboard/officer', icon: <Plus className="w-5 h-5" /> },
  { label: 'My Map', href: '/dashboard/officer/map', icon: <Map className="w-5 h-5" /> },
];

export default async function OfficerMapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'OFFICER') {
    redirect('/auth/login');
  }

  const userId = (session.user as any).id;

  const myActivities = await prisma.activityLog.findMany({
    where: { userId },
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
          <h1 className="text-3xl font-bold text-gray-800">Your Field Locations</h1>
          <p className="text-gray-600 mt-1">
            Map of all your logged activities ({myActivities.length} total)
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <MapView activities={myActivities} height="h-screen" />
        </div>
      </div>
    </DashboardLayout>
  );
}
