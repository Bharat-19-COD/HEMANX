import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Camera, Upload, RefreshCw, ScanFace, Activity, UserCircle } from 'lucide-react';

function FaceAnalysis() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useWebcam, setUseWebcam] = useState(false);
  const [userAge, setUserAge] = useState('N/A'); // Naya State real age ke liye
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // User ki age LocalStorage se uthao
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj.age) {
        setUserAge(userObj.age);
      }
    }
    
    // Cleanup for webcam
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    setUseWebcam(true);
    setPreview(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Could not access webcam. Please allow permissions.');
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setUseWebcam(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:5000/api/face/analyze', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium text-sm">
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#2a2a2a] flex items-center">
            <ScanFace className="text-[#ff7b00] mr-3" size={24} />
            <h1 className="text-xl font-bold tracking-wide">FACIAL EXPRESSION ANALYSIS ENGINE</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side: Image/Video */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a2a] flex flex-col items-center">
              <div className="w-full relative bg-black rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center border border-[#333]">
                {useWebcam ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                    <button onClick={capturePhoto} className="absolute bottom-6 bg-[#ff7b00] text-white p-4 rounded-full hover:bg-orange-600 shadow-[0_0_15px_rgba(255,123,0,0.5)] transition-all">
                      <Camera size={28} />
                    </button>
                  </>
                ) : preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain max-h-[400px]" />
                ) : (
                  <div className="text-center text-gray-600">
                    <ScanFace size={64} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No Input Detected</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>

              {/* Controls */}
              <div className="flex space-x-4 mt-6 w-full">
                <button onClick={startWebcam} className="flex-1 flex items-center justify-center py-3 bg-[#1a1a1a] border border-[#333] hover:border-[#ff7b00] text-gray-300 hover:text-white rounded-lg transition-all text-sm font-medium">
                  <Camera size={18} className="mr-2" /> Live Cam
                </button>
                <label className="flex-1 flex items-center justify-center py-3 bg-[#1a1a1a] border border-[#333] hover:border-[#ff7b00] text-gray-300 hover:text-white rounded-lg transition-all text-sm font-medium cursor-pointer">
                  <Upload size={18} className="mr-2" /> Upload Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {image && !useWebcam && (
                <button onClick={handleAnalyze} disabled={loading} className="w-full mt-4 py-4 bg-[#ff7b00] text-white font-bold tracking-wider rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all flex justify-center items-center">
                  {loading ? <><RefreshCw className="animate-spin mr-2" size={20} /> PROCESSING SCAN...</> : 'INITIATE ANALYSIS'}
                </button>
              )}
            </div>

            {/* Right Side: Scientific Data Panel */}
            <div className="p-6 bg-[#121212]">
              <h2 className="text-[#ff7b00] text-sm font-bold tracking-widest uppercase mb-6 flex items-center">
                <Activity size={16} className="mr-2" /> Real-time Analytics
              </h2>

              {!result ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-600 border border-dashed border-[#333] rounded-xl">
                  <p className="text-sm font-medium">Awaiting input to generate data...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* REAL AGE & Emotion */}
                  <div className="grid grid-cols-2 gap-4 border-b border-[#2a2a2a] pb-6">
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-1">USER AGE</p>
                      <div className="flex items-center text-gray-300">
                        <UserCircle size={20} className="mr-2 text-[#ff7b00]" />
                        <span className="text-xl font-bold font-mono">
                          {userAge} <span className="text-sm text-gray-500">yrs</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-1">DOMINANT EMOTION</p>
                      <span className="inline-block px-3 py-1 bg-[#ff7b00]/10 border border-[#ff7b00]/30 text-[#ff7b00] text-lg font-bold capitalize rounded mt-1">
                        {result.dominant_emotion}
                      </span>
                    </div>
                  </div>

                  {/* Emotion Bars */}
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <p className="text-xs text-gray-500 font-bold tracking-wider">EMOTION PROBABILITIES</p>
                      <p className="text-xs text-[#ff7b00] font-mono font-bold">{result.confidence}% CONFIDENCE</p>
                    </div>
                    
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
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${emotion === result.dominant_emotion ? 'bg-[#ff7b00]' : 'bg-gray-600'}`}
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

export default FaceAnalysis;