import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, HeartPulse, User, Mic, Type, Camera } from 'lucide-react';

function Landing() {
  const navigate = useNavigate();
  // Check karo ki user logged in hai ya nahi
  const token = localStorage.getItem('token'); 
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden relative">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Section */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              AI-POWERED WELLNESS
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-slate-900 leading-tight">
              Decode Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Emotions</span> with AI
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed font-medium">
              HEMANX analyzes your facial expressions, voice tone, and written text using advanced multimodal AI to give you a comprehensive emotional check-in.
            </p>

            {/* DYNAMIC BUTTONS (Login Logic) */}
            <div className="flex flex-col sm:flex-row gap-4">
              {token ? (
                // Agar user logged in hai
                <>
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 text-lg"
                  >
                    Go to Dashboard <ArrowRight size={20} className="ml-2" />
                  </button>
                  <div className="flex items-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                     <User className="text-blue-600 mr-2" size={20} />
                     <span className="font-bold text-slate-700">Hi, {user.name || 'User'}</span>
                  </div>
                </>
              ) : (
                // Agar user logged in NAHI hai
                <>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 text-lg group"
                  >
                    Start Analysis <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="flex items-center justify-center px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded-xl transition-all text-lg"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500 font-semibold">
              <span className="flex items-center"><ShieldCheck size={18} className="mr-2 text-green-500"/> 100% Secure</span>
              <span className="flex items-center"><HeartPulse size={18} className="mr-2 text-orange-500"/> Science-backed</span>
            </div>
          </div>

          {/* Right Visual Section (Mock Dashboard Card) */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-3xl blur-2xl opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-2xl">
              
              {/* Mock Image/Graph */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center h-64 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <Activity size={200} />
                </div>
                <Activity size={48} className="text-blue-500 mb-4 animate-pulse relative z-10" />
                <p className="text-slate-500 font-bold relative z-10">Scanning Emotions...</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current State</p>
                  <p className="text-xl font-black text-blue-600">Positive & Focused</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <HeartPulse size={24} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Highlights Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="bg-blue-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 text-blue-600"><Camera size={32} /></div>
              <h3 className="font-bold text-lg mb-2">Facial Analysis</h3>
              <p className="text-slate-500 text-sm">Detect micro-expressions using advanced computer vision.</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="bg-purple-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 text-purple-600"><Mic size={32} /></div>
              <h3 className="font-bold text-lg mb-2">Voice Tone</h3>
              <p className="text-slate-500 text-sm">Analyze acoustic features to understand the emotion behind the words.</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="bg-green-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 text-green-600"><Type size={32} /></div>
              <h3 className="font-bold text-lg mb-2">Text Psychology</h3>
              <p className="text-slate-500 text-sm">Deep NLP models to read between the lines of your written text.</p>
           </div>
        </div>

      </div>
    </div>
  );
}

export default Landing;