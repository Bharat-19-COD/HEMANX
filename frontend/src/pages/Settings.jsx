import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, Phone, Calendar, Users, CheckCircle, Save } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', mobile: '', age: '', gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        age: user.age || '',
        gender: user.gender || ''
      });
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('${import.meta.env.VITE_API_URL}/api/auth/update-profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      
      setTimeout(() => navigate('/profile'), 1500);
      
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/profile')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm">
          <ArrowLeft size={18} className="mr-2" /> Back to Profile
        </button>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#2a2a2a] flex items-center">
            <User className="text-blue-500 mr-3" size={24} />
            <h1 className="text-xl font-bold tracking-wide">Edit Profile</h1>
          </div>

          <div className="p-8">
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg text-sm font-bold flex items-center ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {message.type === 'success' && <CheckCircle size={18} className="mr-2" />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Last Name</label>
                  <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address (Cannot be changed)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input name="email" type="email" value={formData.email} disabled className="pl-10 w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    <input name="age" type="number" value={formData.age} onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Gender</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <select name="gender" value={formData.gender} onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white appearance-none">
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2a2a2a]">
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <Save size={20} className="mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
