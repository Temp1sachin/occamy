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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Field Officer Dashboard</h1>
          <p className="text-gray-600 mt-1">Log and track your daily field operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Total Activities</p>
            <p className="text-4xl font-bold mt-2">{myActivities.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Meetings</p>
            <p className="text-4xl font-bold mt-2">
              {myActivities.filter((a) => a.type === 'MEETING').length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <p className="text-sm opacity-90">Sales & Distribution</p>
            <p className="text-4xl font-bold mt-2">
              {myActivities.filter((a) => a.type !== 'MEETING').length}
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Log New Activity</h2>
            <ActivityForm />
          </div>

          {/* Mini Map */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">📍 Your Locations</h2>
              <Link
                href="/dashboard/officer/map"
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Full Map →
              </Link>
            </div>
            <div className="flex-1">
              <MapViewWrapper activities={myActivities} height="h-96" />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myActivities.slice(0, 5).map((activity) => (
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
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No activities logged yet</p>
              <p className="text-gray-500">
                Start by logging your first activity using the form above.
              </p>
            </div>
          )}

          {myActivities.length > 5 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Showing 5 of {myActivities.length} activities
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
