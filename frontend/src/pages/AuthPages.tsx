import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, BookOpen, Briefcase, Award, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthPages: React.FC = () => {
  const { login, register, isOfflineMode, setOfflineMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register-student' | 'register-recruiter'>('login');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Student specific
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [cgpa, setCgpa] = useState('8.5');
  const [gradYear, setGradYear] = useState('2026');

  // Recruiter specific
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('IT & Software');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent, role: 'STUDENT' | 'RECRUITER') => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const payload: any = {
      username,
      email,
      password,
      role
    };

    if (role === 'STUDENT') {
      payload.fullName = fullName;
      payload.branch = branch;
      payload.cgpa = parseFloat(cgpa);
      payload.graduationYear = parseInt(gradYear);
    } else {
      payload.designation = designation;
      payload.phone = phone;
      payload.companyName = companyName;
      payload.companyIndustry = companyIndustry;
    }

    try {
      const res = await register(payload);
      if (res) {
        setSuccess('Registration successful! You can now log in.');
        setActiveTab('login');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050209] flex flex-col md:flex-row text-slate-100 overflow-hidden relative">
      {/* Mesh Background Glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-violet-650/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-600/10 blur-[180px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[350px] h-[350px] rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none" />

      {/* Decorative Grid Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Left Brand Side */}
      <div className="md:w-1/2 flex flex-col justify-between p-8 md:p-16 relative z-10 bg-[#090414]/30 border-r border-violet-950/20">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-violet-650 to-emerald-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-violet-250 to-slate-400 bg-clip-text text-transparent">
            Smart Placement Intel
          </span>
        </div>

        <div className="my-auto py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" /> Cognitive Placement Network
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight font-display">
            Supercharge Campus Placements with{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
              AI Precision
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed font-light">
            An enterprise cognitive intelligence hub connecting students, industry recruiters, and administrators. Seamlessly parse profiles, extract skills, and run matching engines.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-violet-950/30 pt-8 max-w-lg">
            <div>
              <p className="text-3xl font-extrabold text-white font-display bg-gradient-to-r from-white to-violet-350 bg-clip-text text-transparent">98.4%</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Skill Extraction</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-display bg-gradient-to-r from-white to-emerald-350 bg-clip-text text-transparent">5.2x</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Process Acceleration</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white font-display bg-gradient-to-r from-white to-fuchsia-350 bg-clip-text text-transparent">100%</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Self-Service Setup</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-4">
          <span>© 2026 Smart Placement Inc.</span>
          <button 
            onClick={() => setOfflineMode(!isOfflineMode)}
            className={`px-3 py-1 rounded-full border transition-all text-[11px] font-bold tracking-wide cursor-pointer ${
              isOfflineMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {isOfflineMode ? 'Sandbox Simulator Active' : 'Production API Server Mode'}
          </button>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md glass rounded-3xl p-8 border border-violet-500/20 glow-purple relative">
          
          {/* Navigation tabs */}
          <div className="flex border border-violet-950/45 mb-8 bg-[#0b0616]/75 p-1 rounded-2xl">
            <button
              onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login' 
                  ? 'bg-gradient-to-r from-violet-650 to-fuchsia-600 text-white shadow shadow-violet-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register-student'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register-student' 
                  ? 'bg-gradient-to-r from-violet-650 to-fuchsia-600 text-white shadow shadow-violet-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student Up
            </button>
            <button
              onClick={() => { setActiveTab('register-recruiter'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register-recruiter' 
                  ? 'bg-gradient-to-r from-violet-650 to-fuchsia-600 text-white shadow shadow-violet-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recruiter Up
            </button>
          </div>

          <h2 className="text-3xl font-extrabold mb-2 text-white font-display">
            {activeTab === 'login' && 'Sign In to Workspace'}
            {activeTab === 'register-student' && 'Student Portal Setup'}
            {activeTab === 'register-recruiter' && 'Recruiter Registration'}
          </h2>
          <p className="text-slate-400 text-xs mb-8">
            {activeTab === 'login' && 'Demo: Use student1, google_hr, or admin with password "password"'}
            {activeTab === 'register-student' && 'Submit academic statistics to unlock automated recommendations.'}
            {activeTab === 'register-recruiter' && 'Post placements, screen candidates, and setup interviews.'}
          </p>

          {/* Feedback logs */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/35 text-red-400 rounded-xl p-4 text-xs font-semibold mb-6 flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-450 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-450 rounded-xl p-4 text-xs font-semibold mb-6 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  placeholder="student1, google_hr, admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500 text-white placeholder-slate-650 transition-colors focus:ring-1 focus:ring-violet-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl pl-4 pr-10 py-3 text-xs focus:outline-none focus:border-violet-500 text-white placeholder-slate-650 transition-colors focus:ring-1 focus:ring-violet-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-650 via-fuchsia-600 to-violet-700 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                {loading ? 'Entering System...' : 'Sign In To Console'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STUDENT REGISTER */}
          {activeTab === 'register-student' && (
            <form onSubmit={(e) => handleRegister(e, 'STUDENT')} className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. taraks"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tarak@placement.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 text-white"
                />
              </div>

              <div className="border-t border-violet-950/40 pt-4 mt-4">
                <p className="text-xs font-bold text-violet-400 mb-3 flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-violet-400" /> Academic Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Tarak Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white cursor-pointer"
                    >
                      <option value="CSE">CSE (Computer Science)</option>
                      <option value="ECE">ECE (Electronics)</option>
                      <option value="ME">ME (Mechanical)</option>
                      <option value="EE">EE (Electrical)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Current CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Graduation Year</label>
                    <input
                      type="number"
                      required
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4 cursor-pointer text-xs"
              >
                {loading ? 'Creating Student...' : 'Register Student Profile'}
              </button>
            </form>
          )}

          {/* RECRUITER REGISTER */}
          {activeTab === 'register-recruiter' && (
            <form onSubmit={(e) => handleRegister(e, 'RECRUITER')} className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. google_rec"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500 text-white"
                />
              </div>

              <div className="border-t border-violet-950/40 pt-4 mt-4">
                <p className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-emerald-400" /> Corporate Credentials</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Industry</label>
                    <select
                      value={companyIndustry}
                      onChange={(e) => setCompanyIndustry(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white cursor-pointer"
                    >
                      <option value="IT & Software">IT & Software</option>
                      <option value="Management Consulting">Management Consulting</option>
                      <option value="Finance & banking">Finance & banking</option>
                      <option value="Manufacturing">Manufacturing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="HR Executive"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="+91..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0a0515]/60 border border-violet-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4 cursor-pointer text-xs"
              >
                {loading ? 'Creating Recruiter...' : 'Register Corporate Recruiter'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
