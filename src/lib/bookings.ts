import { supabase } from './supabase';
import { sendEmail } from './email';
import type { Database } from './database.types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type NewBooking = Database['public']['Tables']['bookings']['Insert'];

export const createBooking = async (bookingData: NewBooking) => {
  try {
    // Check if ride is available
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', bookingData.ride_id)
      .single();

    if (rideError) throw rideError;
    if (!ride) throw new Error('Ride not found');
    if (ride.status !== 'active') throw new Error('Ride is not available for booking');
    if (ride.available_seats < bookingData.seats_booked) {
      throw new Error('Not enough seats available');
    }

    // Create booking
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        status: 'pending',
        request_status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // Send notification email to driver
    try {
      await sendEmail('booking_request', ride.driver_id, ride.id, data.id);
    } catch (emailError) {
      console.error('Failed to send booking request email:', emailError);
      // Continue with booking creation even if email fails
    }

    return { booking: data, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { 
      booking: null, 
      error: error instanceof Error ? error : new Error('Failed to create booking') 
    };
  }
};

export const handleBookingRequest = async (
  bookingId: string,
  status: 'approved' | 'rejected'
) => {
  try {
    const { error } = await supabase
      .rpc('handle_booking_approval', {
        p_booking_id: bookingId,
        p_status: status
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error handling booking request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to handle booking request' 
    };
  }
};

export const getPendingRequests = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rides (
          *,
          profiles (
            name,
            avatar_url
          )
        ),
        profiles!bookings_passenger_id_fkey (
          name,
          avatar_url
        )
      `)
      .eq('rides.driver_id', userId)
      .eq('request_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { requests: data, error: null };
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return { 
      requests: null, 
      error: error instanceof Error ? error.message : 'Failed to get pending requests' 
    };
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rides (
          *,
          profiles (
            name,
            avatar_url
          )
        )
      `)
      .eq('passenger_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { bookings: data, error: null };
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return { 
      bookings: null, 
      error: error instanceof Error ? error.message : 'Failed to get user bookings' 
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