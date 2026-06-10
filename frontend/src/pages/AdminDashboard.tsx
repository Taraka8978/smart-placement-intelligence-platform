import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Sparkles, RefreshCw, Send, Users, FileText, 
  Settings, Activity, Server, Database, ChevronRight, Download, 
  Trash2, UserX, Award, Briefcase, GraduationCap, Clock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, logout, isOfflineMode } = useAuth();

  // States
  const [stats, setStats] = useState<any>({
    totalStudents: 0, totalRecruiters: 0, totalCompanies: 0, placedStudents: 0, placementRate: 0.0, highestPackageLpa: 0.0, averagePackageLpa: 0.0
  });
  const [branchStats, setBranchStats] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [recruitersList, setRecruitersList] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [monitor, setMonitor] = useState<any>({
    cpuLoadPercentage: 0, memoryUsedGb: 0, memoryTotalGb: 8, dbConnectionPoolActive: 0, dbConnectionPoolSize: 50, averageLatencyMs: 0, systemStatus: 'OPERATIONAL'
  });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'users' | 'reports' | 'monitor'>('analytics');

  // Report Generator Form
  const [repTitle, setRepTitle] = useState('');
  const [repDesc, setRepDesc] = useState('');

  const API_BASE = 'http://localhost:8888/api/v1';

  const fetchData = async () => {
    setLoading(true);
    if (isOfflineMode) {
      // Load from Local Storage
      const allStudents = JSON.parse(localStorage.getItem('sp_students') || '[]');
      const allRecruiters = JSON.parse(localStorage.getItem('sp_recruiters') || '[]');
      const allCompanies = JSON.parse(localStorage.getItem('sp_companies') || '[]');
      const allApps = JSON.parse(localStorage.getItem('sp_applications') || '[]');
      const allDrives = JSON.parse(localStorage.getItem('sp_drives') || '[]');
      const allReports = JSON.parse(localStorage.getItem('sp_reports') || '[]');
      const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');

      // Map profiles for audit lists
      const mappedStudents = allStudents.map((s: any) => ({
        ...s,
        user: allUsers.find((u: any) => u.id === s.userId)
      }));
      setStudentsList(mappedStudents);

      const mappedRecruiters = allRecruiters.map((r: any) => ({
        ...r,
        user: allUsers.find((u: any) => u.id === r.userId),
        company: allCompanies.find((c: any) => c.id === r.companyId)
      }));
      setRecruitersList(mappedRecruiters);

      setReports(allReports);

      // Calculations
      const totalStud = allStudents.length;
      const totalRec = allRecruiters.length;
      const totalComp = allCompanies.length;
      
      const placedStud = allApps.filter((a: any) => a.status === 'SELECTED').map((a: any) => a.studentId);
      const placedCount = new Set(placedStud).size;
      const rate = totalStud > 0 ? (placedCount / totalStud) * 100 : 0;

      const maxLpa = allDrives.reduce((max: number, d: any) => d.packageLpa > max ? d.packageLpa : max, 0);
      const avgLpa = allDrives.length > 0 ? allDrives.reduce((sum: number, d: any) => sum + d.packageLpa, 0) / allDrives.length : 0;

      setStats({
        totalStudents: totalStud,
        totalRecruiters: totalRec,
        totalCompanies: totalComp,
        placedStudents: placedCount,
        placementRate: Math.round(rate * 10) / 10,
        highestPackageLpa: Math.round(maxLpa * 10) / 10,
        averagePackageLpa: Math.round(avgLpa * 10) / 10
      });

      // Branch breakdown stats
      const branchGroups = allStudents.reduce((groups: any, s: any) => {
        const b = s.branch || 'CSE';
        groups[b] = groups[b] || [];
        groups[b].push(s);
        return groups;
      }, {});

      const branchList = Object.keys(branchGroups).map(branch => {
        const studs = branchGroups[branch];
        const total = studs.size || studs.length;
        const placed = studs.filter((s: any) => allApps.some((a: any) => a.studentId === s.id && a.status === 'SELECTED')).length;
        const brate = total > 0 ? (placed / total) * 100 : 0;
        return {
          branch: branch,
          totalStudents: total,
          placedStudents: placed,
          placementRate: Math.round(brate * 10) / 10
        };
      });
      setBranchStats(branchList);

      // Sim monitor
      simulateMonitorData();
      setLoading(false);
    } else {
      try {
        const headers = { 'Authorization': `Bearer ${user?.token}` };
        
        const statsRes = await fetch(`${API_BASE}/admin/analytics/dashboard`, { headers });
        const statsData = await statsRes.json();
        setStats(statsData);

        const branchRes = await fetch(`${API_BASE}/admin/analytics/branch`, { headers });
        const branchData = await branchRes.json();
        setBranchStats(branchData);

        const studentsRes = await fetch(`${API_BASE}/admin/students`, { headers });
        const studentsData = await studentsRes.json();
        setStudentsList(studentsData);

        const recruitersRes = await fetch(`${API_BASE}/admin/recruiters`, { headers });
        const recruitersData = await recruitersRes.json();
        setRecruitersList(recruitersData);

        const reportsRes = await fetch(`${API_BASE}/admin/reports`, { headers });
        const reportsData = await reportsRes.json();
        setReports(reportsData);

        const monitorRes = await fetch(`${API_BASE}/admin/system/monitor`, { headers });
        const monitorData = await monitorRes.json();
        setMonitor(monitorData);
      } catch (err) {
        console.error("API error loading admin dashboard: ", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const simulateMonitorData = () => {
    const random = Math.random();
    setMonitor({
      cpuLoadPercentage: Math.round((20 + random * 25) * 10) / 10,
      memoryUsedGb: Math.round((1.5 + random * 0.5) * 10) / 10,
      memoryTotalGb: 8.0,
      dbConnectionPoolActive: Math.floor(10 + random * 10),
      dbConnectionPoolSize: 50,
      averageLatencyMs: Math.floor(50 + random * 40),
      systemStatus: 'OPERATIONAL'
    });
  };

  useEffect(() => {
    fetchData();
    // Poll monitor data every 8 seconds when active tab is monitor
    let timer: any;
    if (activeSubTab === 'monitor') {
      timer = setInterval(() => {
        if (isOfflineMode) {
          simulateMonitorData();
        } else {
          // Fetch from API
          fetch(`${API_BASE}/admin/system/monitor`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          }).then(res => res.json()).then(data => setMonitor(data)).catch(console.error);
        }
      }, 8000);
    }
    return () => clearInterval(timer);
  }, [user, activeSubTab, isOfflineMode]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repTitle) return;

    if (isOfflineMode) {
      const allReports = JSON.parse(localStorage.getItem('sp_reports') || '[]');
      const newReport = {
        id: allReports.length + 1,
        title: repTitle,
        description: repDesc,
        fileUrl: `/reports/placement_report_${Date.now()}.pdf`,
        generatedBy: user?.username,
        createdAt: new Date().toISOString()
      };

      allReports.push(newReport);
      localStorage.setItem('sp_reports', JSON.stringify(allReports));
      setRepTitle('');
      setRepDesc('');
      fetchData();
      alert("Report generated successfully!");
    } else {
      try {
        const response = await fetch(`${API_BASE}/admin/reports/generate?title=${repTitle}&description=${repDesc}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (response.ok) {
          setRepTitle('');
          setRepDesc('');
          fetchData();
          alert("Placement Report Generated!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteUser = (userId: number) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      if (isOfflineMode) {
        const allUsers = JSON.parse(localStorage.getItem('sp_users') || '[]');
        const updated = allUsers.filter((u: any) => u.id !== userId);
        localStorage.setItem('sp_users', JSON.stringify(updated));
        
        // delete matching profiles
        const allStudents = JSON.parse(localStorage.getItem('sp_students') || '[]');
        localStorage.setItem('sp_students', JSON.stringify(allStudents.filter((s: any) => s.userId !== userId)));
        
        const allRecruiters = JSON.parse(localStorage.getItem('sp_recruiters') || '[]');
        localStorage.setItem('sp_recruiters', JSON.stringify(allRecruiters.filter((r: any) => r.userId !== userId)));
        
        fetchData();
      } else {
        alert("Delete user operation is simulated. Disable via profile settings on live system.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050209] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <span className="font-display font-medium text-sm">Synchronizing administrator dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050209] text-slate-100 flex font-sans">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#090514]/85 border-r border-violet-950/20 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-650 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Settings className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Admin Panel</span>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'analytics', label: 'System Statistics' },
              { id: 'users', label: 'Auditing Directory' },
              { id: 'reports', label: 'Report Generator' },
              { id: 'monitor', label: 'Infrastructure Health' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === tab.id 
                    ? 'bg-gradient-to-r from-violet-650/80 to-fuchsia-600/80 text-white shadow shadow-violet-500/10' 
                    : 'text-slate-400 hover:bg-violet-950/20 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-violet-950/20 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-950 flex items-center justify-center font-bold text-sm text-violet-300 shadow shadow-violet-500/10">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">System Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 bg-violet-950/20 hover:bg-violet-950/40 border border-violet-500/10 hover:border-violet-500/25 rounded-xl text-xs font-bold text-violet-300 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen p-4 md:p-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-violet-950/20 pb-5 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">Administrator Workspace</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Complete administrative diagnostics and corporate reports compile. Sandbox: {isOfflineMode ? 'Active' : 'Unactive'}.
            </p>
          </div>
          <button
            onClick={logout}
            className="md:hidden px-3.5 py-2 bg-violet-950/20 hover:bg-violet-950/40 border border-violet-500/10 rounded-xl text-xs font-bold text-violet-300 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* --- Tab Contents --- */}

        {/* STATISTICS TAB */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { label: 'TOTAL STUDENTS', val: stats.totalStudents, desc: `${stats.placedStudents} placed`, icon: GraduationCap, color: 'from-violet-650/10 to-fuchsia-600/10 border-violet-500/20 text-violet-400' },
                { label: 'PLACEMENT RATE', val: `${stats.placementRate}%`, desc: 'overall conversion', icon: Sparkles, color: 'from-emerald-650/10 to-teal-600/10 border-emerald-500/20 text-emerald-400' },
                { label: 'HIGHEST PACKAGE', val: `${stats.highestPackageLpa} LPA`, desc: 'top recruiters offer', icon: Award, color: 'from-amber-650/10 to-orange-600/10 border-amber-500/20 text-amber-400' },
                { label: 'MEAN AVERAGE', val: `${stats.averagePackageLpa} LPA`, desc: 'base salary index', icon: Briefcase, color: 'from-cyan-650/10 to-blue-600/10 border-cyan-500/20 text-cyan-400' }
              ].map((kpi, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${kpi.color} border rounded-2xl p-5 hover-glow hover-lift`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{kpi.label}</span>
                      <span className="text-3xl font-black text-white mt-1.5 block font-display">{kpi.val}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block font-semibold">{kpi.desc}</span>
                    </div>
                    <div className="h-10 w-10 bg-slate-950/50 rounded-xl flex items-center justify-center">
                      <kpi.icon className="h-5.5 w-5.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual SVG Charting */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Branch Placements Rates bar chart */}
              <div className="glass rounded-3xl p-6 border-violet-500/15 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-30%] w-60 h-60 rounded-full bg-violet-650/5 blur-[80px]" />
                
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 font-display">Branch Placement Index</h3>
                  <p className="text-[11px] text-slate-400 leading-normal font-medium">Screened ratios and selection success rate across departments.</p>
                </div>

                <div className="my-6">
                  {branchStats.length === 0 ? (
                    <p className="text-xs text-slate-550 text-center py-10 border border-dashed border-violet-950/20 rounded-2xl">No branch statistics generated.</p>
                  ) : (
                    <div className="relative w-full h-48 flex items-end justify-around border-b border-violet-950/30 pb-3 pt-6">
                      {branchStats.map((br, index) => (
                        <div key={index} className="flex flex-col items-center group w-1/4">
                          <span className="text-[10px] font-black text-violet-300 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {br.placementRate}%
                          </span>
                          
                          {/* Animated progress bar */}
                          <div 
                            className="w-8 bg-gradient-to-t from-violet-600 to-fuchsia-500 group-hover:brightness-110 rounded-t-lg transition-all duration-500 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25" 
                            style={{ height: `${Math.max(16, br.placementRate * 1.3)}px` }} 
                          />
                          
                          <span className="text-xs font-bold mt-3 text-white block font-display">{br.branch}</span>
                          <span className="text-[9px] text-slate-500 block font-semibold mt-0.5">{br.placedStudents} / {br.totalStudents}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* System summary & notes */}
              <div className="glass rounded-3xl p-6 border-violet-500/15 flex flex-col justify-between shadow-2xl">
                <h3 className="text-sm font-bold text-white mb-4 font-display">Corporate Integration overview</h3>
                <div className="space-y-4 text-xs font-medium">
                  <div className="flex justify-between border-b border-violet-950/20 pb-3">
                    <span className="text-slate-400">Corporate Recruiters</span>
                    <span className="text-white font-bold bg-violet-500/10 px-2.5 py-0.5 rounded border border-violet-500/20">{stats.totalRecruiters} recruiters</span>
                  </div>
                  <div className="flex justify-between border-b border-violet-950/20 pb-3">
                    <span className="text-slate-400">Corporate Partners</span>
                    <span className="text-white font-bold bg-violet-500/10 px-2.5 py-0.5 rounded border border-violet-500/20">{stats.totalCompanies} organizations</span>
                  </div>
                  <div className="p-4 bg-violet-950/20 border border-violet-900/30 rounded-2xl text-violet-300 flex items-start gap-2.5">
                    <Sparkles className="h-4.5 w-4.5 mt-0.5 shrink-0 animate-pulse text-violet-400" />
                    <p className="text-[10px] leading-relaxed">Admin stats refresh immediately upon student status transitions (e.g. Recruiter Shortlisting or Offering Selection).</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* AUDITING DIRECTORY TAB */}
        {activeSubTab === 'users' && (
          <div className="grid grid-cols-1 gap-6">
            
            {/* Students Audit list */}
            <div className="glass rounded-3xl p-6 border-violet-500/15 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 font-display"><GraduationCap className="h-4.5 w-4.5 text-violet-450" /> Student Enrollment Registry</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-violet-950/40 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                      <th className="py-3.5">Student Name</th>
                      <th>Account username</th>
                      <th>Branch</th>
                      <th>CGPA</th>
                      <th>AI Readiness</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map(st => (
                      <tr key={st.id} className="border-b border-violet-950/20 hover:bg-violet-950/10 transition-colors">
                        <td className="py-4 font-bold text-white">{st.fullName}</td>
                        <td className="text-slate-400">{st.user?.username || 'mock_user'}</td>
                        <td>{st.branch}</td>
                        <td className="font-semibold text-white">{st.cgpa}</td>
                        <td>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                            st.placementReadinessScore >= 80 ? 'bg-violet-500/15 border-violet-500/30 text-violet-400' :
                            st.placementReadinessScore >= 60 ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-slate-850 text-slate-450'
                          }`}>
                            {st.placementReadinessScore}%
                          </span>
                        </td>
                        <td className="text-right">
                          <button 
                            onClick={() => deleteUser(st.userId)}
                            className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Suspend Account"
                          >
                            <UserX className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recruiters Audit list */}
            <div className="glass rounded-3xl p-6 border-violet-500/15 shadow-2xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5 font-display"><Briefcase className="h-4.5 w-4.5 text-emerald-450" /> Recruiters Registry</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-violet-950/40 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                      <th className="py-3.5">Recruiter Reference</th>
                      <th>Company</th>
                      <th>Designation</th>
                      <th>Account</th>
                      <th>Phone</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruitersList.map(rec => (
                      <tr key={rec.id} className="border-b border-violet-950/20 hover:bg-violet-950/10 transition-colors">
                        <td className="py-4 text-slate-400">#REC_00{rec.id}</td>
                        <td className="font-bold text-white">{rec.company?.name || 'Company Inc.'}</td>
                        <td>{rec.designation}</td>
                        <td>{rec.user?.username || 'rec_user'}</td>
                        <td>{rec.phone || 'N/A'}</td>
                        <td className="text-right">
                          <button 
                            onClick={() => deleteUser(rec.userId)}
                            className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Suspend Account"
                          >
                            <UserX className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* REPORT GENERATOR TAB */}
        {activeSubTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Generate Report Form */}
            <form onSubmit={handleGenerateReport} className="lg:col-span-2 glass rounded-3xl p-6 border-violet-500/15 space-y-4 shadow-2xl relative">
              <h3 className="text-md font-bold text-white mb-2 font-display">Generate Placement Reports</h3>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Campus Recruitment Analytics 2026"
                  value={repTitle}
                  onChange={(e) => setRepTitle(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Summary description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Summarize high levels, key recruitment partners, salary metrics, and placement ratios..."
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <button type="submit" className="px-5 py-3 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow cursor-pointer">
                <Send className="h-4 w-4" /> Compile & Download Report
              </button>
            </form>

            {/* List reports generated */}
            <div className="glass rounded-3xl p-6 border-violet-500/15 space-y-4 shadow-2xl h-fit">
              <h3 className="text-sm font-bold text-white border-b border-violet-950/30 pb-2 font-display">Compiled Archive</h3>
              <div className="space-y-3.5">
                {reports.length === 0 ? (
                  <p className="text-xs text-slate-555 py-4 text-center">No reports compiled yet.</p>
                ) : (
                  reports.map(rep => (
                    <div key={rep.id} className="p-4 bg-[#0d071b]/80 border border-violet-500/10 rounded-2xl space-y-2">
                      <div>
                        <p className="text-xs font-bold text-white">{rep.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">{rep.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-violet-950/20 text-[10px]">
                        <span className="text-slate-550">{new Date(rep.createdAt || Date.now()).toLocaleDateString()}</span>
                        <a href={rep.fileUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-bold hover:underline flex items-center gap-0.5">
                          Download PDF <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* INFRASTRUCTURE MONITOR TAB */}
        {activeSubTab === 'monitor' && (
          <div className="space-y-6">
            
            <div className="glass rounded-3xl p-6 border-violet-500/15 flex justify-between items-center shadow-md">
              <div>
                <h3 className="text-md font-bold text-white mb-1 font-display">Diagnostics Console</h3>
                <p className="text-xs text-slate-400">Monitoring connection pools, active threads, memory leaks, and average response latencies.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 animate-pulse text-emerald-450" /> {monitor.systemStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              
              <div className="glass rounded-3xl p-5 border-violet-500/10 flex flex-col justify-between h-36 relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-30%] w-28 h-28 rounded-full bg-violet-650/5 blur-[50px]" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active CPU Load</span>
                  <Server className="h-4.5 w-4.5 text-violet-400" />
                </div>
                <div>
                  <span className="text-3xl font-black text-white font-display">{monitor.cpuLoadPercentage}%</span>
                  <div className="w-full bg-[#0a0515] h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full" style={{ width: `${monitor.cpuLoadPercentage}%` }} />
                  </div>
                </div>
              </div>

              <div className="glass rounded-3xl p-5 border-violet-500/10 flex flex-col justify-between h-36 relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-30%] w-28 h-28 rounded-full bg-cyan-650/5 blur-[50px]" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">JVM memory</span>
                  <Activity className="h-4.5 w-4.5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-3xl font-black text-white font-display">{monitor.memoryUsedGb} GB</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-semibold">allocated: {monitor.memoryTotalGb} GB</span>
                </div>
              </div>

              <div className="glass rounded-3xl p-5 border-violet-500/10 flex flex-col justify-between h-36 relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-30%] w-28 h-28 rounded-full bg-emerald-650/5 blur-[50px]" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">JPA Connection pool</span>
                  <Database className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-3xl font-black text-white font-display">{monitor.dbConnectionPoolActive} / {monitor.dbConnectionPoolSize}</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-semibold">active connections</span>
                </div>
              </div>

              <div className="glass rounded-3xl p-5 border-violet-500/10 flex flex-col justify-between h-36 relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-30%] w-28 h-28 rounded-full bg-amber-650/5 blur-[50px]" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mean Latency</span>
                  <Clock className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <div>
                  <span className="text-3xl font-black text-white font-display">{monitor.averageLatencyMs} ms</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-semibold">request roundtrip</span>
                </div>
              </div>

            </div>

            <div className="glass rounded-3xl p-6 border-violet-500/15 space-y-4">
              <h4 className="text-sm font-bold text-white font-display">System Integrity Audits</h4>
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between border-b border-violet-950/20 pb-3">
                  <span className="text-slate-450">Application HTTP Server</span>
                  <span className="text-emerald-400">ONLINE (port 8080/8888)</span>
                </div>
                <div className="flex justify-between border-b border-violet-950/20 pb-3">
                  <span className="text-slate-450">Database Engine connectivity</span>
                  <span className="text-emerald-400">CONNECTED ({isOfflineMode ? 'H2 Engine' : 'MySQL Production'})</span>
                </div>
                <div className="flex justify-between border-b border-violet-950/20 pb-3">
                  <span className="text-slate-450">Token Authentication Filter (JWT)</span>
                  <span className="text-emerald-400">OPERATIONAL</span>
                </div>
                <div className="flex justify-between border-b border-violet-950/20 pb-3">
                  <span className="text-slate-450">Placement Cognitive Analyzer service</span>
                  <span className="text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
