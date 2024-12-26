import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-[800px] bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center py-20">
          <div className="text-white space-y-8">
            <div className="flex items-center space-x-3">
              <Car className="h-8 w-8" />
              <span className="text-xl font-semibold">RideShare</span>
            </div>
            <h1 className="text-6xl font-bold leading-tight">
              Share Your Journey, <br />
              <span className="text-blue-300">Save Together</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-lg">
              Join thousands of travelers connecting daily for shared rides. 
              Save money, reduce your carbon footprint, and make new friends along the way.
            </p>
            <div className="flex space-x-4 pt-4">
              <Link
                to="/find-ride"
                className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center space-x-2"
              >
                <span>Find a Ride</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/offer-ride"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Offer a Ride
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1532054241088-402b4150db33?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              alt="Happy travelers"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;