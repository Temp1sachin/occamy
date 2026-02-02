import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MapViewWrapper } from '@/components/MapViewWrapper';
import { AdminDashboardMetrics } from '@/components/AdminDashboardMetrics';
import { PrismaClient } from '@prisma/client';
import { BarChart3, Map, Eye } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

const sidebarItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Map View', href: '/dashboard/admin/map', icon: <Map className="w-5 h-5" /> },
  { label: 'All Activities', href: '/dashboard/admin/activities', icon: <Eye className="w-5 h-5" /> },
];

export default async function AdminDashboard() {
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

  const activities = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, id: true, role: true } },
      meeting: true,
      sale: true,
      distribution: true,
    },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-purple-100 text-lg">Overview of all field operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <p className="text-sm opacity-90 font-medium">Total Activities</p>
            <p className="text-5xl font-bold mt-3 group-hover:scale-110 transition-transform duration-300">
              {activities.length}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <p className="text-sm opacity-90 font-medium">Meetings</p>
            <p className="text-5xl font-bold mt-3 group-hover:scale-110 transition-transform duration-300">
              {activities.filter((a) => a.type === 'MEETING').length}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-purple-400 to-purple-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <p className="text-sm opacity-90 font-medium">Sales & Distribution</p>
            <p className="text-5xl font-bold mt-3 group-hover:scale-110 transition-transform duration-300">
              {activities.filter((a) => a.type !== 'MEETING').length}
            </p>
          </div>
        </div>

        {/* Analytics Section */}
        <AdminDashboardMetrics activities={activities} />
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden">
          <div className="p-8 border-b border-purple-100">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Field Operations Map</h2>
              <Link
                href="/dashboard/admin/map"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium"
              >
                View Full Map →
              </Link>
            </div>
          </div>
          <div className="p-8">
            <MapViewWrapper activities={activities} height="h-96" />
          </div>
        </div>

        {/* Recent Activities Table */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden">
          <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
            <h2 className="text-3xl font-bold text-gray-900">Recent Activities</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50 border-b border-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {activities.slice(0, 10).map((activity) => (
                  <tr key={activity.id} className="hover:bg-purple-50 transition-colors duration-200 cursor-pointer group">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          activity.type === 'MEETING'
                            ? 'bg-purple-100 text-purple-800'
                            : activity.type === 'SALES'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                      {activity.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activity.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activity.latitude && activity.longitude ? (
                        <span className="flex items-center gap-1">
                          📍{' '}
                          {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-gray-400">No location</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activities.length > 10 && (
            <div className="p-6 bg-purple-50 border-t border-purple-100 text-center">
              <Link
                href="/dashboard/admin/activities"
                className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium"
              >
                View all {activities.length} activities →
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
