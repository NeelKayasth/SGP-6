import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const EmailVerifiedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to sign in after 5 seconds
    const timer = setTimeout(() => {
      navigate('/signin');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900">
          Email Verified Successfully!
        </h2>
        
        <div className="mt-4 space-y-4">
          <p className="text-gray-600">
            Your email has been successfully verified. You can now sign in to your account
            and start using all features.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-700">
              Thank you for verifying your email. Your account is now fully activated.
            </p>
          </div>
          
          <Link 
            to="/signin"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
          >
            Sign In Now
          </Link>
          
          <p className="text-sm text-gray-500">
            You will be automatically redirected to the sign in page in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;