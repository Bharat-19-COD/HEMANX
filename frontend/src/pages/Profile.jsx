import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, Camera, Shield, RotateCcw } from 'lucide-react';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/');
    }

    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) setProfilePic(savedPic);
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem('profilePic', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function: Restore to Default
  const handleRestoreDefault = () => {
    if (window.confirm("Are you sure you want to restore the default profile picture?")) {
      setProfilePic(null);
      localStorage.removeItem('profilePic');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-10 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm">
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-900"></div>
          
          <div className="p-8 relative">
            {/* Profile Picture Section */}
            <div className="absolute -top-16 left-8 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full border-4 border-[#121212] overflow-hidden bg-[#1a1a1a] flex items-center justify-center group">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-600" />
                )}
                
                {/* Change Photo on Hover */}
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-xs font-bold text-white">Change</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* NAYA: Restore to Default Button */}
              {profilePic && (
                <button 
                  onClick={handleRestoreDefault} 
                  className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#333] hover:border-red-500 text-gray-400 hover:text-red-400 text-xs font-bold rounded-lg transition-all"
                >
                  <RotateCcw size={14} /> Restore Default
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="mt-20">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black">{user.name || 'User Name'}</h1>
                  <p className="text-gray-400 flex items-center mt-1">
                    <Mail size={16} className="mr-2" /> {user.email}
                  </p>
                  <p className="text-blue-400 font-semibold mt-2 flex items-center">
                    <Shield size={16} className="mr-2" /> {user.role || 'Student'}
                  </p>
                </div>
                <button onClick={() => navigate('/settings')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-[#2a2a2a] pt-8">
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Age</p>
                  <p className="text-lg font-semibold flex items-center"><Calendar size={18} className="mr-2 text-orange-500" /> {user.age || 'Not Set'}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Gender</p>
                  <p className="text-lg font-semibold flex items-center"><Users size={18} className="mr-2 text-green-500" /> {user.gender || 'Not Set'}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Mobile Number</p>
                  <p className="text-lg font-semibold flex items-center"><Phone size={18} className="mr-2 text-purple-500" /> {user.mobile || 'Not Set'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
