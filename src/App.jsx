import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, GraduationCap, LayoutDashboard, LogOut, MessageSquare, 
  Settings, User, ChevronRight, Play, Clock, CheckCircle, Target, 
  BarChart2, X, Send, Cpu, Award, Download
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api";

const syncUserToBackend = async (email, password, profile, history) => {
  try {
    await fetch(`${API_BASE_URL}/sync_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, profile, history })
    });
  } catch (error) {
    console.warn("Backend not running. Data saved locally only.");
  }
};

const fetchUserFromBackend = async (email) => {
   try {
       const res = await fetch(`${API_BASE_URL}/get_user/${email}`);
       if (res.ok) return await res.json();
       return null;
   } catch (error) {
       return null;
   }
};

const generateMockResponse = async (profile, userMessageCount, chatHistory = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, history: chatHistory })
    });
    
    if (!response.ok) throw new Error("Backend not reachable");
    const data = await response.json();
    return data.text;
  } catch (error) {
    alert("Backend Error: " + error.message); 
    console.warn("Backend not running. Using fallback UI mode for preview.");
    return "This is a fallback response. The AI server is not reachable.";
  }
};

const generateMockEvaluation = async (transcript, profile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, history: transcript })
    });
    
    if (!response.ok) throw new Error("Backend not reachable");
    return await response.json();
  } catch (error) {
    console.warn("Backend not running. Using fallback evaluation mode.");
    return {
      score: 40,
      summary: "[Fallback Mode] Server connection failed. Start your local FastAPI server to get real AI evaluations!",
      strengths: ["Tested the application UI"],
      improvements: ["Start the FastAPI python server locally"]
    };
  }
};

const AuthScreen = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const errMsg = await onLogin(email, password, isRegister);
    if (errMsg) setError(errMsg);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200 relative z-10 p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a1a]/80 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px] pointer-events-none"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none"></div>

        <div className="flex justify-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.4)] transform rotate-3 hover:rotate-6 transition-transform">
            <Cpu className="text-white w-8 h-8 transform -rotate-3" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 relative z-10">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-purple-300/70 text-center mb-8 text-sm font-medium relative z-10">
          AI-Powered Mock Interview Platform
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold mb-1 text-purple-200 tracking-wide">Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-white placeholder-purple-300/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              placeholder="engineer@example.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-purple-200 tracking-wide">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-white placeholder-purple-300/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              placeholder="••••••••" />
          </div>
          
          {error && (
            <div className="text-rose-400 text-sm text-center bg-rose-500/10 py-3 rounded-xl border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] font-medium">
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all active:scale-[0.98] tracking-wide uppercase text-sm disabled:opacity-50">
            {isLoading ? "Connecting..." : (isRegister ? "Sign Up & Setup Profile" : "Login to Dashboard")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-purple-300/70 relative z-10">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="ml-2 text-cyan-400 hover:text-cyan-300 font-bold tracking-wide drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
            {isRegister ? "Log In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

const OnboardingScreen = ({ onComplete }) => {
  const [profile, setProfile] = useState({
    fullName: "", targetCompany: "IBM", targetRole: "Software Engineer", 
    difficulty: "Medium", duration: "15", techStack: "React, Python, SQL"
  });

  const COMPANIES = ["IBM", "Google", "Microsoft", "Amazon", "Meta", "Apple"];
  const ROLES = ["Software Engineer", "Data Analyst", "Frontend Developer", "Backend Developer", "Product Manager", "UX Designer", "Machine Learning"];
  const DURATIONS = [1, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200 py-12 px-4 relative z-10">
      <div className="w-full max-w-3xl p-8 md:p-10 rounded-3xl bg-[#0a0a1a]/80 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Complete Your Profile</h2>
        <p className="text-purple-300/70 mb-8 font-medium">Tailor your AI interviewer to your specific career goals.</p>

        <form onSubmit={(e) => { e.preventDefault(); onComplete(profile); }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Full Name</label>
              <input type="text" required value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Company</label>
              <select required value={profile.targetCompany} onChange={(e) => setProfile({...profile, targetCompany: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                {COMPANIES.map(c => <option key={c} value={c} className="bg-[#0a0a1a]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Role</label>
              <select required value={profile.targetRole} onChange={(e) => setProfile({...profile, targetRole: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                {ROLES.map(r => <option key={r} value={r} className="bg-[#0a0a1a]">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Difficulty Level</label>
              <select value={profile.difficulty} onChange={(e) => setProfile({...profile, difficulty: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                <option value="Low">Low (Beginner)</option>
                <option value="Medium">Medium (Intermediate)</option>
                <option value="Hard">Hard (Expert)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Interview Duration (Mins)</label>
              <select value={profile.duration} onChange={(e) => setProfile({...profile, duration: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                {DURATIONS.map(d => (
                  <option key={d} value={d} className="bg-[#0a0a1a]">{d} {d === 1 ? 'Minute (Test)' : 'Minutes'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Core Tech Stack</label>
              <input type="text" required value={profile.techStack} onChange={(e) => setProfile({...profile, techStack: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all" placeholder="React, Python, SQL" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all uppercase text-sm">
            Save Profile & Go to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

const SettingsScreen = ({ profile, onSave, onCancel }) => {
  const [editProfile, setEditProfile] = useState(profile);
  
  const COMPANIES = ["IBM", "Google", "Microsoft", "Amazon", "Meta", "Apple"];
  const ROLES = ["Software Engineer", "Data Analyst", "Frontend Developer", "Backend Developer", "Product Manager", "UX Designer", "Machine Learning"];
  const DURATIONS = [1, 2, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200 py-12 px-4 relative z-10">
      <div className="w-full max-w-3xl p-8 md:p-10 rounded-3xl bg-[#0a0a1a]/80 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative">
        <button onClick={onCancel} className="absolute top-6 right-6 text-purple-400 hover:text-cyan-400 transition-colors bg-purple-500/10 p-2 rounded-full">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Profile Settings</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(editProfile); }} className="space-y-6 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Full Name</label>
              <input type="text" required value={editProfile.fullName} onChange={(e) => setEditProfile({...editProfile, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Company</label>
              <select required value={editProfile.targetCompany} onChange={(e) => setEditProfile({...editProfile, targetCompany: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                {COMPANIES.map(c => <option key={c} value={c} className="bg-[#0a0a1a]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Role</label>
              <select required value={editProfile.targetRole} onChange={(e) => setEditProfile({...editProfile, targetRole: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                {ROLES.map(r => <option key={r} value={r} className="bg-[#0a0a1a]">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Difficulty Level</label>
              <select value={editProfile.difficulty} onChange={(e) => setEditProfile({...editProfile, difficulty: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                <option value="Low">Low (Beginner)</option>
                <option value="Medium">Medium (Intermediate)</option>
                <option value="Hard">Hard (Expert)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Interview Duration (Mins)</label>
              <select value={editProfile.duration} onChange={(e) => setEditProfile({...editProfile, duration: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all appearance-none">
                {DURATIONS.map(d => (
                  <option key={d} value={d} className="bg-[#0a0a1a]">{d} {d === 1 ? 'Minute (Test)' : 'Minutes'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Core Tech Stack</label>
              <input type="text" required value={editProfile.techStack} onChange={(e) => setEditProfile({...editProfile, techStack: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 outline-none text-white transition-all" />
            </div>
          </div>
          <div className="flex gap-4 pt-6">
             <button type="button" onClick={onCancel} className="flex-1 py-3.5 bg-transparent border border-purple-500/50 hover:bg-purple-500/10 text-white font-bold rounded-xl transition-all tracking-wide uppercase text-sm shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              Cancel
             </button>
             <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all tracking-wide uppercase text-sm">
              Save Changes
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ profile, history, onStartInterview, onLogout, onViewDetails, onOpenSettings }) => {
  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0;
  
  return (
    <div className="flex h-screen bg-transparent text-slate-200 overflow-hidden relative z-10">
      <aside className="w-64 bg-[#0a0a1a]/70 backdrop-blur-2xl border-r border-purple-500/20 flex flex-col hidden md:flex z-20">
        <div className="p-6 flex items-center gap-3">
          <Cpu className="text-cyan-400 w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">AI Trainee</span>
        </div>
        <nav className="flex-1 px-4 space-y-3 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 border border-purple-500/30 text-cyan-300 rounded-xl font-semibold">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-4 py-3 text-purple-300 hover:text-cyan-300 hover:bg-purple-500/10 rounded-xl transition-all font-medium">
            <Settings size={20} /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-purple-500/20">
          <div className="flex items-center gap-3 px-4 py-2 mb-4 bg-[#030014]/50 rounded-xl border border-purple-500/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {profile.fullName.charAt(0)}
            </div>
            <div className="text-sm overflow-hidden">
              <p className="font-bold text-white truncate">{profile.fullName}</p>
              <p className="text-cyan-400/80 text-xs truncate max-w-[110px] font-medium">{profile.targetRole}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl font-bold uppercase text-sm tracking-wide">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{profile.fullName.split(' ')[0]}</span>
            </h1>
            <p className="text-purple-200/70 font-medium">Here's your interview prep progress for <span className="text-cyan-400">{profile.targetCompany}</span>.</p>
          </div>
          <button onClick={onStartInterview} className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-105 transition-all uppercase text-sm">
            <Play size={18} fill="currentColor" /> Start Interview
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0a0a1a]/60 backdrop-blur-md border border-purple-500/20 p-6 rounded-3xl flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 text-emerald-400 rounded-2xl"><Award size={32} /></div>
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mb-1">Avg Score</p>
              <p className="text-4xl font-black text-white">{avgScore}<span className="text-xl text-purple-500/50">/100</span></p>
            </div>
          </div>
          <div className="bg-[#0a0a1a]/60 backdrop-blur-md border border-purple-500/20 p-6 rounded-3xl flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 text-cyan-400 rounded-2xl"><Target size={32} /></div>
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mb-1">Tests Taken</p>
              <p className="text-4xl font-black text-white">{history.length}</p>
            </div>
          </div>
          <div className="bg-[#0a0a1a]/60 backdrop-blur-md border border-purple-500/20 p-6 rounded-3xl flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-purple-400/20 to-pink-600/20 text-purple-400 rounded-2xl"><BarChart2 size={32} /></div>
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mb-1">Trend</p>
              {history.length >= 2 ? (
                <p className={`text-xl font-black mt-1 ${history[0].score >= history[1].score ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {history[0].score >= history[1].score ? '↑ Improving' : '↓ Needs Work'}
                </p>
              ) : (
                <p className="text-xl font-black mt-1 text-purple-400">Analyzing...</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a1a]/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-purple-500/30 bg-purple-900/10">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2"><Clock className="text-cyan-400"/> Interview History</h3>
          </div>
          {history.length === 0 ? (
            <div className="p-16 text-center text-purple-400 flex flex-col items-center">
              <MessageSquare size={40} className="mb-4 text-cyan-400/50" />
              <p className="text-lg font-medium">No sessions initiated yet. Hack the mainframe by starting one!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#030014]/80 text-cyan-400 text-xs uppercase tracking-widest">
                    <th className="p-5 font-bold">Date</th>
                    <th className="p-5 font-bold">Role</th>
                    <th className="p-5 font-bold">Difficulty</th>
                    <th className="p-5 font-bold">Score</th>
                    <th className="p-5 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-cyan-500/10 transition-colors">
                      <td className="p-5 text-sm text-purple-200">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="p-5 text-sm font-bold text-white">{item.role}</td>
                      <td className="p-5 text-xs font-bold uppercase">{item.difficulty}</td>
                      <td className="p-5 font-black text-white">{item.score}%</td>
                      <td className="p-5">
                        <button onClick={() => onViewDetails(item)} className="text-cyan-400 hover:text-white text-xs font-bold uppercase flex items-center gap-1">
                          View Log <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const InterviewRoom = ({ profile, onComplete }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => (parseInt(profile?.duration || "1") || 1) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const startInterview = async () => {
      setIsAiTyping(true);
      const aiResponse = await generateMockResponse(profile, 0, []);
      setMessages([{ id: 1, sender: 'ai', text: aiResponse }]);
      setIsAiTyping(false);
    };
    startInterview();

    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting) handleEndInterview(true);
  }, [timeLeft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isAiTyping) return;

    const newMsg = { id: Date.now(), sender: 'user', text: inputValue };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setIsAiTyping(true);

    const nextCount = userMessageCount + 1;
    setUserMessageCount(nextCount);

    const aiResponseText = await generateMockResponse(profile, nextCount, updatedMessages);
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiResponseText }]);
    setIsAiTyping(false);
  };

  const handleEndInterview = async (auto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    let finalMessages = [...messages];
    if (inputValue.trim() !== "") {
      finalMessages.push({ id: Date.now(), sender: 'user', text: inputValue });
      setInputValue("");
    }
    
    setMessages(prev => [...finalMessages, { 
      id: Date.now() + 1, sender: 'system', 
      text: auto ? "Time's up! Generating evaluation..." : "Interview submitted. Generating evaluation..." 
    }]);

    const evaluation = await generateMockEvaluation(finalMessages, profile);
    
    onComplete({
      id: Date.now(),
      date: new Date().toISOString(),
      role: profile.targetRole,
      difficulty: profile.difficulty,
      score: evaluation.score,
      feedback: evaluation
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-transparent relative z-10">
      <div className="w-1/4 min-w-[300px] bg-[#0a0a1a]/80 backdrop-blur-2xl border-r border-purple-500/30 p-8 flex flex-col hidden md:flex shadow-[10px_0_40px_rgba(0,0,0,0.6)] z-20">
        <div className="mb-10 flex items-center gap-3">
          <Cpu className="text-cyan-400 w-10 h-10" />
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Active Uplink</h2>
        </div>

        <div className="bg-[#030014]/80 border border-purple-500/30 rounded-2xl p-6 mb-8 text-center">
          <p className="text-purple-400 text-xs font-bold uppercase mb-3">Time Remaining</p>
          <div className={`text-5xl font-mono font-black ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex-1"></div>
        <button onClick={() => handleEndInterview(false)} disabled={isSubmitting} className="w-full py-4 bg-rose-500/10 text-rose-400 border border-rose-500/40 rounded-xl font-bold uppercase text-sm">
          {isSubmitting ? "Processing Data..." : "Submit Interview"}
        </button>
      </div>

      <div className="flex-1 flex flex-col relative bg-transparent z-10">
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'system' ? (
                <div className="w-full text-center my-6">
                  <span className="bg-purple-900/40 text-cyan-300 text-xs font-black px-6 py-2 rounded-full uppercase border border-cyan-500/30">
                    {msg.text}
                  </span>
                </div>
              ) : (
                <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-5 shadow-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-purple-700 to-indigo-600 text-white' 
                    : 'bg-[#0a0a1a]/90 border border-cyan-500/30 text-cyan-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                    <span className={`text-xs font-black uppercase ${msg.sender === 'user' ? 'text-purple-200' : 'text-cyan-400'}`}>
                      {msg.sender === 'user' ? 'Trainee' : `AI Agent [${profile.targetCompany}]`}
                    </span>
                  </div>
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                </div>
              )}
            </div>
          ))}
          {isAiTyping && (
             <div className="flex justify-start">
               <div className="bg-[#0a0a1a]/90 border border-cyan-500/30 rounded-3xl p-5 flex gap-2 w-24 justify-center">
                 <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce"></div>
                 <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-4 md:p-8 bg-[#0a0a1a]/80 border-t border-purple-500/30">
          <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto relative group">
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isSubmitting || timeLeft <= 0}
              placeholder="Transmit response..." className="w-full bg-[#030014] border-2 border-purple-500/40 text-white rounded-xl pl-6 pr-16 py-5 outline-none focus:border-cyan-400 text-lg" />
            <button type="submit" disabled={!inputValue.trim() || isAiTyping || isSubmitting} className="absolute right-3 top-3 bottom-3 aspect-square bg-gradient-to-br from-cyan-400 to-blue-600 text-white rounded-lg flex items-center justify-center">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('auth'); 
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const initializeSession = async () => {
      const activeEmail = localStorage.getItem('aitrainee_logged_in');
      if (activeEmail) {
        let backendUser = await fetchUserFromBackend(activeEmail);
        const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
        
        const p = backendUser?.profile || (usersData[activeEmail]?.profile);
        const h = backendUser?.history || (usersData[activeEmail]?.history) || [];
        const pw = backendUser?.password || (usersData[activeEmail]?.password);

        if (p) {
          setUser({ email: activeEmail, password: pw }); 
          setProfile(p); 
          setHistory(h); 
          setView('dashboard');
        } else {
          localStorage.removeItem('aitrainee_logged_in');
        }
      }
    };
    initializeSession();
  }, []);

  const handleLogin = async (rawEmail, password, isRegister) => {
    const email = rawEmail.toLowerCase().trim();
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    
    let backendUser = await fetchUserFromBackend(email);

    if (isRegister) {
      if (backendUser?.profile || usersData[email]) return "Account exists. Please log in.";
      setUser({ email, password }); 
      setProfile(null); 
      setHistory([]); 
      setView('onboarding');
    } else {
      const storedPassword = backendUser?.password || usersData[email]?.password;
      
      if (!storedPassword && !usersData[email] && !backendUser) {
        return "No account found. Please register first.";
      }

      // Password Validation Logic
      if (storedPassword && storedPassword !== password) {
        return "Incorrect password.";
      }

      const activeProfile = backendUser?.profile || (usersData[email]?.profile);
      const activeHistory = backendUser?.history || (usersData[email]?.history || []);
      
      if (activeProfile) {
        setUser({ email, password }); 
        setProfile(activeProfile); 
        setHistory(activeHistory); 
        
        usersData[email] = { password: storedPassword || password, profile: activeProfile, history: activeHistory };
        localStorage.setItem('aitrainee_users', JSON.stringify(usersData));
        localStorage.setItem('aitrainee_logged_in', email); 
        setView('dashboard');
      } else return "Profile setup incomplete. Please register again.";
    }
  };

  const handleOnboardingComplete = (data) => {
    setProfile(data);
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    usersData[user.email] = { password: user.password, profile: data, history: [] }; 
    localStorage.setItem('aitrainee_users', JSON.stringify(usersData)); 
    localStorage.setItem('aitrainee_logged_in', user.email);
    
    syncUserToBackend(user.email, user.password, data, []);
    setView('dashboard');
  };

  const handleSettingsSave = (updatedProfile) => {
    setProfile(updatedProfile);
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    if (usersData[user.email]) { 
      usersData[user.email].profile = updatedProfile; 
      localStorage.setItem('aitrainee_users', JSON.stringify(usersData)); 
      
      syncUserToBackend(user.email, user.password, updatedProfile, usersData[user.email].history);
    }
    setView('dashboard');
  };

  const handleInterviewComplete = (resultData) => {
    const newHistory = [resultData, ...history]; 
    setHistory(newHistory);
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    if (usersData[user.email]) { 
      usersData[user.email].history = newHistory; 
      localStorage.setItem('aitrainee_users', JSON.stringify(usersData)); 
      
      syncUserToBackend(user.email, user.password, profile, newHistory);
    }
    setSelectedResult(resultData); 
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null); setProfile(null); setHistory([]); setSelectedResult(null); localStorage.removeItem('aitrainee_logged_in'); setView('auth');
  };

  return (
    <div className="font-sans antialiased bg-[#030014] min-h-screen text-white relative overflow-hidden selection:bg-cyan-500/40">
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-[pulse_12s_ease-in-out_infinite_reverse]"></div>
      <div className="fixed top-[40%] left-[40%] w-[30vw] h-[30vw] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>

      <div className="relative z-10 h-full">
        {view === 'auth' && <AuthScreen onLogin={handleLogin} />}
        {view === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} />}
        {view === 'settings' && <SettingsScreen profile={profile} onSave={handleSettingsSave} onCancel={() => setView('dashboard')} />}
        {view === 'dashboard' && (
          <>
            <Dashboard profile={profile} history={history} onStartInterview={() => setView('interview')} onLogout={handleLogout} onViewDetails={setSelectedResult} onOpenSettings={() => setView('settings')} />
            {selectedResult && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/90 backdrop-blur-xl">
                <div className="bg-[#0a0a1a] border border-cyan-500/40 w-full max-w-2xl rounded-3xl overflow-hidden my-8 relative">
                  <div className="bg-purple-900/20 p-6 flex justify-between items-center border-b border-purple-500/30">
                    <h3 className="text-xl font-black text-white flex items-center gap-2"><Award className="text-cyan-400"/> Evaluation Report</h3>
                    <button onClick={() => setSelectedResult(null)} className="text-purple-400 hover:text-cyan-400"><X size={24} /></button>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                      <div className="w-36 h-36 rounded-full border border-purple-500/30 flex items-center justify-center relative bg-[#030014]">
                        <div className="text-center z-10"><span className="text-5xl font-black">{selectedResult.score}</span></div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-cyan-50 text-[15px] bg-purple-900/10 p-5 rounded-2xl border border-purple-500/30">{selectedResult.feedback.summary}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-cyan-950/30 border border-cyan-500/30 p-6 rounded-2xl">
                        <h4 className="font-black text-cyan-400 mb-4 flex items-center gap-2"><CheckCircle size={18}/> Strengths</h4>
                        <ul className="space-y-3">{selectedResult.feedback.strengths.map((s, i) => (<li key={i} className="text-sm text-cyan-100 font-medium">✦ {s}</li>))}</ul>
                      </div>
                      <div className="bg-rose-950/30 border border-rose-500/30 p-6 rounded-2xl">
                        <h4 className="font-black text-rose-400 mb-4 flex items-center gap-2"><Target size={18}/> Improvements</h4>
                        <ul className="space-y-3">{selectedResult.feedback.improvements.map((s, i) => (<li key={i} className="text-sm text-rose-100 font-medium">✦ {s}</li>))}</ul>
                      </div>
                    </div>
                    <button onClick={() => setSelectedResult(null)} className="w-full py-4 mt-8 bg-transparent border-2 border-purple-500/50 hover:bg-purple-500/20 text-white font-bold rounded-xl uppercase">Acknowledge & Close</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {view === 'interview' && <InterviewRoom profile={profile} onComplete={handleInterviewComplete} />}
      </div>
    </div>
  );
}