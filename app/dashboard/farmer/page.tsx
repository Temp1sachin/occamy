import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Users, TrendingUp } from 'lucide-react';
import { FarmerAuthGuard } from '@/components/FarmerAuthGuard';
import FarmerDashboardClient from '@/components/FarmerDashboardClient';

const prisma = new PrismaClient();

async function FarmerDashboardContent() {
  const session = await getServerSession(authOptions);

  // If no NextAuth session, render OTP-based farmer client
  if (!session?.user?.email) {
    return <FarmerDashboardClient />;
  }

  // Read user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      confirmations: {
        include: {
          activity: {
            include: {
              user: true,
              meeting: true,
              sale: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user || user.role !== 'FARMER') {
    redirect('/auth/login');
  }

  // Get pending confirmations
  const pendingConfirmations = user.confirmations.filter((c) => !c.confirmed);
  const confirmedCount = user.confirmations.filter((c) => c.confirmed).length;
  const recentActivities = user.confirmations.slice(0, 5).map((c) => c.activity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold">Farmer Portal</h1>
            <p className="mt-2 text-green-100 text-lg">
              Confirm your meetings, sales, and interactions
            </p>
            <p className="mt-4 text-sm text-green-100">
              Welcome, <span className="font-semibold">{user.name}</span>
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Pending Confirmations</p>
                <p className="text-5xl font-bold text-green-600">{pendingConfirmations.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200 group-hover:text-green-400 transition" />
            </div>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Confirmed</p>
                <p className="text-5xl font-bold text-emerald-600">{confirmedCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-emerald-200 group-hover:text-emerald-400 transition" />
            </div>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total Interactions</p>
                <p className="text-5xl font-bold text-blue-600">{user.confirmations.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200 group-hover:text-blue-400 transition" />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b border-green-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivities.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-green-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{activity.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{activity.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.verified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {activity.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingConfirmations.length === 0 && recentActivities.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-16 text-center">
            <Calendar className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">No interactions yet</p>
            <p className="text-gray-500">
              Your interactions with field officers will appear here for confirmation
            </p>
          </div>
        )}
      </div>
    );
}

export default FarmerDashboardContent;
