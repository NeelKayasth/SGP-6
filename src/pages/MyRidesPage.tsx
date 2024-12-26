import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const MyRidesPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Rides</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Rides
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past Rides
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'offered'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('offered')}
          >
            Offered Rides
          </button>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {[1,2,3].map((ride) => (
            <div key={ride} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">March {ride + 14}, 2024</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">From: San Francisco, CA</p>
                        <p className="font-medium">To: Los Angeles, CA</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>Departure: 9:00 AM</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span>2 passengers</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">$45</span>
                  <div className="mt-4 space-y-2">
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                      View Details
                    </button>
                    {activeTab === 'upcoming' && (
                      <button className="w-full border border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition">
                        Cancel Ride
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRidesPage;