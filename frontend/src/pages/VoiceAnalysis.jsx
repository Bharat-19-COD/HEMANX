import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mic, Square, Upload, RefreshCw, Activity, Volume2 } from 'lucide-react';

function VoiceAnalysis() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Force WAV format (Backend isko support karta hai)
      const options = MediaRecorder.isTypeSupported('audio/wav') ? { mimeType: 'audio/wav' } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setResult(null);
      setError('');
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Could not access microphone. Please allow permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('${import.meta.env.VITE_API_URL}/api/voice/analyze', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze audio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm">
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#2a2a2a] flex items-center">
            <Activity className="text-[#ff7b00] mr-3" size={24} />
            <h1 className="text-xl font-bold tracking-wide">VOICE EMOTION ANALYSIS ENGINE</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* LEFT SIDE */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a2a] flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-full flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#333] rounded-xl p-8 mb-6">
                {isRecording ? (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-red-500/30">
                      <Mic size={48} className="text-red-500" />
                    </div>
                    <p className="text-red-500 font-mono text-3xl font-bold mb-2">{formatTime(recordingTime)}</p>
                    <p className="text-gray-400 text-sm">Recording in progress...</p>
                  </div>
                ) : audioUrl ? (
                  <div className="w-full text-center">
                     <div className="w-20 h-20 bg-[#ff7b00]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#ff7b00]/30">
                      <Volume2 size={40} className="text-[#ff7b00]" />
                    </div>
                    <audio src={audioUrl} controls className="w-full max-w-sm mx-auto mb-4" />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Mic size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No audio recorded or uploaded</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4 w-full">
                {isRecording ? (
                  <button onClick={stopRecording} className="flex-1 flex items-center justify-center py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                    <Square size={18} className="mr-2" fill="currentColor" /> STOP RECORDING
                  </button>
                ) : (
                  <button onClick={startRecording} className="flex-1 flex items-center justify-center py-4 bg-[#1a1a1a] border border-[#333] hover:border-[#ff7b00] text-gray-300 hover:text-white rounded-lg transition-all font-medium">
                    <Mic size={18} className="mr-2" /> Record Voice
                  </button>
                )}
                
                {!isRecording && (
                  <label className="flex-1 flex items-center justify-center py-4 bg-[#1a1a1a] border border-[#333] hover:border-[#ff7b00] text-gray-300 hover:text-white rounded-lg transition-all font-medium cursor-pointer">
                    <Upload size={18} className="mr-2" /> Upload Audio
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>

              {error && <p className="text-red-500 text-sm mt-4 w-full text-center">{error}</p>}

              {audioBlob && !isRecording && (
                <button onClick={handleAnalyze} disabled={loading} className="w-full mt-4 py-4 bg-[#ff7b00] text-white font-bold tracking-wider rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex justify-center items-center">
                  {loading ? <><RefreshCw className="animate-spin mr-2" size={20} /> PROCESSING AUDIO...</> : 'INITIATE ANALYSIS'}
                </button>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="p-6 bg-[#121212]">
              <h2 className="text-[#ff7b00] text-sm font-bold tracking-widest uppercase mb-6 flex items-center">
                <Activity size={16} className="mr-2" /> Real-time Analytics
              </h2>

              {!result ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-600 border border-dashed border-[#333] rounded-xl">
                  <p className="text-sm font-medium">Awaiting audio to generate data...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-5 rounded-xl text-center">
                    <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-widest">Detected Emotion</p>
                    <span className="inline-block px-6 py-2 bg-[#ff7b00]/10 border border-[#ff7b00]/30 text-[#ff7b00] text-3xl font-bold capitalize rounded-lg">
                      {result.dominant_emotion}
                    </span>
                    <p className="text-sm text-gray-400 mt-3">Confidence: <span className="text-[#ff7b00] font-mono font-bold">{result.confidence}%</span></p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-bold tracking-wider mb-4">EMOTION PROBABILITIES</p>
                    <div className="space-y-4">
                      {Object.entries(result.all_probabilities)
                        .sort(([,a], [,b]) => b - a)
                        .map(([emotion, score]) => (
                        <div key={emotion} className="relative">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="capitalize text-gray-300 font-semibold tracking-wide">{emotion}</span>
                            <span className="text-gray-500 font-mono">{score.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden border border-[#2a2a2a]">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${emotion === result.dominant_emotion ? 'bg-[#ff7b00]' : 'bg-blue-600'}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceAnalysis;
