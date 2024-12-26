import { supabase } from './supabase';
import type { Database } from './database.types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type NewBooking = Database['public']['Tables']['bookings']['Insert'];

export const createBooking = async (bookingData: NewBooking) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select()
    .single();

  if (!error) {
    // Update available seats in the ride
    await supabase.rpc('update_ride_seats', {
      p_ride_id: bookingData.ride_id,
      p_seats_booked: bookingData.seats_booked
    });
  }

  return { booking: data, error };
};

export const updateBookingStatus = async (
  bookingId: string,
  status: 'confirmed' | 'cancelled'
) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  return { booking: data, error };
};