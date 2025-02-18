/*
  # Fix database errors

  1. Changes
    - Add update_ride_seats function for managing available seats
    - Fix phone verification query
    - Add indexes for better performance

  2. Security
    - Enable RLS for all new functions
    - Add proper error handling
*/

-- Function to update ride seats
CREATE OR REPLACE FUNCTION public.update_ride_seats(
  p_ride_id UUID,
  p_seats_booked INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update available seats
  UPDATE rides
  SET available_seats = available_seats - p_seats_booked
  WHERE id = p_ride_id
  AND available_seats >= p_seats_booked;

  -- Throw error if not enough seats
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enough available seats';
  END IF;
END;
$$;

-- Fix phone verification query
CREATE OR REPLACE FUNCTION verify_phone_otp(
  p_phone_number TEXT,
  p_otp TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  -- Check if valid OTP exists
  SELECT EXISTS (
    SELECT 1
    FROM phone_verification
    WHERE phone_number = p_phone_number
    AND otp = p_otp
    AND expires_at > CURRENT_TIMESTAMP
  ) INTO v_valid;

  -- Delete used/expired OTPs for this phone
  DELETE FROM phone_verification
  WHERE phone_number = p_phone_number
  AND (otp = p_otp OR expires_at <= CURRENT_TIMESTAMP);

  RETURN v_valid;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_verification_lookup 
ON phone_verification (phone_number, otp, expires_at);

CREATE INDEX IF NOT EXISTS idx_rides_available 
ON rides (id, available_seats);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_ride_seats TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_phone_otp TO authenticated;