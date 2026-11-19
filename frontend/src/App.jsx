import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import TextAnalysis from './pages/TextAnalysis';
import FaceAnalysis from './pages/FaceAnalysis';
import VoiceAnalysis from './pages/VoiceAnalysis';
import MultimodalAnalysis from './pages/MultimodalAnalysis';
import Recommendations from './pages/Recommendations';
import FullAssessment from './pages/FullAssessment';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Landing from './pages/Landing';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes wrapped in Layout */}
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
        <Route path="/text-analysis" element={<Layout><TextAnalysis /></Layout>} />
        <Route path="/face-analysis" element={<Layout><FaceAnalysis /></Layout>} />
        <Route path="/voice-analysis" element={<Layout><VoiceAnalysis /></Layout>} />
        <Route path="/multimodal-analysis" element={<Layout><MultimodalAnalysis /></Layout>} />
        <Route path="/full-assessment" element={<Layout><FullAssessment /></Layout>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/" element={<Login />} /> {/* Login route bhi yahi rahega */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
