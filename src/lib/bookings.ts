import { supabase } from './supabase';
import type { Database } from './database.types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type NewBooking = Database['public']['Tables']['bookings']['Insert'];

export const createBooking = async (bookingData: NewBooking) => {
  try {
    // Start a transaction
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Update available seats
    const { error: updateError } = await supabase
      .rpc('update_ride_seats', {
        p_ride_id: bookingData.ride_id,
        p_seats_booked: bookingData.seats_booked
      });

    if (updateError) {
      // If updating seats fails, delete the booking
      await supabase
        .from('bookings')
        .delete()
        .eq('id', booking.id);
      throw updateError;
    }

    return { booking, error: null };
  } catch (error) {
    return { 
      booking: null, 
      error: error instanceof Error ? error : new Error('Failed to create booking') 
    };
  }
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