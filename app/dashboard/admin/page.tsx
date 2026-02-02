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
    take: 100,
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of all field operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Total Activities</p>
            <p className="text-4xl font-bold mt-2">{activities.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Meetings</p>
            <p className="text-4xl font-bold mt-2">
              {activities.filter((a) => a.type === 'MEETING').length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Sales & Distribution</p>
            <p className="text-4xl font-bold mt-2">
              {activities.filter((a) => a.type !== 'MEETING').length}
            </p>
          </div>
        </div>

        {/* Analytics Section */}
        <AdminDashboardMetrics activities={activities} />
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Field Operations Map</h2>
            <Link
              href="/dashboard/admin/map"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View Full Map →
            </Link>
          </div>
          <MapViewWrapper activities={activities} height="h-96" />
        </div>

        {/* Recent Activities Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activities</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.slice(0, 10).map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.type === 'MEETING'
                            ? 'bg-blue-100 text-blue-800'
                            : activity.type === 'SALES'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
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
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <Link
                href="/dashboard/admin/activities"
                className="text-green-600 hover:text-green-700 font-medium"
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
