'use client';

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

const COLORS = ['#0060dc', '#16a34a', '#f59530'];

interface AnalyticsProps {
  activities: (ActivityLog & { user: { name: string } })[];
}

export function ActivityAnalytics({ activities }: AnalyticsProps) {
  // Count by type
  const typeCount = activities.reduce(
    (acc, activity) => {
      const existing = acc.find((item) => item.name === activity.type);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: activity.type, value: 1 });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  // Count by user
  const userCount = activities.reduce(
    (acc, activity) => {
      const existing = acc.find((item) => item.name === activity.user.name);
      if (existing) {
        existing.activities++;
      } else {
        acc.push({ name: activity.user.name, activities: 1 });
      }
      return acc;
    },
    [] as { name: string; activities: number }[]
  );

  // Activities per day (last 7 days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map((date) => {
    const count = activities.filter(
      (a) => a.timestamp.toISOString().split('T')[0] === date
    ).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count,
    };
  });

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Activities by Type
          </h3>
          {typeCount.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeCount}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Activity by User */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Activities by Officer
          </h3>
          {userCount.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userCount}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activities" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Activities Trend */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Activities (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#0060dc"
              dot={{ fill: '#0060dc' }}
              name="Activities"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <p className="text-blue-600 text-sm font-semibold">Total Activities</p>
          <p className="text-3xl font-bold text-blue-900">{activities.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <p className="text-green-600 text-sm font-semibold">Types Logged</p>
          <p className="text-3xl font-bold text-green-900">{typeCount.length}</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <p className="text-orange-600 text-sm font-semibold">Team Members</p>
          <p className="text-3xl font-bold text-orange-900">{userCount.length}</p>
        </div>
      </div>
    </div>
  );
}
