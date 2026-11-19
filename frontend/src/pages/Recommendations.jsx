import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowLeft, HeartPulse, Coffee, Music, Leaf, Stethoscope, AlertTriangle, PlayCircle, X, Clock, ExternalLink, ArrowRight, Sun, Moon } from 'lucide-react';

function Recommendations() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const cardImages = {
    diet: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    exercise: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    music: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  };

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://hemanx-multimdal-ai-obit.onrender.com/api/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError('Could not fetch recommendations. Please complete an analysis first.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-xl">Loading Recommendations...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold">{error}</div>;
  if (!data) return null;

  const recs = data.recommendations;

  const renderModalContent = () => {
    if (!activeModal) return null;
    const content = recs[activeModal];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="h-48 w-full relative">
            <img src={cardImages[activeModal]} alt={activeModal} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full transition-colors">
              <X size={24} className="text-white" />
            </button>
            <h2 className="absolute bottom-4 left-6 text-3xl font-black text-white capitalize">{activeModal} Guide</h2>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-blue-600 mb-2">{content.title}</h3>
            <p className="text-slate-600 mb-6">{content.details}</p>

            {/* Diet Details */}
            {activeModal === 'diet' && content.meals && (
              <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-800 mb-3 flex items-center"><Clock size={18} className="mr-2"/> Sattvic Meal Plan</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li><strong>Morning:</strong> {content.meals.Morning}</li>
                  <li><strong>Afternoon:</strong> {content.meals.Afternoon}</li>
                  <li><strong>Evening:</strong> {content.meals.Evening}</li>
                  <li><strong>Night:</strong> {content.meals.Night}</li>
                </ul>
              </div>
            )}

            {/* Exercise Details */}
            {activeModal === 'exercise' && content.time_30m && (
              <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center"><Clock size={18} className="mr-2"/> 30-Minute Routine</h4>
                <p className="text-sm text-slate-700">{content.time_30m}</p>
              </div>
            )}

            {/* Yoga Details (Asana & Pranayama) */}
            {activeModal === 'yoga' && (
              <div className="mb-6 space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <h4 className="font-bold text-green-800 mb-1">Asanas</h4>
                  <p className="text-sm text-slate-700">{content.asana}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-800 mb-1">Pranayama</h4>
                  <p className="text-sm text-slate-700">{content.pranayama}</p>
                </div>
              </div>
            )}

            {/* Music Details */}
            {activeModal === 'music' && content.recommendation && (
              <div className="mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <h4 className="font-bold text-purple-800 mb-1">Recommended Playlist</h4>
                <p className="text-sm text-slate-700 font-medium">{content.recommendation}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {content.video && (
                <a href={content.video} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl transition-colors">
                  <PlayCircle size={20} className="mr-2" /> {activeModal === 'music' ? 'Listen on Pragya Geet' : 'Watch Video Guide'}
                </a>
              )}
              {content.blog && (
                <a href={content.blog} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  <ExternalLink size={20} className="mr-2" /> Read Article
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-10 px-4 relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center">
              <Leaf className="mr-3 text-green-600" /> Wellness Recommendations
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-slate-500 font-medium">
                Emotion: <span className="text-blue-600 font-bold capitalize">{data.emotion}</span>
              </p>
              <span className="flex items-center text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
                {data.time_of_day === 'Morning' ? <Sun size={14} className="mr-1"/> : <Moon size={14} className="mr-1"/>}
                {data.time_of_day} Routine
              </span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
          </button>
        </div>

        {data.is_high_stress && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm flex items-start">
            <AlertTriangle className="text-red-500 mr-4 flex-shrink-0" size={28} />
            <div>
              <h3 className="text-lg font-bold text-red-700">High Stress Detected</h3>
              <p className="text-red-600 text-sm mt-1 mb-3">
                Your recent analysis shows a very high negative emotion ({data.confidence}% confidence). Please take this seriously.
              </p>
              <button className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors">
                <Stethoscope size={16} className="mr-2" /> Consult a Doctor
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 font-medium">
          💡 <strong>AI Insight:</strong> {recs.message}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Diet */}
          <div onClick={() => setActiveModal('diet')} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group overflow-hidden flex flex-col">
            <div className="h-48 w-full overflow-hidden flex-shrink-0">
              <img src={cardImages.diet} alt="Diet" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 mr-3">
                  <Coffee size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Sattvic Diet</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">{recs.diet.details}</p>
              <span className="text-orange-600 text-sm font-bold flex items-center mt-auto">View Meal Plan <ArrowRight size={16} className="ml-1" /></span>
            </div>
          </div>

          {/* Exercise */}
          <div onClick={() => setActiveModal('exercise')} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group overflow-hidden flex flex-col">
            <div className="h-48 w-full overflow-hidden flex-shrink-0">
              <img src={cardImages.exercise} alt="Exercise" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 mr-3">
                  <HeartPulse size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Physical Exercise</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">{recs.exercise.details}</p>
              <span className="text-blue-600 text-sm font-bold flex items-center mt-auto">View Workout Plan <ArrowRight size={16} className="ml-1" /></span>
            </div>
          </div>

          {/* Yoga */}
          <div onClick={() => setActiveModal('yoga')} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group overflow-hidden flex flex-col">
            <div className="h-48 w-full overflow-hidden flex-shrink-0">
              <img src={cardImages.yoga} alt="Yoga" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2.5 rounded-lg text-green-600 mr-3">
                  <Activity size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Yoga & Pranayama</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">{recs.yoga.details}</p>
              <span className="text-green-600 text-sm font-bold flex items-center mt-auto">View Yoga Guide <ArrowRight size={16} className="ml-1" /></span>
            </div>
          </div>

          {/* Music */}
          <div onClick={() => setActiveModal('music')} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group overflow-hidden flex flex-col">
            <div className="h-48 w-full overflow-hidden flex-shrink-0">
              <img src={cardImages.music} alt="Music" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600 mr-3">
                  <Music size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Meditation & Music</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">{recs.music.details}</p>
              <span className="text-purple-600 text-sm font-bold flex items-center mt-auto">Explore Music <ArrowRight size={16} className="ml-1" /></span>
            </div>
          </div>

        </div>
      </div>

      {renderModalContent()}
    </div>
  );
}

export default Recommendations;
