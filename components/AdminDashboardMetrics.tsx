'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { ActivityLog } from '@prisma/client';

interface ActivityLogWithDetails extends ActivityLog {
  user: { name: string; id: string; role: string };
  meeting?: any;
  sale?: any;
  distribution?: any;
}

interface AdminDashboardMetricsProps {
  activities: ActivityLogWithDetails[];
}

export function AdminDashboardMetrics({ activities }: AdminDashboardMetricsProps) {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const userMatch = selectedUser === 'all' || activity.userId === selectedUser;
      const typeMatch = selectedType === 'all' || activity.type === selectedType;
      return userMatch && typeMatch;
    });
  }, [activities, selectedUser, selectedType]);

  // Metrics calculations
  const metrics = useMemo(() => {
    const meetings = filteredActivities.filter((a) => a.type === 'MEETING');
    const sales = filteredActivities.filter((a) => a.type === 'SALES');
    const distributions = filteredActivities.filter((a) => a.type === 'DISTRIBUTION');

    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.sale?.amount || 0), 0);
    const totalDistributionQty = distributions.reduce((sum, d) => sum + (d.distribution?.quantity || 0), 0);

    // Unique farmers contacted
    const uniqueFarmers = new Set(
      meetings
        .filter((m) => m.meeting?.category === 'FARMER')
        .map((m) => m.meeting?.attendeeName)
    ).size;

    // Activities by date
    const activitiesByDate = new Map<string, number>();
    filteredActivities.forEach((a) => {
      const date = new Date(a.timestamp).toLocaleDateString('en-IN');
      activitiesByDate.set(date, (activitiesByDate.get(date) || 0) + 1);
    });

    // Activities by type
    const typeDistribution = [
      { name: 'Meetings', value: meetings.length, color: '#3b82f6' },
      { name: 'Sales', value: sales.length, color: '#10b981' },
      { name: 'Distributions', value: distributions.length, color: '#f59e0b' },
    ];

    // Users performance
    const userMetrics = new Map<string, { name: string; meetings: number; sales: number; distributions: number }>();
    filteredActivities.forEach((a) => {
      if (!userMetrics.has(a.userId)) {
        userMetrics.set(a.userId, {
          name: a.user.name,
          meetings: 0,
          sales: 0,
          distributions: 0,
        });
      }
      const metric = userMetrics.get(a.userId)!;
      if (a.type === 'MEETING') metric.meetings++;
      else if (a.type === 'SALES') metric.sales++;
      else if (a.type === 'DISTRIBUTION') metric.distributions++;
    });

    const userPerformance = Array.from(userMetrics.values()).slice(0, 5);

    return {
      totalActivities: filteredActivities.length,
      totalMeetings: meetings.length,
      totalSales: sales.length,
      totalDistributions: distributions.length,
      totalSalesAmount: totalSalesAmount.toFixed(2),
      totalDistributionQty: totalDistributionQty.toFixed(2),
      uniqueFarmers,
      activitiesByDate: Array.from(activitiesByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      typeDistribution,
      userPerformance,
    };
  }, [filteredActivities]);

  const uniqueUsers = Array.from(
    new Map(activities.map((a) => [a.userId, { id: a.userId, name: a.user.name }])).values()
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Activity Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="MEETING">Meetings</option>
            <option value="SALES">Sales</option>
            <option value="DISTRIBUTION">Distributions</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">Total Activities</p>
          <p className="text-4xl font-bold mt-2">{metrics.totalActivities}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">Total Sales Amount</p>
          <p className="text-4xl font-bold mt-2">₹{metrics.totalSalesAmount}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">Unique Farmers</p>
          <p className="text-4xl font-bold mt-2">{metrics.uniqueFarmers}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <p className="text-sm opacity-90">Total Meetings</p>
          <p className="text-4xl font-bold mt-2">{metrics.totalMeetings}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.typeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {metrics.typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Activities Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activities Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.activitiesByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Performance */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performers</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.userPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="meetings" fill="#3b82f6" name="Meetings" />
            <Bar dataKey="sales" fill="#10b981" name="Sales" />
            <Bar dataKey="distributions" fill="#f59e0b" name="Distributions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
