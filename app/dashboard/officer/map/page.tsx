import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapViewWrapper } from '@/components/MapViewWrapper';
import { PrismaClient } from '@prisma/client';
import { Plus, Map } from 'lucide-react';

const prisma = new PrismaClient();

const sidebarItems = [
  { label: 'Log Activity', href: '/dashboard/officer', icon: <Plus className="w-5 h-5" /> },
  { label: 'My Map', href: '/dashboard/officer/map', icon: <Map className="w-5 h-5" /> },
];

export default async function OfficerMapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  // Read authoritative role from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'ADMIN')) {
    redirect('/dashboard/admin');
  }

  const userId = user.id;

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
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold">Your Field Locations</h1>
          <p className="mt-2 text-purple-100 text-lg">Map of all your logged activities ({myActivities.length} total)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100">
          <MapViewWrapper activities={myActivities} height="h-screen" />
        </div>
      </div>
    </DashboardLayout>
  );
}
