import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, GraduationCap, LayoutDashboard, LogOut, MessageSquare, 
  Settings, User, ChevronRight, Play, Clock, CheckCircle, Target, 
  BarChart2, X, Send, Cpu, Award, Download
} from 'lucide-react';

// =============================================================================
// LOCAL INTERVIEW DATASET (Deployable Simulated AI)
// =============================================================================
const INTERVIEW_DATASET = {
  "Software Engineer": [
    "To start, could you explain the difference between REST and GraphQL?",
    "Interesting. How do you typically handle state management in a large React application?",
    "Can you describe a time you had to optimize a slow-performing database query or function?",
    "What is your approach to writing unit and integration tests?",
    "If you had to design a scalable URL shortener, what database and caching layers would you choose?"
  ],
  "Data Analyst": [
    "Can you walk me through your process for cleaning an unstructured dataset?",
    "How do you handle missing or NULL values in a critical report?",
    "Explain the difference between a LEFT JOIN and an INNER JOIN in SQL.",
    "What is your favorite visualization tool, and why do you prefer it?",
    "Describe a time your data insights directly influenced a business decision."
  ],
  "Frontend Developer": [
    "Could you explain the concept of the Virtual DOM and why React uses it?",
    "How do you ensure a website is fully responsive and accessible (a11y) across different devices?",
    "What strategies do you use to optimize the loading performance of a web application?",
    "Explain the difference between local state and global state, and when you would use each.",
    "Tell me about a complex UI bug you faced and how you debugged it."
  ],
  "Backend Developer": [
    "How do you typically design and secure a RESTful API?",
    "Can you explain the differences between relational (SQL) and non-relational (NoSQL) databases?",
    "Describe your approach to handling user authentication and authorization (e.g., JWT, OAuth).",
    "What are microservices, and what are the pros and cons compared to a monolithic architecture?",
    "How would you handle a sudden, massive spike in traffic to your server?"
  ],
  "Product Manager": [
    "How do you prioritize features for a product roadmap when multiple stakeholders have conflicting requests?",
    "Walk me through how you define and measure the success of a new product launch (KPIs).",
    "Describe a time you had to pivot a product strategy based on user feedback or data.",
    "How do you balance technical debt with the need to ship new features quickly?",
    "What is your approach to writing effective user stories and acceptance criteria?"
  ],
  "UX Designer": [
    "Walk me through your typical design process, from initial research to final prototype.",
    "How do you incorporate user feedback and usability testing into your iterations?",
    "Explain the difference between UX (User Experience) and UI (User Interface) design.",
    "Describe a time you had to compromise on a design due to technical constraints.",
    "What is a design system, and why is it important for a large organization?"
  ],
  "Machine Learning": [
    "Can you explain the difference between supervised and unsupervised learning?",
    "How do you handle overfitting in a machine learning model?",
    "Walk me through your data preprocessing pipeline before training a model.",
    "What evaluation metrics would you use for a highly imbalanced classification problem?",
    "Describe a time you deployed a model into production. What challenges did you face?"
  ],
  "default": [
    "Could you walk me through your resume and background?",
    "What do you consider to be your greatest professional strength?",
    "Describe a challenge you faced recently and how you overcame it.",
    "Where do you see your career heading in the next 3 to 5 years?",
    "Why do you want to work for our company specifically?"
  ]
};

const generateMockResponse = (profile, userMessageCount) => {
  let datasetKey = Object.keys(INTERVIEW_DATASET).find(key => 
    profile.targetRole.toLowerCase().includes(key.toLowerCase())
  );
  const questions = INTERVIEW_DATASET[datasetKey || "default"];

  return new Promise((resolve) => {
    setTimeout(() => {
      if (userMessageCount === 0) {
        resolve(`Hello ${profile.fullName.split(' ')[0]}! I am the AI interviewer from ${profile.targetCompany}. Let's begin your interview for the ${profile.targetRole} role. \n\n${questions[0]}`);
      } else if (userMessageCount <= questions.length) {
        const acknowledgements = ["Great answer.", "That makes sense.", "I see your point.", "Interesting approach.", "Good detail."];
        const randomAck = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
        resolve(`${randomAck} Let's move on. \n\n${questions[userMessageCount]}`);
      } else {
        resolve("Thank you for those detailed answers. I have all the information I need. You may end the session now or ask me any questions you have about the role.");
      }
    }, 1500); 
  });
};

const generateMockEvaluation = (transcript, profile) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userMessages = transcript.filter(m => m.sender === 'user');
      const fullText = userMessages.map(m => m.text.toLowerCase()).join(' ');
      const totalWords = fullText.split(/\s+/).filter(w => w.length > 0).length;
      
      if (totalWords < 5) {
        return resolve({
          score: 15,
          summary: `Your responses were too brief to analyze. You only typed ${totalWords} word(s) in total. An AI tracking system will automatically reject interviews with no conversational data.`,
          strengths: ["Successfully connected to the interview platform"],
          improvements: ["You must actually answer the interviewer's questions", "Type at least a few full sentences to generate a valid score"]
        });
      }

      let score = 25; 
      let strengths = [];
      let improvements = [];

      let effortScore = Math.min((totalWords / 40) * 20, 20);
      score += effortScore;
      
      if (effortScore >= 15) strengths.push("Provided highly detailed and comprehensive answers");
      else improvements.push("Elaborate slightly more on technical concepts (use STAR method)");

      const techKeywords = profile.techStack.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
      let matchedKeywords = 0;
      if (techKeywords.length > 0) {
        techKeywords.forEach(kw => {
          if (fullText.includes(kw)) matchedKeywords++;
        });
        let techScore = (matchedKeywords / techKeywords.length) * 30;
        score += techScore;
        
        if (matchedKeywords === techKeywords.length) strengths.push(`Perfectly integrated your core tech stack (${techKeywords.join(', ')}) into your answers`);
        else if (matchedKeywords > 0) strengths.push(`Demonstrated usage of some core tech stack elements`);
        else improvements.push(`Completely failed to mention your stated skills: ${profile.techStack}`);
      } else {
        score += 20; 
      }

      const domainDictionary = {
        "software engineer": ["code", "scale", "optimize", "test", "api", "database", "system", "architecture", "debug", "deploy", "frontend", "backend", "react", "python"],
        "data analyst": ["query", "clean", "visualize", "sql", "dashboard", "metrics", "trend", "stat", "table", "dataset", "excel", "python", "r"],
        "frontend developer": ["dom", "css", "html", "react", "vue", "angular", "responsive", "accessible", "component", "state", "props", "webpack", "ui", "ux"],
        "backend developer": ["api", "server", "database", "sql", "nosql", "node", "python", "java", "microservices", "auth", "jwt", "scale", "cache", "docker"],
        "product manager": ["roadmap", "kpi", "metrics", "stakeholder", "agile", "scrum", "sprint", "user", "market", "strategy", "feature", "launch", "prioritize"],
        "ux designer": ["wireframe", "prototype", "research", "user", "usability", "figma", "sketch", "accessibility", "journey", "persona", "interface", "flow"],
        "machine learning": ["model", "train", "data", "pipeline", "overfitting", "algorithm", "neural network", "deep learning", "python", "tensorflow", "pytorch", "accuracy"],
        "default": ["team", "lead", "challenge", "goal", "solve", "communicate", "improve", "project", "manage"]
      };

      let roleKey = Object.keys(domainDictionary).find(k => profile.targetRole.toLowerCase().includes(k)) || "default";
      const domainWords = domainDictionary[roleKey];
      let domainMatches = domainWords.filter(w => fullText.includes(w)).length;
      let domainScore = Math.min((domainMatches / 4) * 25, 25); 
      score += domainScore;

      if (domainMatches >= 3) strengths.push(`Demonstrated strong, industry-standard vocabulary for a ${profile.targetRole}`);
      else improvements.push(`Incorporate more professional domain terminology relevant to ${profile.targetRole}s`);

      if (profile.difficulty === 'Hard') score *= 0.85; 
      if (profile.difficulty === 'Low') score = Math.min(score * 1.15, 100); 

      score = Math.round(score);
      score = Math.max(20, Math.min(score, 98));

      let summary = "";
      if (score < 50) {
        summary = `Your performance for ${profile.targetCompany} was below expectations. You lacked technical depth and failed to effectively communicate your core competencies.`;
      } else if (score < 75) {
        summary = `Solid baseline performance. You hit key points but missed opportunities to demonstrate advanced expertise or mention all your stated skills.`;
      } else {
        summary = `Outstanding interview. You successfully articulated your experience, integrated your tech stack naturally, and demonstrated strong alignment with a ${profile.targetRole} role.`;
      }

      resolve({ score, summary, strengths, improvements });
    }, 2000); 
  });
};

const AuthScreen = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const errMsg = onLogin(email, isRegister);
    if (errMsg) {
      setError(errMsg);
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
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
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-white placeholder-purple-300/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              placeholder="engineer@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-purple-200 tracking-wide">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-white placeholder-purple-300/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="text-rose-400 text-sm text-center bg-rose-500/10 py-3 rounded-xl border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3.5 mt-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all active:scale-[0.98] tracking-wide uppercase text-sm"
          >
            {isRegister ? "Sign Up & Setup Profile" : "Login to Dashboard"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-purple-300/70 relative z-10">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button 
            type="button"
            onClick={handleToggleMode}
            className="ml-2 text-cyan-400 hover:text-cyan-300 font-bold tracking-wide drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
          >
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
    difficulty: "Medium", duration: "1", techStack: "React, Python, SQL"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200 py-12 px-4 relative z-10">
      <div className="w-full max-w-3xl p-8 md:p-10 rounded-3xl bg-[#0a0a1a]/80 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Complete Your Profile</h2>
        <p className="text-purple-300/70 mb-8 font-medium">Tailor your AI interviewer to your specific career goals.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Full Name</label>
              <input type="text" required value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Company</label>
              <select value={profile.targetCompany} onChange={(e) => setProfile({...profile, targetCompany: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="IBM">IBM</option>
                <option value="Google">Google</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Amazon">Amazon</option>
                <option value="Meta">Meta</option>
                <option value="Apple">Apple</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Role</label>
              <select value={profile.targetRole} onChange={(e) => setProfile({...profile, targetRole: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="UX Designer">UX Designer</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Difficulty Level</label>
              <select value={profile.difficulty} onChange={(e) => setProfile({...profile, difficulty: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="Low">Low (Beginner)</option>
                <option value="Medium">Medium (Intermediate)</option>
                <option value="Hard">Hard (Expert)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Interview Duration</label>
              <select value={profile.duration} onChange={(e) => setProfile({...profile, duration: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="1">1 Minute (Test)</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Core Tech Stack</label>
              <input type="text" required value={profile.techStack} onChange={(e) => setProfile({...profile, techStack: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all" placeholder="React, Python, SQL" />
            </div>
          </div>
          <button type="submit" className="w-full py-4 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all uppercase tracking-wide text-sm">
            Save Profile & Go to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

const SettingsScreen = ({ profile, onSave, onCancel }) => {
  const [editProfile, setEditProfile] = useState(profile);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editProfile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-slate-200 py-12 px-4 relative z-10">
      <div className="w-full max-w-3xl p-8 md:p-10 rounded-3xl bg-[#0a0a1a]/80 backdrop-blur-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative">
        <button onClick={onCancel} className="absolute top-6 right-6 text-purple-400 hover:text-cyan-400 transition-colors bg-purple-500/10 p-2 rounded-full hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Profile Settings</h2>
        <p className="text-purple-300/70 mb-8 font-medium">Update your career goals and interview preferences.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Full Name</label>
              <input type="text" required value={editProfile.fullName} onChange={(e) => setEditProfile({...editProfile, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Company</label>
              <select value={editProfile.targetCompany} onChange={(e) => setEditProfile({...editProfile, targetCompany: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="IBM">IBM</option>
                <option value="Google">Google</option>
                <option value="Microsoft">Microsoft</option>
                <option value="Amazon">Amazon</option>
                <option value="Meta">Meta</option>
                <option value="Apple">Apple</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Target Role</label>
              <select value={editProfile.targetRole} onChange={(e) => setEditProfile({...editProfile, targetRole: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="UX Designer">UX Designer</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Difficulty Level</label>
              <select value={editProfile.difficulty} onChange={(e) => setEditProfile({...editProfile, difficulty: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="Low">Low (Beginner)</option>
                <option value="Medium">Medium (Intermediate)</option>
                <option value="Hard">Hard (Expert)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Interview Duration</label>
              <select value={editProfile.duration} onChange={(e) => setEditProfile({...editProfile, duration: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all appearance-none">
                <option value="1">1 Minute (Test)</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-purple-200">Core Tech Stack</label>
              <input type="text" required value={editProfile.techStack} onChange={(e) => setEditProfile({...editProfile, techStack: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#030014]/60 border border-purple-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] outline-none text-white transition-all" />
            </div>
          </div>
          <div className="flex gap-4 pt-6">
             <button type="button" onClick={onCancel} className="flex-1 py-3.5 bg-transparent border border-purple-500/50 hover:bg-purple-500/10 text-white font-bold rounded-xl transition-all tracking-wide uppercase text-sm shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              Cancel
             </button>
             <button type="submit" className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all tracking-wide uppercase text-sm">
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
  
  const handleExportToExcel = () => {
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Email,Full Name,Target Company,Target Role,Difficulty,Interview Date,Score\n";

    Object.keys(usersData).forEach(email => {
      const user = usersData[email];
      const p = user.profile || {};
      const h = user.history || [];

      if (h.length === 0) {
         csvContent += `${email},"${p.fullName}","${p.targetCompany}","${p.targetRole}",${p.difficulty},No Interviews Taken,N/A\n`;
      } else {
         h.forEach(session => {
            const dateStr = new Date(session.date).toLocaleString().replace(/,/g, '');
            csvContent += `${email},"${p.fullName}","${p.targetCompany}","${p.targetRole}",${p.difficulty},${dateStr},${session.score}\n`;
         });
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "AITrainee_Database.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-transparent text-slate-200 overflow-hidden relative z-10">
      <aside className="w-64 bg-[#0a0a1a]/70 backdrop-blur-2xl border-r border-purple-500/20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col hidden md:flex z-20">
        <div className="p-6 flex items-center gap-3">
          <Cpu className="text-cyan-400 w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">AI Trainee</span>
        </div>
        <nav className="flex-1 px-4 space-y-3 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 border border-purple-500/30 text-cyan-300 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.1)] font-semibold">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-4 py-3 text-purple-300 hover:text-cyan-300 hover:bg-purple-500/10 rounded-xl transition-all font-medium">
            <Settings size={20} /> Settings
          </button>
          <button onClick={handleExportToExcel} className="w-full flex items-center gap-3 px-4 py-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all font-medium">
            <Download size={20} /> Export Database
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
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors rounded-xl font-bold text-sm uppercase tracking-wide">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{profile.fullName.split(' ')[0]}</span>
            </h1>
            <p className="text-purple-200/70 font-medium">Here's your interview prep progress for <span className="text-cyan-400 font-semibold">{profile.targetCompany}</span>.</p>
          </div>
          <button 
            onClick={onStartInterview}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.5)] transition-all hover:scale-105 active:scale-95 uppercase tracking-wider text-sm"
          >
            <Play size={18} fill="currentColor" /> Start Interview
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#0a0a1a]/60 backdrop-blur-md border border-purple-500/20 p-6 rounded-3xl flex items-center gap-5 shadow-[0_0_20px_rgba(168,85,247,0.1)] group hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all">
            <div className="p-4 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform"><Award size={32} /></div>
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mb-1">Avg Score</p>
              <p className="text-4xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{avgScore}<span className="text-xl text-purple-500/50 font-medium">/100</span></p>
            </div>
          </div>
          <div className="bg-[#0a0a1a]/60 backdrop-blur-md border border-purple-500/20 p-6 rounded-3xl flex items-center gap-5 shadow-[0_0_20px_rgba(168,85,247,0.1)] group hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all">
            <div className="p-4 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform"><Target size={32} /></div>
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mb-1">Tests Taken</p>
              <p className="text-4xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{history.length}</p>
            </div>
          </div>
          <div className="bg-[#0a0a1a]/60 backdrop-blur-md border border-purple-500/20 p-6 rounded-3xl flex items-center gap-5 shadow-[0_0_20px_rgba(168,85,247,0.1)] group hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all">
            <div className="p-4 bg-gradient-to-br from-purple-400/20 to-pink-600/20 border border-purple-500/30 text-purple-400 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform"><BarChart2 size={32} /></div>
            <div>
              <p className="text-xs text-purple-300 uppercase tracking-widest font-bold mb-1">Trend</p>
              <p className={`text-xl font-black mt-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] ${history.length >= 2 ? (history[0].score >= history[1].score ? 'text-emerald-400' : 'text-rose-400') : 'text-purple-400'}`}>
                {history.length >= 2 ? (history[0].score >= history[1].score ? '↑ Improving' : '↓ Needs Work') : 'Analyzing...'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a1a]/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden">
          <div className="p-6 border-b border-purple-500/30 bg-purple-900/10 flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2"><Clock className="text-cyan-400"/> Interview History</h3>
          </div>
          {history.length === 0 ? (
            <div className="p-16 text-center text-purple-400 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-purple-900/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <MessageSquare size={40} className="text-cyan-400/50" />
              </div>
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
                    <tr key={item.id} className="hover:bg-cyan-500/10 transition-colors group">
                      <td className="p-5 text-sm font-medium text-purple-200">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="p-5 text-sm font-bold text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">{item.role}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wider shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                          item.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]' :
                          item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        }`}>
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-2.5 bg-[#030014] rounded-full overflow-hidden border border-purple-500/20 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${item.score}%` }}></div>
                          </div>
                          <span className="text-sm font-black text-white">{item.score}%</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <button onClick={() => onViewDetails(item)} className="text-cyan-400 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-400 px-4 py-2 rounded-xl transition-all shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
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
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const dur = parseInt(profile?.duration || "1");
    return isNaN(dur) ? 60 : dur * 60; 
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const startInterview = async () => {
      setIsAiTyping(true);
      const aiResponse = await generateMockResponse(profile, 0);
      setMessages([{ id: 1, sender: 'ai', text: aiResponse }]);
      setIsAiTyping(false);
    };
    startInterview();

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []); 

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitting) {
      handleEndInterview(true);
    }
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

    const aiResponseText = await generateMockResponse(profile, nextCount);
    
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
      id: Date.now() + 1, 
      sender: 'system', 
      text: auto ? "Time's up! Generating evaluation..." : "Interview submitted. Generating evaluation..." 
    }]);

    const evaluation = await generateMockEvaluation(finalMessages, profile);
    
    const interviewRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      role: profile.targetRole,
      difficulty: profile.difficulty,
      score: evaluation.score,
      feedback: evaluation
    };

    onComplete(interviewRecord);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-transparent relative z-10">
      <div className="w-1/4 min-w-[300px] bg-[#0a0a1a]/80 backdrop-blur-2xl border-r border-purple-500/30 p-8 flex flex-col hidden md:flex shadow-[10px_0_40px_rgba(0,0,0,0.6)] z-20">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Cpu className="text-cyan-400" size={24} />
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-tight">Active Uplink</h2>
        </div>

        <div className="bg-[#030014]/80 border border-purple-500/30 rounded-2xl p-6 mb-8 text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/30 blur-[2px] animate-[ping_3s_ease-in-out_infinite]"></div>
          
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3 w-full">Session Time Remaining</p>
          <div className={`text-5xl font-mono font-black tracking-widest w-full ${timeLeft < 60 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse' : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-6 flex-1 bg-purple-900/10 p-6 rounded-2xl border border-purple-500/20">
          <div>
            <p className="text-xs text-purple-500 uppercase font-black tracking-widest mb-1">Target Corp</p>
            <p className="text-white font-bold text-lg drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">{profile.targetCompany}</p>
          </div>
          <div>
            <p className="text-xs text-purple-500 uppercase font-black tracking-widest mb-1">Designation</p>
            <p className="text-cyan-300 font-bold">{profile.targetRole}</p>
          </div>
          <div>
            <p className="text-xs text-purple-500 uppercase font-black tracking-widest mb-1">Difficulty Level</p>
            <p className="text-white font-bold uppercase tracking-wider">{profile.difficulty}</p>
          </div>
        </div>

        <button 
          onClick={() => handleEndInterview(false)}
          disabled={isSubmitting}
          className="w-full py-4 mt-8 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]"
        >
          {isSubmitting ? <span className="animate-pulse">Processing Data...</span> : <><CheckCircle size={20} /> Submit Interview</>}
        </button>
      </div>

      <div className="flex-1 flex flex-col relative bg-transparent z-10">
        
        <div className="md:hidden bg-[#0a0a1a]/90 backdrop-blur-md border-b border-purple-500/30 p-4 flex justify-between items-center z-20 shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
           <div className="flex items-center gap-2">
              <Clock size={16} className={timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-cyan-400"} />
              <span className={`font-mono font-bold ${timeLeft < 60 ? "text-rose-500 animate-pulse" : "text-cyan-400"}`}>
                 {formatTime(timeLeft)}
              </span>
           </div>
           <button 
             onClick={() => handleEndInterview(false)}
             disabled={isSubmitting}
             className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-500/30 active:scale-95 transition-all"
           >
             {isSubmitting ? "..." : "Submit"}
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scroll-smooth relative">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}>
              {msg.sender === 'system' ? (
                <div className="w-full text-center my-6">
                  <span className="bg-purple-900/40 text-cyan-300 text-xs font-black px-6 py-2 rounded-full uppercase tracking-widest border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    {msg.text}
                  </span>
                </div>
              ) : (
                <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-5 md:p-6 shadow-2xl relative ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-purple-700 to-indigo-600 text-white rounded-br-sm border border-purple-400/30 shadow-[0_0_25px_rgba(168,85,247,0.3)]' 
                    : 'bg-[#0a0a1a]/90 backdrop-blur-md border border-cyan-500/30 text-cyan-50 rounded-bl-sm shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                }`}>
                  <div className="flex items-center gap-2 mb-3 opacity-90 border-b border-white/10 pb-2">
                    {msg.sender === 'user' ? <User size={14} className="text-purple-200" /> : <Cpu size={14} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />}
                    <span className={`text-xs font-black uppercase tracking-widest ${msg.sender === 'user' ? 'text-purple-200' : 'text-cyan-400'}`}>
                      {msg.sender === 'user' ? 'Trainee Uplink' : `AI Agent [${profile.targetCompany}]`}
                    </span>
                  </div>
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</div>
                </div>
              )}
            </div>
          ))}
          
          {isAiTyping && (
            <div className="flex justify-start">
              <div className="bg-[#0a0a1a]/90 backdrop-blur-md border border-cyan-500/30 rounded-3xl rounded-bl-sm p-5 flex gap-2 w-24 justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(34,211,238,0.8)]" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_5px_rgba(34,211,238,0.8)]" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-4 md:p-8 bg-[#0a0a1a]/80 backdrop-blur-2xl border-t border-purple-500/30 relative z-20">
          <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSubmitting || timeLeft <= 0}
              placeholder="Transmit your response..."
              className="relative w-full bg-[#030014] border-2 border-purple-500/40 text-white rounded-xl pl-6 pr-16 py-5 outline-none focus:border-cyan-400 transition-all disabled:opacity-50 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] placeholder-purple-500/50 text-lg font-medium"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isAiTyping || isSubmitting || timeLeft <= 0}
              className="absolute right-3 top-3 bottom-3 aspect-square bg-gradient-to-br from-cyan-400 to-blue-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95 disabled:shadow-none"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
        </div>
        
        {isSubmitting && (
          <div className="absolute inset-0 bg-[#030014]/80 backdrop-blur-md z-30 flex items-center justify-center">
             <div className="bg-[#0a0a1a] p-10 rounded-3xl border border-cyan-500/50 flex flex-col items-center max-w-sm text-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
               <div className="relative">
                 <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50 animate-pulse"></div>
                 <Cpu className="text-cyan-400 w-16 h-16 mb-6 relative z-10 animate-bounce" />
               </div>
               <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">Compiling Results</h3>
               <p className="text-cyan-200/70 font-medium">Running performance analytics against {profile.targetCompany} algorithms...</p>
             </div>
          </div>
        )}
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
    const activeEmail = localStorage.getItem('aitrainee_logged_in');
    if (activeEmail) {
      const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
      if (usersData[activeEmail]) {
        setUser({ email: activeEmail });
        setProfile(usersData[activeEmail].profile);
        setHistory(usersData[activeEmail].history || []);
        setView('dashboard');
      } else {
        localStorage.removeItem('aitrainee_logged_in');
      }
    }
  }, []);

  const handleLogin = (rawEmail, isRegister) => {
    const email = rawEmail.toLowerCase().trim();
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    
    if (isRegister) {
      if (usersData[email]) {
        return "An account with this email already exists. Please log in.";
      }
      setUser({ email });
      setProfile(null);
      setHistory([]);
      localStorage.setItem('aitrainee_logged_in', email);
      setView('onboarding');
    } else {
      if (usersData[email] && usersData[email].profile) {
        setUser({ email });
        setProfile(usersData[email].profile);
        setHistory(usersData[email].history || []);
        localStorage.setItem('aitrainee_logged_in', email);
        setView('dashboard');
      } else {
        return "No account found with this email. Please register first.";
      }
    }
  };

  const handleOnboardingComplete = (data) => {
    setProfile(data);
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    usersData[user.email] = { profile: data, history: [] };
    localStorage.setItem('aitrainee_users', JSON.stringify(usersData));
    setView('dashboard');
  };

  const handleSettingsSave = (updatedProfile) => {
    setProfile(updatedProfile);
    const usersData = JSON.parse(localStorage.getItem('aitrainee_users') || '{}');
    if (usersData[user.email]) {
      usersData[user.email].profile = updatedProfile;
      localStorage.setItem('aitrainee_users', JSON.stringify(usersData));
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
    }
    setSelectedResult(resultData);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    setHistory([]);
    setSelectedResult(null);
    localStorage.removeItem('aitrainee_logged_in');
    setView('auth');
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
            <Dashboard 
              profile={profile} 
              history={history} 
              onStartInterview={() => setView('interview')} 
              onLogout={handleLogout}
              onViewDetails={(item) => setSelectedResult(item)}
              onOpenSettings={() => setView('settings')}
            />
            
            {selectedResult && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030014]/90 backdrop-blur-xl overflow-y-auto">
                <div className="bg-[#0a0a1a] border border-cyan-500/40 w-full max-w-2xl rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden my-8 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-cyan-500/30 blur-2xl"></div>

                  <div className="bg-purple-900/20 p-6 flex justify-between items-center border-b border-purple-500/30 relative z-10">
                    <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest"><Award className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"/> Evaluation Report</h3>
                    <button onClick={() => setSelectedResult(null)} className="text-purple-400 hover:text-cyan-400 bg-purple-500/10 p-2 rounded-full transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-6 md:p-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                      
                      <div className="w-36 h-36 rounded-full border border-purple-500/30 flex items-center justify-center relative bg-[#030014] shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                          <circle cx="72" cy="72" r="66" fill="none" stroke="#1e1b4b" strokeWidth="8" />
                          <circle cx="72" cy="72" r="66" fill="none" stroke={selectedResult.score >= 70 ? "#22d3ee" : "#f472b6"} strokeWidth="8" 
                            strokeDasharray="414.7" strokeDashoffset={414.7 - (414.7 * selectedResult.score) / 100} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="text-center z-10">
                          <span className="text-5xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{selectedResult.score}</span>
                          <span className="text-sm text-cyan-400/70 font-bold uppercase tracking-widest block mt-1">Score</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">AI Diagnostic Summary</h4>
                        <p className="text-cyan-50 text-[15px] leading-relaxed bg-purple-900/10 p-5 rounded-2xl border border-purple-500/30 shadow-inner">
                          {selectedResult.feedback.summary}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-cyan-950/30 border border-cyan-500/30 p-6 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                        <h4 className="font-black text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><CheckCircle size={18}/> Validated Strengths</h4>
                        <ul className="space-y-3">
                          {selectedResult.feedback.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-cyan-100 flex items-start gap-3 font-medium">
                              <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] mt-0.5">✦</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-rose-950/30 border border-rose-500/30 p-6 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                        <h4 className="font-black text-rose-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm"><Target size={18}/> Critical Vectors</h4>
                        <ul className="space-y-3">
                          {selectedResult.feedback.improvements.map((s, i) => (
                            <li key={i} className="text-sm text-rose-100 flex items-start gap-3 font-medium">
                              <span className="text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)] mt-0.5">✦</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <button onClick={() => setSelectedResult(null)} className="w-full py-4 mt-8 bg-transparent border-2 border-purple-500/50 hover:bg-purple-500/20 text-white font-bold rounded-xl transition-all uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                      Acknowledge & Close
                    </button>
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