import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, Mail, ChevronDown } from 'lucide-react';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const dropdownRef = useRef(null);

  // LocalStorage se profile pic load karo
  useEffect(() => {
    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) setProfilePic(savedPic);
  }, [location.pathname]); // Har page change pe check karega

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profilePic');
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'About', path: '/about' },
    { name: 'Emotion Analysis', path: '/dashboard' },
    { name: 'Recommendations', path: '/recommendations' },
  ];

  // Exact Left & Right Brain Logo (Blue)
  const DoubleBrainLogo = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-slate-800">
      {/* Header - Black Theme */}
      <header className="bg-[#111111] border-b border-gray-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo Left (Double Brain + HEMANX) */}
            <div className="flex items-center cursor-pointer group" onClick={() => navigate('/home')}>
              <div className="bg-blue-600/10 p-2.5 rounded-xl border border-blue-500/20 group-hover:bg-blue-600/20 transition-colors">
                <DoubleBrainLogo />
              </div>
              <div className="ml-3 flex flex-col justify-center">
                <span className="text-3xl font-black text-white tracking-tight leading-none">HEMANX</span>
              </div>
            </div>

            {/* Nav Links Center */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold tracking-wide transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-orange-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Profile/User Right */}
            <div className="flex items-center">
              {token ? (
                // Agar User Logged In Hai
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 px-2 py-1.5 rounded-full transition-all"
                  >
                    {/* Profile Image */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white border border-gray-600">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white hidden sm:block pr-2">{user.name || 'User'}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform mr-1 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <p className="text-sm font-bold text-gray-900">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                          <User size={16} className="mr-3 text-gray-400" /> My Profile
                        </button>
                        <button onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                          <Settings size={16} className="mr-3 text-gray-400" /> Settings
                        </button>
                        <button onClick={() => { navigate('/contact'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                          <Mail size={16} className="mr-3 text-gray-400" /> Contact Support
                        </button>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 flex items-center transition-colors">
                          <LogOut size={16} className="mr-3" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Agar User Logged Out Hai
                <div className="flex items-center space-x-4">
                  {/* Note: Dono buttons Login page (/) pe le jayenge, kyunki Login page me hi toggle hai */}
                  <Link to="/" className="text-sm font-semibold text-white hover:text-orange-500 transition-colors">Login</Link>
                  <Link to="/?mode=register" className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all">Sign Up</Link>                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/20 mr-2">
                  <DoubleBrainLogo />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">HEMANX</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Advanced Multimodal Emotion Recognition System. Helping students and professionals understand their emotional well-being using state-of-the-art AI.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
              <ul className="space-y-2 text-sm font-medium">
                <li><Link to="/home" className="hover:text-orange-500 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
                <li><Link to="/dashboard" className="hover:text-orange-500 transition-colors">Analysis Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact</h3>
              <ul className="space-y-2 text-sm font-medium text-gray-400">
                <li>Email: support@hemanx.ai</li>
                <li>Location: India</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm font-medium text-gray-500">
            © 2026 HEMANX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;