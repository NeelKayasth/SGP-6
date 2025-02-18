import { supabase } from './supabase';
import type { Database } from './database.types';

type Location = {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
};

export const updateDriverLocation = async (driverId: string, location: Location) => {
  try {
    const { error } = await supabase
      .from('driver_locations')
      .upsert({
        driver_id: driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        last_updated: new Date(location.timestamp).toISOString()
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating location:', error);
    return { error };
  }
};

export const subscribeToDriverLocation = (
  driverId: string,
  onUpdate: (location: Location) => void
) => {
  const channel = supabase
    .channel(`driver-location-${driverId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'driver_locations',
      filter: `driver_id=eq.${driverId}`
    }, (payload) => {
      const location = payload.new as any;
      onUpdate({
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
        timestamp: new Date(location.last_updated).getTime()
      });
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

export const getNearbyDrivers = async (
  latitude: number,
  longitude: number,
  radiusInKm: number = 10
) => {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_drivers', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_km: radiusInKm
      });

    if (error) throw error;
    return { drivers: data, error: null };
  } catch (error) {
    console.error('Error getting nearby drivers:', error);
    return { drivers: null, error };
  }
};

export const startLocationTracking = (
  onLocationUpdate: (location: Location) => void,
  options: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  }
) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp
      };
      onLocationUpdate(location);
    },
    (error) => {
      console.error('Error getting location:', error);
    },
    options
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
};