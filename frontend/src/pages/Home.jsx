import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck, HeartPulse, BrainCircuit } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  
  // Check karo ki user logged in hai ya nahi
  const token = localStorage.getItem('token'); 
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          
          {/* Left Text Section */}
          <div className="lg:w-1/2 z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Wellness
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
              Decode Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Emotions
              </span> with AI
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg font-medium leading-relaxed">
              HEMANX analyzes your facial expressions, voice tone, and written text using advanced multimodal AI to give you a comprehensive emotional check-in.
            </p>
            
            {/* DYNAMIC BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button 
                onClick={() => token ? navigate('/dashboard') : navigate('/')} 
                className="flex items-center px-8 py-3.5 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 group"
              >
                Start Analysis <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              
              {/* Agar logged out hai, toh Sign In ka option dikhao */}
              {!token && (
                <button 
                  onClick={() => navigate('/')} 
                  className="flex items-center px-8 py-3.5 bg-white text-slate-700 border border-slate-300 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Sign In / Register
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-semibold">
              <span className="flex items-center"><ShieldCheck size={18} className="mr-2 text-green-500"/> 100% Secure</span>
              <span className="flex items-center"><HeartPulse size={18} className="mr-2 text-orange-500"/> Science-backed</span>
            </div>
          </div>

          {/* Animated Image Right Section */}
          <div className="lg:w-1/2 mt-16 lg:mt-0 relative flex justify-center">
            {/* Background Blob Animation */}
            <div className="absolute top-0 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
            
            <div className="relative w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-10 animate-float">
              
              {/* AI Scanning Card */}
              <div className="w-full h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex flex-col items-center justify-center border border-indigo-100 relative overflow-hidden">
                 
                 {/* Background Grid Pattern */}
                 <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 
                 {/* Center Icon & Text */}
                 <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className="relative mb-4">
                      {/* Glowing Aura */}
                      <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                      {/* Brain Icon */}
                      <BrainCircuit className="text-indigo-600 relative z-10 animate-pulse" size={56} />
                    </div>
                    <p className="font-bold text-indigo-900 tracking-wide text-sm flex items-center bg-white/60 px-4 py-1.5 rounded-full backdrop-blur-sm border border-indigo-100 shadow-sm">
                      <Activity size={14} className="mr-2 text-indigo-500 animate-pulse"/> Scanning Emotions...
                    </p>
                 </div>
              </div>

              {/* Card Footer */}
              <div className="mt-6 flex justify-between items-center px-2">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current State</p>
                  <p className="text-xl font-extrabold text-indigo-600">Positive & Focused</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <HeartPulse className="text-green-600" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;
