import { supabase } from './supabase';
import { sendEmail } from './email';
import type { Database } from './database.types';

type Request = Database['public']['Tables']['bookings']['Row'] & {
  profiles: {
    name: string;
    avatar_url: string | null;
  };
  rides: {
    from_location: string;
    to_location: string;
    departure_date: string;
    departure_time: string;
    driver_id: string;
  };
};

export const getPendingRequests = async (driverId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles!bookings_passenger_id_fkey (
        name,
        avatar_url
      ),
      rides!inner (
        from_location,
        to_location,
        departure_date,
        departure_time,
        driver_id
      )
    `)
    .eq('request_status', 'pending')
    .eq('rides.driver_id', driverId);

  return { requests: data as Request[] | null, error };
};

export const handleRequest = async (
  bookingId: string,
  status: 'approved' | 'rejected'
) => {
  try {
    // Start a transaction to update both statuses
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update({ 
        request_status: status,
        status: status === 'approved' ? 'confirmed' : 'cancelled'
      })
      .eq('id', bookingId)
      .select(`
        *,
        rides (
          driver_id,
          from_location,
          to_location,
          departure_date,
          departure_time
        ),
        profiles!bookings_passenger_id_fkey (
          name,
          email
        )
      `)
      .single();

    if (bookingError) throw bookingError;

    if (!booking) throw new Error('Booking not found');

    // If approved, update the ride's available seats
    if (status === 'approved') {
      const { error: rideError } = await supabase
        .rpc('update_ride_seats', {
          p_ride_id: booking.ride_id,
          p_seats_booked: booking.seats_booked
        });

      if (rideError) throw rideError;

      // Send confirmation email to passenger
      await sendEmail('ride_booked', booking.passenger_id, undefined, booking.id);

      // Send notification email to driver
      await sendEmail('ride_booked', booking.rides.driver_id, undefined, booking.id);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error handling request:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to handle request' 
    };
  }
};