import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Briefcase, Lock, Eye, EyeOff, Calendar, Users } from 'lucide-react';

// Double Brain Logo (Left & Right)
const DoubleBrainLogo = ({ size = 48, color = "#3b82f6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', mobile: '', role: 'Student', password: '', age: '', gender: '' 
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate();
  const location = useLocation();

  // URL check karne ke liye logic (Sign Up ke liye)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('mode') === 'register') {
      setIsLogin(false); // Register form kholo
    } else {
      setIsLogin(true); // Login form kholo
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!isLogin) {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.mobile)) {
        setMessage({ text: 'Please enter a valid 10-digit mobile number starting with 6-9.', type: 'error' });
        return;
      }
      if (!formData.age || !formData.gender) {
        setMessage({ text: 'Please provide age and gender for accurate reports.', type: 'error' });
        return;
      }
    }

    const url = isLogin 
      ? '${import.meta.env.VITE_API_URL}/api/auth/login' 
      : '${import.meta.env.VITE_API_URL}/api/auth/register';

    try {
      const response = await axios.post(url, formData);
      
      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard'); 
      } else {
        setMessage({ text: 'Registration successful! Please login.', type: 'success' });
        setIsLogin(true);
        navigate('/'); // URL se ?mode=register hata kar wapas login pe le aao
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.error || 'Something went wrong.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-2xl border border-blue-200">
            <DoubleBrainLogo size={48} color="#2563eb" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isLogin ? 'Welcome back to HEMANX' : 'Create your HEMANX Account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input name="firstName" type="text" required onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400" placeholder="Anshu" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                  <input name="lastName" type="text" required onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400" placeholder="Priya" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input name="email" type="email" required onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400" placeholder="anshu@example.com" />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input name="mobile" type="tel" required onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400" placeholder="9876543210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Status</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <select name="role" onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 appearance-none">
                        <option value="Student">Student</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Researcher">Researcher</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Age aur Gender Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input name="age" type="number" min="1" max="120" required onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400" placeholder="22" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <select name="gender" required onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 appearance-none">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  onChange={handleChange} 
                  className="pl-10 pr-10 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all mt-4">
                {isLogin ? 'Sign in to Dashboard' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setMessage({ text: '', type: '' }); setShowPassword(false); }} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
              {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
