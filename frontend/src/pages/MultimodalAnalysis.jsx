import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Layers, Type, Camera, Mic, Upload, RefreshCw, Activity, CheckCircle, ArrowRight } from 'lucide-react';

function MultimodalAnalysis() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data States
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Results State
  const [result, setResult] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // --- WEBCAM LOGIC ---
  const startWebcam = async () => {
    setUseWebcam(true);
    setPreview(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Could not access webcam. Please allow permissions.');
      setUseWebcam(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setUseWebcam(false);
        video.srcObject.getTracks().forEach(track => track.stop());
      }, 'image/jpeg');
    }
  };

  // --- UPLOAD LOGIC ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setUseWebcam(false);
    }
  };

  // --- VOICE RECORDING ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = MediaRecorder.isTypeSupported('audio/wav') ? { mimeType: 'audio/wav' } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Could not access microphone. Please allow permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- FINAL MULTIMODAL ANALYZE ---
  const handleAnalyze = async () => {
    if (!text.trim() && !image && !audioBlob) {
      setError("Please provide at least one input.");
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    if (text.trim()) formData.append('text', text);
    if (image) formData.append('image', image);
    if (audioBlob) formData.append('audio', audioBlob, 'recording.wav');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:5000/api/multimodal/analyze', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-10 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* NAYA: BACK TO DASHBOARD BUTTON */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        {/* Progress Bar */}
        <div className="mb-10 flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-800 -z-10 rounded"></div>
          <div className={`absolute left-0 top-1/2 h-1 bg-blue-500 -z-10 rounded transition-all duration-500`} style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {['Facial Input', 'Text Input', 'Voice Input', 'Fusion Report'].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step > idx + 1 ? 'bg-blue-500 border-blue-500 text-white' : step === idx + 1 ? 'bg-black border-blue-500 text-blue-500' : 'bg-black border-gray-700 text-gray-600'}`}>
                {step > idx + 1 ? <CheckCircle size={20} /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 font-bold ${step >= idx + 1 ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="mb-6 p-4 bg-red-900/30 text-red-400 border border-red-800 rounded-lg font-bold">{error}</div>}

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
          
          {/* STEP 1: IMAGE */}
          {step === 1 && (
            <div className="p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-2 flex items-center"><Camera className="mr-3 text-orange-500" /> Phase 1: Facial Data</h2>
              <p className="text-gray-400 mb-8">Use Live Cam or upload a clear photo of your face.</p>
              
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md h-72 bg-[#0a0a0a] border border-[#333] rounded-xl flex items-center justify-center relative overflow-hidden mb-6">
                  {useWebcam ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                      <button onClick={capturePhoto} className="absolute bottom-4 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 shadow-lg">
                        <Camera size={24} />
                      </button>
                    </>
                  ) : preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                      <button onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full text-xs hover:bg-red-700">✕</button>
                    </>
                  ) : (
                    <p className="text-gray-600 font-medium">No image captured or uploaded</p>
                  )}
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>

                {/* Controls */}
                <div className="flex gap-4 w-full max-w-md mb-6">
                  <button onClick={startWebcam} className="flex-1 bg-[#1a1a1a] border border-[#333] hover:border-orange-500 text-gray-300 hover:text-white py-3 rounded-lg font-bold flex items-center justify-center transition-colors">
                    <Camera size={18} className="mr-2" /> Live Cam
                  </button>
                  <label className="flex-1 bg-[#1a1a1a] border border-[#333] hover:border-orange-500 text-gray-300 hover:text-white py-3 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer">
                    <Upload size={18} className="mr-2" /> Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                
                <button onClick={() => setStep(2)} disabled={!image} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all w-full max-w-md">
                  Continue to Text
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TEXT */}
          {step === 2 && (
            <div className="p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-2 flex items-center"><Type className="mr-3 text-blue-500" /> Phase 2: Psychological Text</h2>
              <p className="text-gray-400 mb-8">Write a few lines about how you are feeling right now.</p>
              
              <div className="max-w-2xl mx-auto">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="I am feeling a bit overwhelmed today because..."
                  className="w-full h-40 bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors resize-none mb-6"
                ></textarea>
                
                <div className="flex space-x-4">
                  <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all w-1/3">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} disabled={!text.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all w-2/3">
                    Continue to Voice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VOICE */}
          {step === 3 && (
            <div className="p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-2 flex items-center"><Mic className="mr-3 text-green-500" /> Phase 3: Voice Acoustic</h2>
              <p className="text-gray-400 mb-8">Record your voice speaking naturally for 10-30 seconds.</p>
              
              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className="w-full bg-[#0a0a0a] border border-[#333] border-dashed rounded-xl p-8 flex flex-col items-center justify-center mb-6">
                  {isRecording ? (
                    <div className="text-center">
                      <p className="text-red-500 font-bold animate-pulse text-lg mb-4">● Recording Audio...</p>
                      <button onClick={stopRecording} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">STOP RECORDING</button>
                    </div>
                  ) : audioBlob ? (
                    <div className="text-center w-full">
                      <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mb-4" />
                      <button onClick={() => setAudioBlob(null)} className="text-xs text-red-400 hover:text-red-300 font-bold">Remove Audio</button>
                    </div>
                  ) : (
                    <button onClick={startRecording} className="flex flex-col items-center text-gray-500 hover:text-green-400 transition-colors">
                      <Mic size={32} className="mb-3" />
                      <span className="text-sm font-bold">Click to Record</span>
                    </button>
                  )}
                </div>

                <div className="flex space-x-4 w-full">
                  <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all w-1/3">
                    Back
                  </button>
                  <button onClick={handleAnalyze} disabled={!audioBlob || loading} className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all w-2/3 flex items-center justify-center">
                    {loading ? <><RefreshCw className="animate-spin mr-2" size={18} /> FUSING...</> : 'Generate Fusion Report'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: FUSION REPORT */}
          {step === 4 && result && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                <h2 className="text-3xl font-black mb-2 flex items-center"><Layers className="mr-3" /> Deep Multimodal Neural Fusion Report</h2>
                <p className="text-white/80 font-medium">Combined analysis from Face, Text, and Voice data.</p>
              </div>

              <div className="p-8 space-y-8">
                <div className="text-center bg-[#0a0a0a] border border-[#333] rounded-xl p-6">
                  <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-sm">Final Fused Emotion</p>
                  <h1 className="text-5xl font-black text-blue-500 capitalize">{result.dominant_emotion}</h1>
                  <p className="text-gray-500 mt-2 font-mono">Confidence: {result.confidence}%</p>
                  <p className="text-gray-400 text-sm mt-1">({result.modalities_used} modalities analyzed)</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2 flex items-center">
                    <Activity className="mr-2 text-blue-500" /> Full Probability Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(result.all_probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([emotion, score]) => (
                        <div key={emotion} className="relative">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="capitalize text-gray-300 font-semibold tracking-wide">{emotion}</span>
                            <span className="text-gray-500 font-mono">{score.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${emotion === result.dominant_emotion ? 'bg-blue-500' : 'bg-gray-600'}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
                  <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors">
                    Run Another Test
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center">
                    Go to Dashboard <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultimodalAnalysis;