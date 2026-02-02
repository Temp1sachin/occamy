'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ActivityLog } from '@prisma/client';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.setIcon(DefaultIcon);

const MeetingIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzAwNjBkYyIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10],
});

const SaleIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzE2YTM0YSIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10],
});

const DistributionIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iI2Y1OTUzMCIvPjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -10],
});

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

export function MapView({ activities, height = 'h-96' }: MapViewProps) {
  // Filter activities with coordinates
  const activitiesWithCoords = activities.filter((a) => a.latitude && a.longitude);

  if (activitiesWithCoords.length === 0) {
    return (
      <div className={`${height} bg-gray-200 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-600">No activities with locations yet</p>
      </div>
    );
  }

  // Calculate center point
  const centerLat =
    activitiesWithCoords.reduce((sum, a) => sum + (a.latitude || 0), 0) /
    activitiesWithCoords.length;
  const centerLng =
    activitiesWithCoords.reduce((sum, a) => sum + (a.longitude || 0), 0) /
    activitiesWithCoords.length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'MEETING':
        return MeetingIcon;
      case 'SALES':
        return SaleIcon;
      case 'DISTRIBUTION':
        return DistributionIcon;
      default:
        return DefaultIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MEETING':
        return 'bg-blue-100 text-blue-800';
      case 'SALES':
        return 'bg-green-100 text-green-800';
      case 'DISTRIBUTION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`${height} rounded-lg overflow-hidden border border-gray-200`}>
      <MapContainer center={[centerLat, centerLng]} zoom={13} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {activitiesWithCoords.map((activity) => (
          <Marker
            key={activity.id}
            position={[activity.latitude!, activity.longitude!]}
            icon={getIcon(activity.type)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{activity.title}</p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${getTypeColor(activity.type)}`}>
                  {activity.type}
                </span>
                <p className="text-gray-600 text-xs mt-2">{activity.user.name}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
