import { supabase } from './supabase';
import type { Database } from './database.types';

type Ride = Database['public']['Tables']['rides']['Row'];
type NewRide = Database['public']['Tables']['rides']['Insert'];

export const createRide = async (rideData: NewRide) => {
  const { data, error } = await supabase
    .from('rides')
    .insert([rideData])
    .select()
    .single();

  return { ride: data, error };
};

export const searchRides = async (
  fromLocation: string,
  toLocation: string,
  date: string
) => {
  const { data, error } = await supabase
    .from('rides')
    .select('*, profiles(name, avatar_url)')
    .eq('status', 'active')
    .ilike('from_location', `%${fromLocation}%`)
    .ilike('to_location', `%${toLocation}%`)
    .gte('departure_date', date)
    .order('departure_date', { ascending: true });

  return { rides: data, error };
};

export const getUserRides = async (userId: string) => {
  const { data: offeredRides, error: offeredError } = await supabase
    .from('rides')
    .select('*, profiles(name, avatar_url)')
    .eq('driver_id', userId)
    .order('departure_date', { ascending: true });

  const { data: bookedRides, error: bookedError } = await supabase
    .from('bookings')
    .select('*, rides(*, profiles(name, avatar_url))')
    .eq('passenger_id', userId)
    .order('created_at', { ascending: false });

  return {
    offered: offeredRides,
    booked: bookedRides,
    error: offeredError || bookedError
  };
};