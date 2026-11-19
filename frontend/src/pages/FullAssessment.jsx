import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Type, Mic, FileText, Download, ArrowRight, CheckCircle, Activity, Upload, Brain } from 'lucide-react';

// Helper function to convert AudioBuffer to WAV Blob
function audioBufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
  const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

function FullAssessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAge, setUserAge] = useState('N/A');
  const [userName, setUserName] = useState('User');

  // Step 1: Face Data
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceResult, setFaceResult] = useState(null);

  // Step 2: Text Data
  const [text, setText] = useState('');
  const [textResult, setTextResult] = useState(null);

  // Step 3: Voice Data
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [voiceResult, setVoiceResult] = useState(null);

  // Fetch User Data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj.age) setUserAge(userObj.age);
      if (userObj.name) setUserName(userObj.name);
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- FACE LOGIC ---
  const startWebcam = async () => {
    setUseWebcam(true); setPreview(null); setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { setError('Could not access webcam.'); }
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
        setImage(file); setPreview(URL.createObjectURL(file)); setUseWebcam(false);
        video.srcObject.getTracks().forEach(track => track.stop());
      }, 'image/jpeg');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setUseWebcam(false); }
  };

  const analyzeFace = async () => {
    if (!image) { setError("Please upload or capture an image first."); return; }
    setLoading(true); setError('');
    const formData = new FormData(); formData.append('image', image);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/face/analyze', formData, { headers: { Authorization: `Bearer ${token}` } });
      setFaceResult(res.data);
      setStep(2);
    } catch (err) { setError("Failed to analyze face."); }
    finally { setLoading(false); }
  };

  // --- TEXT LOGIC ---
  const analyzeText = async () => {
    if (!text.trim()) { setError("Please write something about your feelings."); return; }
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/text/analyze', { text }, { headers: { Authorization: `Bearer ${token}` } });
      setTextResult(res.data);
      setStep(3);
    } catch (err) { setError("Failed to analyze text."); }
    finally { setLoading(false); }
  };

  // --- VOICE LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => { 
        if (event.data.size > 0) audioChunksRef.current.push(event.data); 
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer);
          setAudioBlob(wavBlob);
        } catch (err) {
          console.error("Audio conversion error:", err);
          setError('Could not process audio.');
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { setError("Microphone access denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) { setError("Please record audio first."); return; }
    setLoading(true); setError('');
    const formData = new FormData(); formData.append('audio', audioBlob, 'recording.wav');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/voice/analyze', formData, { headers: { Authorization: `Bearer ${token}` } });
      setVoiceResult(res.data);
      setStep(4);
    } catch (err) { setError("Failed to analyze voice."); }
    finally { setLoading(false); }
  };

  // --- REPORT LOGIC ---
  const finalEmotion = voiceResult?.dominant_emotion || textResult?.dominant_emotion || faceResult?.dominant_emotion || 'Neutral';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-10 flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-800 -z-10 rounded"></div>
          <div className={`absolute left-0 top-1/2 h-1 bg-orange-500 -z-10 rounded transition-all duration-500`} style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {['Facial', 'Psychological Text', 'Voice Acoustic', 'Clinical Report'].map((label, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step > idx + 1 ? 'bg-orange-500 border-orange-500 text-white' : step === idx + 1 ? 'bg-black border-orange-500 text-orange-500' : 'bg-black border-gray-700 text-gray-600'}`}>
                {step > idx + 1 ? <CheckCircle size={20} /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 font-bold ${step >= idx + 1 ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="mb-6 p-4 bg-red-900/30 text-red-400 border border-red-800 rounded-lg font-bold">{error}</div>}

        {/* STEP 1: FACE */}
        {step === 1 && (
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 flex items-center"><Camera className="mr-3 text-orange-500" /> Phase 1: Facial Micro-Expression</h2>
            <p className="text-gray-400 mb-8">Use Live Cam or upload a photo of your face.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-full h-64 bg-black border border-gray-700 rounded-xl flex items-center justify-center overflow-hidden mb-4 relative">
                  {useWebcam ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                      <button onClick={capturePhoto} className="absolute bottom-4 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 shadow-lg">
                        <Camera size={24} />
                      </button>
                    </>
                  ) : preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <p className="text-gray-600 font-medium">No image selected</p>
                  )}
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                
                <div className="flex gap-3 w-full">
                  <button onClick={startWebcam} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition-colors">
                    <Camera size={18} className="mr-2" /> Live Cam
                  </button>
                  <label className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer">
                    <Upload size={18} className="mr-2" /> Upload
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                {faceResult ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-400 font-bold mb-2">DETECTED EMOTION</p>
                    <p className="text-4xl font-black text-orange-500 capitalize mb-2">{faceResult.dominant_emotion}</p>
                    <p className="text-lg text-gray-300 font-mono">{faceResult.confidence}% Confidence</p>
                  </div>
                ) : (
                  <button onClick={analyzeFace} disabled={loading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,123,0,0.3)]">
                    {loading ? 'Analyzing Face...' : 'Analyze Face & Continue'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TEXT (Direct Psychological Test) */}
        {step === 2 && (
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 flex items-center"><Type className="mr-3 text-blue-500" /> Phase 2: Psychological Text Analysis</h2>
            <p className="text-gray-400 mb-8">Provide some context. Write how you are feeling right now.</p>
            
            <div className="flex flex-col">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows="5" className="w-full p-4 bg-black border border-gray-700 rounded-xl text-white mb-4 outline-none focus:border-blue-500" placeholder="I am feeling a bit stressed about my exams..."></textarea>
              <button onClick={analyzeText} disabled={loading} className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                {loading ? 'Analyzing Text...' : 'Analyze Text & Continue'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VOICE */}
        {step === 3 && (
          <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 animate-fade-in text-center">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center"><Mic className="mr-3 text-green-500" /> Phase 3: Voice Acoustic Analysis</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Speak for 30-60 seconds about how you feel.</p>
            
            <div className="bg-black border border-gray-700 rounded-2xl p-12 mb-8 max-w-md mx-auto">
              {!isRecording && !audioBlob && <p className="text-gray-500 mb-6">Ready to record</p>}
              {isRecording && <p className="text-red-500 animate-pulse mb-6 font-bold text-xl">● Recording...</p>}
              {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mb-6"></audio>}
              
              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button onClick={startRecording} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full transition-all">
                    Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all">
                    Stop Recording
                  </button>
                )}
              </div>
            </div>

            {audioBlob && (
              <button onClick={analyzeVoice} disabled={loading} className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg">
                {loading ? 'Generating Final Report...' : 'Complete Assessment'}
              </button>
            )}
          </div>
        )}

        {/* STEP 4: FINAL CLINICAL REPORT */}
        {step === 4 && (
          <div className="bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden animate-fade-in shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-blue-600 p-8 text-white">
              <h2 className="text-3xl font-black mb-2 flex items-center"><FileText className="mr-3" /> Clinical Assessment Report</h2>
              <p className="text-white/80 font-medium">Client: {userName} | Age: {userAge} Years | Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="text-center bg-black border border-gray-800 rounded-xl p-6">
                <p className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-sm">Final Fused Emotion Prediction</p>
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 capitalize">{finalEmotion}</h1>
                <p className="text-gray-500 mt-2 font-mono">Based on multimodal fusion (Face + Text + Voice)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                  <p className="text-xs text-gray-500 font-bold mb-1">FACIAL DATA</p>
                  <p className="text-lg font-bold text-orange-400 capitalize">{faceResult?.dominant_emotion}</p>
                  <p className="text-sm text-gray-400">{faceResult?.confidence}% conf.</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                  <p className="text-xs text-gray-500 font-bold mb-1">TEXT DATA</p>
                  <p className="text-lg font-bold text-blue-400 capitalize">{textResult?.dominant_emotion}</p>
                  <p className="text-sm text-gray-400">{textResult?.confidence}% conf.</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 text-center">
                  <p className="text-xs text-gray-500 font-bold mb-1">VOICE DATA</p>
                  <p className="text-lg font-bold text-green-400 capitalize">{voiceResult?.dominant_emotion}</p>
                  <p className="text-sm text-gray-400">{voiceResult?.confidence}% conf.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-800">
                <button onClick={() => window.print()} className="flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors">
                  <Download size={18} className="mr-2" /> Print Report
                </button>
                <button onClick={() => navigate('/recommendations')} className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                  <Brain size={18} className="mr-2" /> View Recommendations
                </button>
                <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
                  Go to Dashboard <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default FullAssessment;
