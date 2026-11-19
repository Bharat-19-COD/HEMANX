import { Activity, Target, Award, Brain, Shield, Zap, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      
      {/* Background Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Hero Section */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center relative">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">HEMANX</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
          Human Emotion Monitoring and Analysis System. 
          <span className="text-slate-500"> Bridging the gap between human emotions and artificial intelligence.</span>
        </p>
      </div>

      {/* Main Content Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Section with Emotion Image and Text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          
          {/* Left Image (Emotion Detection Theme) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Emotion Analysis" 
              className="relative rounded-2xl shadow-xl w-full object-cover h-[400px] border border-slate-200"
            />
            {/* Overlay Box for emotion tracking look */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-400 rounded-lg bg-blue-500/10 backdrop-blur-sm flex items-center justify-center">
               <span className="text-blue-600 font-bold text-sm bg-white/90 px-2 py-1 rounded">Happy 98%</span>
            </div>
          </div>

          {/* Right Text */}
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center text-slate-900">
              <Brain className="mr-3 text-blue-600" size={32} /> 
              What is HEMANX?
            </h2>
            <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
              <p>
                HEMANX is an advanced, AI-powered platform designed to help individuals understand their emotional states through <strong className="text-slate-900">multimodal analysis</strong>.
              </p>
              <p>
                By leveraging cutting-edge machine learning models, we analyze facial expressions, vocal tones, and textual input to provide a comprehensive emotional profile.
              </p>
              <p>
                Whether you are a student managing academic stress, a researcher studying human behavior, or simply someone looking to understand yourself better, HEMANX provides a safe, scientific, and intuitive interface to explore your emotional well-being.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-8 flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 group"
            >
              Explore the Dashboard 
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
            <Brain size={32} className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 mb-2">AI Models</h3>
            <p className="text-sm text-slate-500">Powered by Hugging Face & PyTorch.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group">
            <Shield size={32} className="text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 mb-2">Secure Data</h3>
            <p className="text-sm text-slate-500">Your emotional data stays private.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
            <Zap size={32} className="text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 mb-2">Real-time</h3>
            <p className="text-sm text-slate-500">Instant emotion fusion & analysis.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all group">
            <Users size={32} className="text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 mb-2">For Everyone</h3>
            <p className="text-sm text-slate-500">Students, professionals & researchers.</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <Target className="mx-auto text-blue-600 mb-6" size={48} />
            <h3 className="font-bold text-slate-900 text-xl mb-3">Our Mission</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              To make emotional self-awareness accessible to everyone through explainable and ethical AI.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
            <Award className="mx-auto text-orange-500 mb-6" size={48} />
            <h3 className="font-bold text-slate-900 text-xl mb-3">Our Technology</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Powered by state-of-the-art Transformers, PyTorch, and Flask for scalable, real-time emotion detection.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <Activity className="mx-auto text-green-500 mb-6" size={48} />
            <h3 className="font-bold text-slate-900 text-xl mb-3">Our Impact</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Helping students and professionals monitor mental well-being, reduce stress, and improve daily productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
