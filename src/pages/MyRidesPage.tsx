import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Loader, Car as CarIcon, MessageSquare } from 'lucide-react';
import { useRides } from '../hooks/useRides';
import { useCancelBooking } from '../hooks/useCancelBooking';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { BookedRideCard } from '../components/rides/BookedRideCard';
import { ChatWindow } from '../components/chat/ChatWindow';

const MyRidesPage = () => {
  const { user } = useAuth();
  const { rides, loading, error, refreshRides } = useRides();
  const { cancelBooking, loading: cancellingBooking } = useCancelBooking();
  const [activeTab, setActiveTab] = useState('offered');
  const [activeChat, setActiveChat] = useState<{
    bookingId: string;
    recipientId: string;
    recipientName: string;
  } | null>(null);

  if (!user) {
    return <Navigate to="/signin" />;
  }

  const handleCancelBooking = async (bookingId: string) => {
    await cancelBooking(bookingId);
    refreshRides();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your rides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">My Rides</h1>
          <div className="inline-flex p-1 space-x-1 bg-white rounded-xl shadow-sm">
            <button
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'offered'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('offered')}
            >
              Offered Rides
            </button>
            <button
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'booked'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('booked')}
            >
              Booked Rides
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'offered' && rides.offered?.map((ride) => {
            // Get all bookings for this ride
            const rideBookings = rides.booked?.filter(booking => booking.ride_id === ride.id) || [];
            
            return (
              <div key={ride.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <CarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ride.from_location} → {ride.to_location}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ride.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(ride.departure_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">{ride.departure_time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                          {ride.available_seats} seats available
                        </span>
                      </div>

                      {ride.car_model && (
                        <div className="flex items-center space-x-2">
                          <CarIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">{ride.car_model}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ${ride.price}
                      <span className="text-sm text-gray-500 font-normal">/seat</span>
                    </div>
                  </div>
                </div>

                {/* Bookings for this ride */}
                {rideBookings.length > 0 && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">Bookings</h4>
                    <div className="space-y-4">
                      {rideBookings.map(booking => (
                        <div key={booking.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <img
                              src={`https://ui-avatars.com/api/?name=${booking.profiles?.name || 'User'}&background=random`}
                              alt={booking.profiles?.name}
                              className="h-10 w-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{booking.profiles?.name}</p>
                              <p className="text-sm text-gray-600">{booking.seats_booked} seats booked</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveChat({
                              bookingId: booking.id,
                              recipientId: booking.passenger_id,
                              recipientName: booking.profiles?.name || 'Passenger'
                            })}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                          >
                            <MessageSquare className="h-5 w-5" />
                            <span>Chat</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active chat window */}
                {activeChat && (
                  <div className="mt-6">
                    <ChatWindow
                      bookingId={activeChat.bookingId}
                      recipientId={activeChat.recipientId}
                      recipientName={activeChat.recipientName}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {activeTab === 'booked' && rides.booked?.map((booking) => (
            <BookedRideCard
              key={booking.id}
              booking={booking}
              onCancel={() => handleCancelBooking(booking.id)}
              loading={cancellingBooking}
            />
          ))}

          {((activeTab === 'offered' && rides.offered?.length === 0) ||
            (activeTab === 'booked' && rides.booked?.length === 0)) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} rides yet
              </h3>
              <p className="text-gray-500">
                {activeTab === 'offered' 
                  ? "You haven't offered any rides yet. Share your journey with others!"
                  : "You haven't booked any rides yet. Find your next journey!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRidesPage;