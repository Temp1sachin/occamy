import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PrismaClient } from '@prisma/client';
import { BarChart3, Map, Eye } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

const sidebarItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Map View', href: '/dashboard/admin/map', icon: <Map className="w-5 h-5" /> },
  { label: 'All Activities', href: '/dashboard/admin/activities', icon: <Eye className="w-5 h-5" /> },
];

export default async function ActivitiesPage() {
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
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold">All Activities</h1>
          <p className="mt-2 text-purple-100 text-lg">Complete history of field operations ({activities.length} total)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden">
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
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-purple-50 transition-colors duration-200 cursor-pointer group">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
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
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">{activity.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {activity.description || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{activity.user.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleDateString()}{' '}
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/admin/activities/${activity.id}`}
                        className="inline-block px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium text-xs"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activities.length === 0 && (
            <div className="p-16 text-center bg-purple-50">
              <p className="text-gray-600 text-lg font-medium">No activities yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
