import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ActivityForm } from '@/components/ActivityForm';
import { MapViewWrapper } from '@/components/MapViewWrapper';
import { PrismaClient } from '@prisma/client';
import { Plus, Map } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

const sidebarItems = [
  { label: 'Log Activity', href: '/dashboard/officer', icon: <Plus className="w-5 h-5" /> },
  { label: 'My Map', href: '/dashboard/officer/map', icon: <Map className="w-5 h-5" /> },
];

export default async function OfficerDashboard() {
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
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold">Field Officer Dashboard</h1>
          <p className="mt-2 text-purple-100 text-lg">Log and track your daily field operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <p className="text-sm opacity-90 font-medium">Total Activities</p>
            <p className="text-5xl font-bold mt-3 group-hover:scale-110 transition-transform duration-300">
              {myActivities.length}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <p className="text-sm opacity-90 font-medium">Meetings</p>
            <p className="text-5xl font-bold mt-3 group-hover:scale-110 transition-transform duration-300">
              {myActivities.filter((a) => a.type === 'MEETING').length}
            </p>
          </div>

          <div className="group bg-gradient-to-br from-purple-400 to-purple-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <p className="text-sm opacity-90 font-medium">Sales & Distribution</p>
            <p className="text-5xl font-bold mt-3 group-hover:scale-110 transition-transform duration-300">
              {myActivities.filter((a) => a.type !== 'MEETING').length}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden">
            <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                📝 <span>Log New Activity</span>
              </h2>
            </div>
            <div className="p-8">
              <ActivityForm />
            </div>
          </div>

          {/* Mini Map */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  📍 <span>Your Locations</span>
                </h2>
                <Link
                  href="/dashboard/officer/map"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 font-medium text-sm"
                >
                  Full Map →
                </Link>
              </div>
            </div>
            <div className="flex-1 p-8">
              <MapViewWrapper activities={myActivities} height="h-96" />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
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
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {myActivities.slice(0, 5).map((activity) => (
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
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activity.meeting ? (
                        <span>Met with {activity.meeting.attendeeName}</span>
                      ) : activity.sale ? (
                        <span>{activity.sale.productName} - ₹{activity.sale.amount}</span>
                      ) : (
                        <span>{activity.distribution?.productName}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {myActivities.length === 0 && (
            <div className="p-16 text-center bg-purple-50">
              <p className="text-gray-600 text-lg mb-4 font-medium">No activities logged yet</p>
              <p className="text-gray-500">
                Start by logging your first activity using the form above.
              </p>
            </div>
          )}

          {myActivities.length > 5 && (
            <div className="p-6 bg-purple-50 border-t border-purple-100 text-center">
              <p className="text-gray-600 font-medium">
                Showing 5 of {myActivities.length} activities
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
