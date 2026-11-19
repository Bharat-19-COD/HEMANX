import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Mic, Type, Layers, History, ArrowRight, Activity, Brain, TrendingUp, AlertCircle, FileText, Settings, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'User' });
  const [history, setHistory] = useState([]);
  const [graphData, setGraphData] = useState([]); 
  const [insight, setInsight] = useState({ current_emotion: "None", recommendation: "Loading..." });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [timeframe, setTimeframe] = useState('today');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [pieData, setPieData] = useState([]);
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token) navigate('/');
    else {
      if (storedUser) setUser(JSON.parse(storedUser));
      
      const fetchData = async () => {
        try {
          const resHistory = await axios.get('https://hemanx-multimdal-ai-obit.onrender.com/api/history', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHistory(resHistory.data);

          const resGraph = await axios.get(`https://hemanx-multimdal-ai-obit.onrender.com/api/history/graph?timeframe=${timeframe}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setGraphData(resGraph.data);

          const resInsight = await axios.get('https://hemanx-multimdal-ai-obit.onrender.com/api/insights', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setInsight(resInsight.data);
          
          const emotionCounts = {};
          resHistory.data.forEach(item => {
            const emo = item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1);
            emotionCounts[emo] = (emotionCounts[emo] || 0) + 1;
          });
          
          const dynamicPie = Object.keys(emotionCounts).map(key => ({
            name: key,
            value: emotionCounts[key]
          }));
          
          setPieData(dynamicPie.length > 0 ? dynamicPie : [{ name: 'No Data', value: 1 }]);
          
        } catch (err) { 
          console.error("Error fetching dashboard data", err); 
        }
      };
      fetchData();
    }
  }, [navigate, timeframe]);

  // --- PDF GENERATION LOGIC ---
  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://hemanx-multimdal-ai-obit.onrender.com/api/report/data?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data;
      const doc = new jsPDF();
      
      const emailStr = data.user.email || "user";
      let hash = 0;
      for (let i = 0; i < emailStr.length; i++) {
        hash = (hash << 5) - hash + emailStr.charCodeAt(i);
        hash |= 0;
      }
      const userCode = Math.abs(hash).toString(16).substring(0, 4).toUpperCase();
      
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      const reportId = `HMX-${userCode}-${dateStr}`;

      const timeStr = today.toLocaleTimeString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      const displayDate = today.toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });

      doc.setFillColor(30, 58, 138); 
      doc.roundedRect(14, 12, 12, 12, 3, 3, 'F'); 
      
      doc.setFillColor(255, 255, 255);
      doc.ellipse(18, 18, 2, 4, 'F'); 
      doc.ellipse(22, 18, 2, 4, 'F'); 
      
      doc.setFillColor(30, 58, 138);
      doc.rect(19.5, 14, 1, 8, 'F'); 

      doc.setTextColor(15, 23, 42); 
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("HEMANX", 30, 21);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text("Advanced Cognitive & Emotion Analytics", 30, 26);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text("Report ID:", 145, 15);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`${reportId}`, 162, 15);
      
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text("Date & Time:", 145, 20);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`${displayDate} | ${timeStr}`, 162, 20);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text("User Profile Details", 14, 40);
      
      const periodText = timeframe === 'today' ? 'Last 24 Hours' : timeframe === 'week' ? 'Last 7 Days' : timeframe === 'month' ? 'Last 30 Days' : 'All Time';
      const displayGender = data.user.gender !== 'Not specified' ? data.user.gender : 'Not Recorded';
      const displayAge = data.user.age !== 'Not specified' ? `${data.user.age} Years` : 'Not Recorded';

      const userInfo = [
        ["Client Name", data.user.name, "Assessment Period", periodText],
        ["Email Address", data.user.email, "Total Scans", data.total_scans.toString()],
        ["Age / Gender", `${displayAge} / ${displayGender}`, "Report Status", "Finalized"]
      ];
      
      autoTable(doc, {
        startY: 44,
        body: userInfo,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 4, textColor: [51, 65, 85], lineColor: [226, 232, 240] },
        columnStyles: { 
          0: { fontStyle: 'bold', cellWidth: 35, fillColor: [248, 250, 252] },
          1: { cellWidth: 65 },
          2: { fontStyle: 'bold', cellWidth: 40, fillColor: [248, 250, 252] },
          3: { cellWidth: 40 }
        }
      });
      
      let currentY = doc.lastAutoTable.finalY + 12;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text("Diagnostic Breakdown", 14, currentY);
      currentY += 3;
      
      const modalityRows = [];
      Object.keys(data.modalities).forEach(mod => {
        const emos = data.modalities[mod];
        const emoString = emos.map(e => `${e[0]}: ${e[1]}%`).join('  |  ');
        if(emos.length > 0) {
           modalityRows.push([mod.toUpperCase(), emoString]);
        }
      });
      
      if(modalityRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Modality', 'Detected Emotions & Probabilities']],
          body: modalityRows,
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240] },
          alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        currentY = doc.lastAutoTable.finalY + 12;
      } else {
         doc.setFontSize(9);
         doc.setTextColor(100, 116, 139);
         doc.text("No diagnostic data available for this period.", 14, currentY);
         currentY += 10;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text("Clinical Recommendations", 14, currentY);
      currentY += 5;
      
      const isHighStress = data.high_stress_alert;
      
      const dietRec = isHighStress 
        ? "Focus on magnesium-rich foods (spinach, almonds) and omega-3s (walnuts, flaxseeds) to reduce cortisol levels. Avoid excess caffeine and refined sugars."
        : "Maintain a balanced diet with plenty of water, fresh fruits, and complex carbohydrates to sustain steady energy levels.";
        
      const exerciseRec = isHighStress
        ? "Prioritize gentle recovery: 10 mins of deep breathing, yoga, or a light walk. Avoid high-intensity workouts until stress levels normalize."
        : "Maintain your positive state! A 30-minute moderate cardio or strength training session is recommended to sustain your positive mood.";
      
      autoTable(doc, {
        startY: currentY,
        body: [
          ["Dietary Advice", dietRec],
          ["Physical Activity", exerciseRec]
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 4, textColor: [51, 65, 85] },
        columnStyles: { 
          0: { fontStyle: 'bold', cellWidth: 40, textColor: [15, 23, 42] },
          1: { cellWidth: 142 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      if (isHighStress) {
        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(252, 165, 165);
        doc.roundedRect(14, currentY, 182, 22, 2, 2, 'FD');
        
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text("PRIORITY ATTENTION: HIGH STRESS DETECTED", 18, currentY + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text("Your recent emotional indicators show elevated stress levels. We strongly advise consulting", 18, currentY + 13);
        doc.text("with a mental health professional for a comprehensive evaluation.", 18, currentY + 18);
      }
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("This is an AI-generated report. It is not a substitute for professional medical advice, diagnosis, or treatment.", 14, 285);
      doc.text(`© ${today.getFullYear()} HEMANX. All rights reserved.`, 14, 290);
      
      doc.save(`HEMANX_Report_${reportId}.pdf`);
      
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert(`PDF Error: ${error.message}`); 
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: Activity, path: '/dashboard', active: true },
    { name: 'Recommendations', icon: Brain, path: '/recommendations' },
    { name: 'Full Assessment', icon: FileText, path: '/full-assessment' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  // Yahan final names set hain
  const analysisItems = [
    { name: 'Facial Expression Analyzer', icon: Camera, path: '/face-analysis' },
    { name: 'Psycholinguistic Analyzer', icon: Type, path: '/text-analysis' },
    { name: 'Audio Spectral Analyzer', icon: Mic, path: '/voice-analysis' },
    { name: 'Deep Multimodal Fusion', icon: Layers, path: '/multimodal-analysis' },
  ];

  const currentStress = graphData.length > 0 ? Math.round(100 - graphData[graphData.length-1].score) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className={`bg-[#0f172a] text-white flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center overflow-hidden cursor-pointer" onClick={() => navigate('/home')}>
            <Activity className="text-blue-500 flex-shrink-0" size={28} />
            <span className={`text-xl font-black tracking-wider ml-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>HEMANX</span>
          </div>
          {isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"><ChevronLeft size={20} /></button>
          )}
        </div>
        
        <div className="p-3 flex-grow overflow-y-auto overflow-x-hidden flex flex-col justify-between">
          <div>
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="w-full flex justify-center py-2 mb-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight size={20} /></button>
            )}

            <div className="mb-6">
              <p className={`text-xs text-slate-500 font-bold tracking-widest uppercase mb-2 px-2 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Navigation</p>
              <nav className="space-y-1">
                {navItems.map((item, idx) => (
                  <button key={idx} onClick={() => navigate(item.path)} className={`w-full flex items-center px-3 py-3 rounded-lg font-medium text-sm transition-all group ${item.active ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title={!isSidebarOpen ? item.name : ''}>
                    <item.icon size={20} className={`flex-shrink-0 ${item.active ? 'text-blue-500' : 'group-hover:text-white'}`} />
                    <span className={`ml-4 whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <p className={`text-xs text-slate-500 font-bold tracking-widest uppercase mb-2 px-2 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>Analysis Tools</p>
              <nav className="space-y-1 mb-4">
                {analysisItems.map((item, idx) => (
                  <button key={idx} onClick={() => navigate(item.path)} className="w-full flex items-center px-3 py-3 rounded-lg font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all group" title={!isSidebarOpen ? item.name : ''}>
                    <item.icon size={20} className="flex-shrink-0 group-hover:text-white" />
                    <span className={`ml-4 whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-4 px-1">
              <button 
                onClick={handleDownloadReport} 
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                title={!isSidebarOpen ? "Download Report" : ''}
              >
                <Download size={16} className={isSidebarOpen ? "mr-2" : ""} />
                {isSidebarOpen && <span className="whitespace-nowrap">{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">Cognitive Analytics Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none bg-slate-100 border border-slate-300 text-slate-700 py-2 pl-4 pr-10 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="today">Today (24h)</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
            </div>

            <div className="flex items-center text-sm font-medium text-slate-500 border-l border-slate-300 pl-4">
              Welcome, <span className="text-blue-600 font-bold ml-1">{user.name}</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8">
          
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-md flex items-start space-x-4">
            <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
              <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">AI Personal Insight</h3>
              <p className="text-blue-100 text-sm leading-relaxed">{insight.recommendation}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-900"><TrendingUp size={64} /></div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current State</p>
              <p className="text-3xl font-black text-slate-900 capitalize">{history.length > 0 ? history[0].emotion : 'N/A'}</p>
              <p className="text-xs text-green-600 mt-2 font-medium">{history.length > 0 ? 'Based on latest scan' : 'No data yet'}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-900"><AlertCircle size={64} /></div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Stress Indicator</p>
              <p className="text-3xl font-black text-slate-900">{currentStress}%</p>
              <div className="w-full bg-slate-100 h-2 mt-3 rounded-full">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{width: `${currentStress}%`}}></div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-900"><Activity size={64} /></div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Scans</p>
              <p className="text-3xl font-black text-slate-900">{history.length || 0}</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">All time logs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-widest flex items-center">
                <Activity size={16} className="mr-2 text-blue-500"/> Emotional Waveform ({timeframe === 'today' ? '24 Hours' : timeframe === 'week' ? '7 Days' : timeframe === 'month' ? '30 Days' : 'All Time'})
              </h2>
              <div className="h-72 w-full">
                {graphData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">No data available for this time period.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px'}} 
                        formatter={(value, name, props) => [`${value}% (${props.payload.emotion})`, 'Positivity Score']}
                      />
                      <Line type="monotone" dataKey="score" name="Score" stroke="#3b82f6" strokeWidth={3} dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
               <h2 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-widest flex items-center">
                <PieChart size={16} className="mr-2 text-purple-500"/> Mood Distribution
              </h2>
              <div className="h-72 w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => navigate('/face-analysis')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center justify-center group">
                <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors"><Camera size={24} className="text-blue-600" /></div>
                <span className="text-sm font-bold text-slate-700 text-center">Facial Expression</span>
              </button>
              <button onClick={() => navigate('/text-analysis')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col items-center justify-center group">
                <div className="bg-emerald-50 p-3 rounded-full mb-3 group-hover:bg-emerald-100 transition-colors"><Type size={24} className="text-emerald-600" /></div>
                <span className="text-sm font-bold text-slate-700 text-center">Psycholinguistic</span>
              </button>
              <button onClick={() => navigate('/voice-analysis')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md transition-all flex flex-col items-center justify-center group">
                <div className="bg-purple-50 p-3 rounded-full mb-3 group-hover:bg-purple-100 transition-colors"><Mic size={24} className="text-purple-600" /></div>
                <span className="text-sm font-bold text-slate-700 text-center">Audio Spectral</span>
              </button>
              <button onClick={() => navigate('/multimodal-analysis')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-400 hover:shadow-md transition-all flex flex-col items-center justify-center group">
                <div className="bg-orange-50 p-3 rounded-full mb-3 group-hover:bg-orange-100 transition-colors"><Layers size={24} className="text-orange-600" /></div>
                <span className="text-sm font-bold text-slate-700 text-center">Deep Neural Fusion</span>
              </button>
            </div>
          </div>

          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Full Assessment</h2>
              <p className="text-slate-600 text-sm font-medium">Take a 3-step multimodal test to generate real data for your graph.</p>
            </div>
            <button onClick={() => navigate('/full-assessment')} className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center">
              Start Assessment <ArrowRight size={18} className="ml-2" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center bg-slate-50">
              <History className="text-slate-500 mr-2" size={18} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Logs</h2>
            </div>
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">No logs found. Start an analysis to populate data.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Modality</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Emotion</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Confidence</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Time (IST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {history.slice(0, 5).map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-slate-700 capitalize">{item.type}</td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700 capitalize border border-blue-200">{item.emotion}</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-xs text-slate-600 font-mono font-medium">{item.confidence}%</td>
                        <td className="px-6 py-3 whitespace-nowrap text-xs text-slate-500 font-medium">
                          {new Date(item.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
