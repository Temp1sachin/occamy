'use client';

import { useEffect, useState } from 'react';
import { MapPin, User, Phone, Mail, TrendingUp, Calendar, Users, Package, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  user: { name: string; id: string; role: string };
  meeting?: any;
  sale?: any;
  distribution?: any;
}

interface ActivityDetailsProps {
  id: string;
}

export function ActivityDetails({ id }: ActivityDetailsProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/activities/${id}`);
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();
        setActivity(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) {
    return <div className="p-4 text-center">Loading activity details...</div>;
  }

  if (error || !activity) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error || 'Activity not found'}</p>
      </div>
    );
  }

  const typeColor = {
    MEETING: 'bg-purple-100 text-purple-800 border-purple-300',
    SALES: 'bg-green-100 text-green-800 border-green-300',
    DISTRIBUTION: 'bg-orange-100 text-orange-800 border-orange-300',
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/activities" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700">
        <ArrowLeft className="w-4 h-4" />
        Back to Activities
      </Link>

      {/* Header */}
      <div className={`border-l-4 p-6 rounded-lg ${typeColor[activity.type as keyof typeof typeColor]}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${typeColor[activity.type as keyof typeof typeColor]}`}>
                {activity.type}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{activity.title}</h1>
            <p className="text-gray-600 mt-1">{activity.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged by</p>
            <p className="font-semibold text-gray-800">{activity.user.name}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      {activity.latitude && activity.longitude && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Location</h2>
          </div>
          <p className="text-gray-700">
            {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
          </p>
          <a
            href={`https://maps.google.com/?q=${activity.latitude},${activity.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
          >
            View on Google Maps →
          </a>
        </div>
      )}

      {/* Meeting Details */}
      {activity.meeting && (
        <div className="bg-purple-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            {activity.meeting.isGroupMeeting ? 'Group Meeting Details' : 'Individual Meeting Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activity.meeting.isGroupMeeting ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">Village / Location</label>
                  <p className="text-lg text-gray-800 mt-1">{activity.meeting.attendeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Number of Attendees</label>
                  <p className="text-lg text-gray-800 mt-1">{activity.meeting.groupSize}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Meeting Type</label>
                  <p className="text-lg text-gray-800 mt-1">{activity.meeting.meetingType}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg text-gray-800 mt-1">{activity.meeting.attendeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-lg text-gray-800 mt-1">{activity.meeting.category}</p>
                </div>
                {activity.meeting.contactPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <p className="text-lg text-gray-800 mt-1">{activity.meeting.contactPhone}</p>
                  </div>
                )}
                {activity.meeting.contactEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="text-lg text-gray-800 mt-1">{activity.meeting.contactEmail}</p>
                  </div>
                )}
                {activity.meeting.businessPotential && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Business Potential
                    </label>
                    <p className="text-lg text-green-700 font-semibold mt-1">{activity.meeting.businessPotential}</p>
                  </div>
                )}
                {activity.meeting.duration && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Duration
                    </label>
                    <p className="text-lg text-gray-800 mt-1">{activity.meeting.duration} minutes</p>
                  </div>
                )}
              </>
            )}
            {activity.meeting.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-800 mt-1 p-3 bg-white rounded border border-gray-200">{activity.meeting.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sales Details */}
      {activity.sale && (
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Sale Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Product</label>
              <p className="text-lg text-gray-800 mt-1">{activity.sale.productName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Buyer</label>
              <p className="text-lg text-gray-800 mt-1">{activity.sale.buyerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Quantity</label>
              <p className="text-lg text-gray-800 mt-1">
                {activity.sale.quantity} {activity.sale.unit}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Amount</label>
              <p className="text-lg text-green-700 font-semibold mt-1">₹{activity.sale.amount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Sale Mode</label>
              <p className="text-lg text-gray-800 mt-1">
                {activity.sale.saleMode === 'DIRECT' ? 'Direct (B2C)' : 'Via Distributor (B2B)'}
              </p>
            </div>
            {activity.sale.isRepeatOrder && (
              <div>
                <label className="text-sm font-medium text-gray-600">Order Type</label>
                <p className="text-lg text-blue-700 font-semibold mt-1">Repeat Order</p>
              </div>
            )}
            {activity.sale.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-800 mt-1 p-3 bg-white rounded border border-gray-200">{activity.sale.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Distribution Details */}
      {activity.distribution && (
        <div className="bg-orange-50 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Distribution Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Product</label>
              <p className="text-lg text-gray-800 mt-1">{activity.distribution.productName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Distributed To</label>
              <p className="text-lg text-gray-800 mt-1">{activity.distribution.distributedTo}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Quantity</label>
              <p className="text-lg text-gray-800 mt-1">
                {activity.distribution.quantity} {activity.distribution.unit}
              </p>
            </div>
            {activity.distribution.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-800 mt-1 p-3 bg-white rounded border border-gray-200">{activity.distribution.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
