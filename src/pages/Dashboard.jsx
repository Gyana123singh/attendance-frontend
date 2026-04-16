import { useState } from 'react';
import { User, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  // Simple token check - redirect if not logged in
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  const [user] = useState({ name: 'John Doe', role: 'Employee' });

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Attendance Dashboard
          </h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-6 h-6" />
                <span>{user.name}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Quick Stats */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase font-medium tracking-wide">Today</p>
                <p className="text-3xl font-bold text-gray-900">Mark Attendance</p>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
              Check In
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase font-medium tracking-wide">Status</p>
                <p className="text-3xl font-bold text-green-600">Present</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Checked in at 09:15 AM</p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              On Time
            </span>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <Calendar className="w-24 h-24 mx-auto mb-6 text-white/80" />
            <h2 className="text-3xl font-bold text-white mb-4">QR Login Successful!</h2>
            <p className="text-xl text-white/90 mb-8">You're now signed in to the attendance system.</p>
            <div className="space-y-3">
              <span className="block w-full h-px bg-white/30 rounded-full"></span>
              <span className="text-blue-100 text-lg font-medium">Ready to mark attendance</span>
              <span className="block w-full h-px bg-white/30 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

