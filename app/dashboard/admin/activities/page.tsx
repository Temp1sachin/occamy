import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PrismaClient } from '@prisma/client';
import { BarChart3, Map, Eye } from 'lucide-react';

const prisma = new PrismaClient();

const sidebarItems = [
  { label: 'Overview', href: '/dashboard/admin', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Map View', href: '/dashboard/admin/map', icon: <Map className="w-5 h-5" /> },
  { label: 'All Activities', href: '/dashboard/admin/activities', icon: <Eye className="w-5 h-5" /> },
];

export default async function ActivitiesPage() {
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
          <h1 className="text-3xl font-bold text-gray-800">All Activities</h1>
          <p className="text-gray-600 mt-1">
            Complete history of field operations ({activities.length} total)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
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
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
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
                      {activity.meeting && (
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-semibold">Attendee:</span>{' '}
                            {activity.meeting.attendeeName}
                          </p>
                          <p>
                            <span className="font-semibold">Category:</span>{' '}
                            {activity.meeting.category}
                          </p>
                          {activity.meeting.duration && (
                            <p>
                              <span className="font-semibold">Duration:</span>{' '}
                              {activity.meeting.duration} min
                            </p>
                          )}
                        </div>
                      )}
                      {activity.sale && (
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-semibold">Product:</span>{' '}
                            {activity.sale.productName}
                          </p>
                          <p>
                            <span className="font-semibold">Qty:</span> {activity.sale.quantity}{' '}
                            {activity.sale.unit}
                          </p>
                          <p>
                            <span className="font-semibold">Amount:</span> ₹{activity.sale.amount}
                          </p>
                        </div>
                      )}
                      {activity.distribution && (
                        <div className="text-xs space-y-1">
                          <p>
                            <span className="font-semibold">Product:</span>{' '}
                            {activity.distribution.productName}
                          </p>
                          <p>
                            <span className="font-semibold">Qty:</span>{' '}
                            {activity.distribution.quantity} {activity.distribution.unit}
                          </p>
                          <p>
                            <span className="font-semibold">To:</span>{' '}
                            {activity.distribution.distributedTo}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activities.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg">No activities yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
