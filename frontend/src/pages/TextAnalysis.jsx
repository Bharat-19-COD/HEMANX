import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, Activity, Brain, HeartPulse } from 'lucide-react';

function TextAnalysis() {
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState({
    mood: '',
    sleep: '',
    stress: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnswerChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    // Combine Questionnaire answers into a sentence for the AI
    let combinedText = text;
    if (answers.mood || answers.sleep || answers.stress) {
      combinedText = `I am feeling ${answers.mood}. My sleep is ${answers.sleep}. My stress level is ${answers.stress}. ${text}`;
    }

    if (!combinedText.trim()) {
      setError("Please answer at least one question or write something.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '${import.meta.env.VITE_API_URL}/api/text/analyze',
        { text: combinedText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 font-sans text-white">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-[#121212] p-8 rounded-2xl shadow-xl border border-gray-800">
          <div className="flex items-center mb-6 border-b border-gray-800 pb-4">
            <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500 mr-4">
              <Brain size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Psychological Text Analysis</h1>
              <p className="text-gray-400 text-sm mt-1">Answer these quick questions or write freely. AI will analyze your mental state.</p>
            </div>
          </div>

          {error && <div className="mb-6 p-4 bg-red-900/30 text-red-400 border border-red-800 rounded-lg font-bold">{error}</div>}

          <form onSubmit={handleAnalyze}>
            
            {/* Psychological Questionnaire */}
            <div className="space-y-6 mb-8 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              
              {/* Question 1 */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">1. How would you describe your overall mood today?</label>
                <div className="flex flex-wrap gap-3">
                  {['Happy', 'Neutral', 'Sad', 'Anxious', 'Angry'].map(option => (
                    <label key={option} className={`px-4 py-2 rounded-lg cursor-pointer border text-sm font-medium transition-all ${answers.mood === option ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                      <input type="radio" name="mood" value={option} onChange={handleAnswerChange} className="hidden" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">2. How has your sleep quality been recently?</label>
                <div className="flex flex-wrap gap-3">
                  {['Very Good', 'Average', 'Disturbed', 'Insomnia'].map(option => (
                    <label key={option} className={`px-4 py-2 rounded-lg cursor-pointer border text-sm font-medium transition-all ${answers.sleep === option ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                      <input type="radio" name="sleep" value={option} onChange={handleAnswerChange} className="hidden" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">3. What is your current stress level?</label>
                <div className="flex flex-wrap gap-3">
                  {['Low', 'Moderate', 'High', 'Overwhelming'].map(option => (
                    <label key={option} className={`px-4 py-2 rounded-lg cursor-pointer border text-sm font-medium transition-all ${answers.stress === option ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                      <input type="radio" name="stress" value={option} onChange={handleAnswerChange} className="hidden" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Free Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-300 mb-2">Want to share more? (Optional)</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="3"
                className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-white placeholder-gray-600"
                placeholder="I am feeling really stressed about my upcoming exams..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center justify-center w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Analyzing Psychological State...' : <><Send size={18} className="mr-2" /> Analyze My State</>}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="mt-8 pt-8 border-t border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Psychological Analysis Results</h2>
              
              <div className="bg-blue-900/20 p-6 rounded-xl mb-6 border border-blue-800/30 flex flex-col md:flex-row items-center justify-between">
                <div>
                  <p className="text-sm text-blue-400 font-bold mb-1">AI-Detected State</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-white capitalize mr-3">{result.dominant_emotion}</span>
                    <span className="text-blue-400 font-mono">({result.confidence}% match)</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
                   <p className="text-xs text-gray-400 font-bold uppercase">Insight</p>
                   <p className="text-sm text-gray-300">Your inputs indicate a primarily <strong className="text-white capitalize">{result.dominant_emotion}</strong> state.</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Emotion Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(result.all_probabilities)
                  .sort(([,a], [,b]) => b - a)
                  .map(([emotion, score]) => (
                  <div key={emotion}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-300 font-medium">{emotion}</span>
                      <span className="text-gray-500 font-mono">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextAnalysis;
