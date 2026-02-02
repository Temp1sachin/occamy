'use client';

import dynamic from 'next/dynamic';
import { ActivityLog } from '@prisma/client';

interface ActivityLogWithDetails extends ActivityLog {
  user: { name: string; id: string };
  meeting?: any;
  sale?: any;
  distribution?: any;
}

interface MapViewProps {
  activities: ActivityLogWithDetails[];
  height?: string;
}

const MapViewComponent = dynamic(() => import('./MapView').then(mod => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-96`}>
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

export function MapViewWrapper({ activities, height = 'h-96' }: MapViewProps) {
  return <MapViewComponent activities={activities} height={height} />;
}
