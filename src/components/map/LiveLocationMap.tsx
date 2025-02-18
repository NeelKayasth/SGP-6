import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bike, Navigation } from 'lucide-react';
import { startLocationTracking, getNearbyDrivers, subscribeToDriverLocation } from '../../lib/location';
import type { Database } from '../../lib/database.types';

type Driver = Database['public']['Tables']['driver_locations']['Row'] & {
  profiles: {
    name: string;
    avatar_url: string | null;
  };
};

interface LiveLocationMapProps {
  center?: [number, number];
  zoom?: number;
  showNearbyDrivers?: boolean;
  trackDriver?: string;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

// Custom hook for tracking user's location
const useCurrentLocation = (onLocationUpdate?: (lat: number, lng: number) => void) => {
  const [location, setLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const stopTracking = startLocationTracking((loc) => {
      const newLocation: [number, number] = [loc.latitude, loc.longitude];
      setLocation(newLocation);
      onLocationUpdate?.(loc.latitude, loc.longitude);
    });

    return () => {
      stopTracking();
    };
  }, [onLocationUpdate]);

  return location;
};

// Custom marker icons with bike symbol
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="w-10 h-10 bg-${color}-500 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const userIcon = createIcon('blue');
const driverIcon = createIcon('green');

// Gujarat bounds
const GUJARAT_BOUNDS = {
  northEast: [24.7, 74.8], // North-East coordinates
  southWest: [20.1, 68.1]  // South-West coordinates
};

// Component to update map view when location changes
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
    // Set bounds to Gujarat
    map.fitBounds([
      GUJARAT_BOUNDS.southWest,
      GUJARAT_BOUNDS.northEast
    ]);
  }, [center, map]);
  
  return null;
};

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  center = [22.2587, 71.1924], // Centered on Gujarat
  zoom = 7,
  showNearbyDrivers = false,
  trackDriver,
  onLocationUpdate
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const currentLocation = useCurrentLocation(onLocationUpdate);
  const mapCenter = currentLocation || center;

  // Fetch nearby drivers
  useEffect(() => {
    if (showNearbyDrivers && currentLocation) {
      const fetchNearbyDrivers = async () => {
        const [lat, lng] = currentLocation;
        const { drivers: nearbyDrivers } = await getNearbyDrivers(lat, lng);
        if (nearbyDrivers) {
          setDrivers(nearbyDrivers);
        }
      };

      fetchNearbyDrivers();
      const interval = setInterval(fetchNearbyDrivers, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [showNearbyDrivers, currentLocation]);

  // Subscribe to specific driver's location updates
  useEffect(() => {
    if (trackDriver) {
      const unsubscribe = subscribeToDriverLocation(trackDriver, (location) => {
        setDrivers(prev => {
          const driverIndex = prev.findIndex(d => d.driver_id === trackDriver);
          if (driverIndex === -1) return prev;

          const newDrivers = [...prev];
          newDrivers[driverIndex] = {
            ...newDrivers[driverIndex],
            latitude: location.latitude,
            longitude: location.longitude,
            last_updated: new Date(location.timestamp).toISOString()
          };
          return newDrivers;
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [trackDriver]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className="h-full w-full"
      style={{ minHeight: '400px' }}
      maxBounds={[GUJARAT_BOUNDS.southWest, GUJARAT_BOUNDS.northEast]}
      minZoom={7}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {currentLocation && (
        <>
          <MapUpdater center={currentLocation} />
          <Marker position={currentLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <Navigation className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <div className="font-semibold">Your Location</div>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {drivers.map((driver) => (
        <Marker
          key={driver.driver_id}
          position={[driver.latitude, driver.longitude]}
          icon={driverIcon}
        >
          <Popup>
            <div className="text-center">
              <Bike className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <div className="font-semibold">{driver.profiles.name}</div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(driver.last_updated).toLocaleTimeString()}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};