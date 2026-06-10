import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building, Sparkles, Plus, CheckCircle, XCircle, Clock, 
  Calendar, RefreshCw, Send, Users, UserCheck, Briefcase, 
  FileText, ExternalLink, MapPin, Globe, Phone, ListFilter
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user, logout, isOfflineMode } = useAuth();
  
  // States
  const [recruiter, setRecruiter] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalDrives: 0, totalApplications: 0, shortlistedCount: 0, selectedCount: 0, rejectedCount: 0, interviewsScheduledCount: 0, recentApplicants: []
  });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'drives' | 'candidates' | 'company'>('analytics');

  // Selected drive filter for applicant pipeline
  const [selectedDriveFilter, setSelectedDriveFilter] = useState<number | 'all'>('all');

  // Company Profile Form
  const [compName, setCompName] = useState('');
  const [compIndustry, setCompIndustry] = useState('IT & Software');
  const [compWebsite, setCompWebsite] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compDesc, setCompDesc] = useState('');

  // Create Job Drive Form
  const [driveTitle, setDriveTitle] = useState('');
  const [driveRoleType, setDriveRoleType] = useState('Full-time');
  const [drivePkg, setDrivePkg] = useState('12.0');
  const [driveCgpa, setDriveCgpa] = useState('8.0');
  const [driveBranch, setDriveBranch] = useState('CSE, ECE');
  const [driveSkills, setDriveSkills] = useState('React, Java, SQL');
  const [driveDate, setDriveDate] = useState('');
  const [driveDesc, setDriveDesc] = useState('');

  // Schedule Interview State
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewDuration, setInterviewDuration] = useState('45');
  const [interviewMode, setInterviewMode] = useState('ONLINE');
  const [interviewLink, setInterviewLink] = useState('Google Meet Link');
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  const API_BASE = 'http://localhost:8888/api/v1';

  const fetchData = async () => {
    setLoading(true);
    if (isOfflineMode) {
      // Load recruiter profile
      const recruiters = JSON.parse(localStorage.getItem('sp_recruiters') || '[]');
      const currentRecruiter = recruiters.find((r: any) => r.userId === user?.id) || {
        id: 99, userId: user?.id, companyId: 1, designation: 'Talent Acquisition', phone: ''
      };
      setRecruiter(currentRecruiter);

      // Load company profile
      const companies = JSON.parse(localStorage.getItem('sp_companies') || '[]');
      const myCompany = companies.find((c: any) => c.id === currentRecruiter.companyId) || {
        id: 1, name: 'Corporate Inc.', industry: 'Software'
      };
      setCompany(myCompany);

      setCompName(myCompany.name);
      setCompIndustry(myCompany.industry);
      setCompWebsite(myCompany.website || '');
      setCompLocation(myCompany.location || '');
      setCompDesc(myCompany.description || '');

      // Load Drives
      const allDrives = JSON.parse(localStorage.getItem('sp_drives') || '[]');
      const myDrives = allDrives.filter((d: any) => d.createdBy === currentRecruiter.id);
      setDrives(myDrives);

      // Load applicants
      const allApps = JSON.parse(localStorage.getItem('sp_applications') || '[]');
      const allStudents = JSON.parse(localStorage.getItem('sp_students') || '[]');
      
      const myApplicants = allApps.filter((app: any) => {
        const drive = allDrives.find((d: any) => d.id === app.jobDriveId);
        return drive && drive.createdBy === currentRecruiter.id;
      }).map((app: any) => ({
        ...app,
        student: allStudents.find((s: any) => s.id === app.studentId) || { fullName: 'External Student', cgpa: 8.0, branch: 'CSE' },
        jobDrive: allDrives.find((d: any) => d.id === app.jobDriveId)
      }));
      setApplicants(myApplicants);

      // Calculate simulated analytics
      const totalApplied = myApplicants.length;
      const shortlisted = myApplicants.filter((a: any) => a.status === 'SHORTLISTED').length;
      const selected = myApplicants.filter((a: any) => a.status === 'SELECTED').length;
      const rejected = myApplicants.filter((a: any) => a.status === 'REJECTED').length;

      const allInterviews = JSON.parse(localStorage.getItem('sp_interviews') || '[]');
      const scheduledInt = allInterviews.filter((i: any) => i.recruiterId === currentRecruiter.id).length;

      setAnalytics({
        totalDrives: myDrives.length,
        totalApplications: totalApplied,
        shortlistedCount: shortlisted,
        selectedCount: selected,
        rejectedCount: rejected,
        interviewsScheduledCount: scheduledInt,
        recentApplicants: myApplicants.slice(0, 5)
      });

      setLoading(false);
    } else {
      try {
        const headers = { 'Authorization': `Bearer ${user?.token}` };
        
        const profileRes = await fetch(`${API_BASE}/recruiters/me`, { headers });
        const profile = await profileRes.json();
        setRecruiter(profile);
        setCompany(profile.company);

        setCompName(profile.company.name);
        setCompIndustry(profile.company.industry);
        setCompWebsite(profile.company.website || '');
        setCompLocation(profile.company.location || '');
        setCompDesc(profile.company.description || '');

        const drivesRes = await fetch(`${API_BASE}/recruiters/drives`, { headers });
        const drivesData = await drivesRes.json();
        setDrives(drivesData);

        // Fetch candidates by calling drives
        const allCandidates: any[] = [];
        for (const drive of drivesData) {
          const appRes = await fetch(`${API_BASE}/recruiters/drives/${drive.id}/applications`, { headers });
          const appData = await appRes.json();
          allCandidates.push(...appData);
        }
        setApplicants(allCandidates);

        const analyticsRes = await fetch(`${API_BASE}/recruiters/analytics`, { headers });
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      } catch (err) {
        console.error("API error loading recruiter: ", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isOfflineMode]);

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOfflineMode) {
      const companies = JSON.parse(localStorage.getItem('sp_companies') || '[]');
      const idx = companies.findIndex((c: any) => c.id === recruiter.companyId);
      
      const updated = {
        ...companies[idx],
        name: compName,
        industry: compIndustry,
        website: compWebsite,
        location: compLocation,
        description: compDesc
      };

      companies[idx] = updated;
      localStorage.setItem('sp_companies', JSON.stringify(companies));
      fetchData();
      alert("Company profile updated locally!");
    } else {
      try {
        const response = await fetch(`${API_BASE}/recruiters/company`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            name: compName,
            industry: compIndustry,
            website: compWebsite,
            location: compLocation,
            description: compDesc
          })
        });
        if (response.ok) {
          fetchData();
          alert("Company profile updated successfully!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOfflineMode) {
      const allDrives = JSON.parse(localStorage.getItem('sp_drives') || '[]');
      const newDrive = {
        id: allDrives.length + 1,
        companyId: company.id,
        title: driveTitle,
        description: driveDesc,
        roleType: driveRoleType,
        packageLpa: parseFloat(drivePkg),
        eligibilityCgpa: parseFloat(driveCgpa),
        eligibilityBranch: driveBranch,
        requiredSkills: driveSkills,
        driveDate: driveDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'ACTIVE',
        createdBy: recruiter.id
      };

      allDrives.push(newDrive);
      localStorage.setItem('sp_drives', JSON.stringify(allDrives));
      
      // Clear form
      setDriveTitle('');
      setDriveDesc('');
      setDrivePkg('12.0');
      setDriveCgpa('8.0');
      
      fetchData();
      alert("Placement Drive created locally!");
    } else {
      try {
        const response = await fetch(`${API_BASE}/recruiters/drives`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            title: driveTitle,
            description: driveDesc,
            roleType: driveRoleType,
            packageLpa: parseFloat(drivePkg),
            eligibilityCgpa: parseFloat(driveCgpa),
            eligibilityBranch: driveBranch,
            requiredSkills: driveSkills,
            driveDate: driveDate
          })
        });
        if (response.ok) {
          setDriveTitle('');
          setDriveDesc('');
          fetchData();
          alert("Placement Drive created!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatusChange = async (appId: number, status: 'SHORTLISTED' | 'SELECTED' | 'REJECTED') => {
    if (isOfflineMode) {
      const allApps = JSON.parse(localStorage.getItem('sp_applications') || '[]');
      const idx = allApps.findIndex((a: any) => a.id === appId);
      
      allApps[idx].status = status;
      localStorage.setItem('sp_applications', JSON.stringify(allApps));

      // Notification
      const allNotifs = JSON.parse(localStorage.getItem('sp_notifications') || '[]');
      const applicantStudent = applicants.find(a => a.id === appId);
      allNotifs.push({
        id: allNotifs.length + 1,
        userId: applicantStudent.student.userId,
        message: `Your application status for ${applicantStudent.jobDrive.title} has been updated to: ${status}.`,
        type: 'APPLICATION',
        readStatus: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('sp_notifications', JSON.stringify(allNotifs));

      fetchData();
      alert(`Application marked as ${status}`);
    } else {
      try {
        const response = await fetch(`${API_BASE}/recruiters/applications/${appId}/status?status=${status}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        if (response.ok) {
          fetchData();
          alert(`Application status updated to ${status}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !interviewTime) return;

    if (isOfflineMode) {
      const allInterviews = JSON.parse(localStorage.getItem('sp_interviews') || '[]');
      const newInterview = {
        id: allInterviews.length + 1,
        applicationId: selectedAppId,
        recruiterId: recruiter.id,
        scheduledTime: new Date(interviewTime).toISOString(),
        durationMinutes: parseInt(interviewDuration),
        mode: interviewMode,
        venueLink: interviewLink,
        status: 'SCHEDULED'
      };

      allInterviews.push(newInterview);
      localStorage.setItem('sp_interviews', JSON.stringify(allInterviews));

      // Auto shortlist applicant
      const allApps = JSON.parse(localStorage.getItem('sp_applications') || '[]');
      const appIdx = allApps.findIndex((a: any) => a.id === selectedAppId);
      if (allApps[appIdx].status === 'APPLIED') {
        allApps[appIdx].status = 'SHORTLISTED';
        localStorage.setItem('sp_applications', JSON.stringify(allApps));
      }

      // Notification to student
      const allNotifs = JSON.parse(localStorage.getItem('sp_notifications') || '[]');
      const applicantStudent = applicants.find(a => a.id === selectedAppId);
      allNotifs.push({
        id: allNotifs.length + 1,
        userId: applicantStudent.student.userId,
        message: `Interview scheduled for ${applicantStudent.jobDrive.title} on ${new Date(interviewTime).toLocaleString()}. Mode: ${interviewMode}`,
        type: 'INTERVIEW',
        readStatus: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('sp_notifications', JSON.stringify(allNotifs));

      setScheduleSuccess('Interview scheduled successfully!');
      setSelectedAppId(null);
      setInterviewTime('');
      fetchData();
      setTimeout(() => setScheduleSuccess(''), 3000);
    } else {
      try {
        const response = await fetch(`${API_BASE}/recruiters/interviews/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            applicationId: selectedAppId,
            scheduledTime: interviewTime,
            durationMinutes: parseInt(interviewDuration),
            mode: interviewMode,
            venueLink: interviewLink
          })
        });
        if (response.ok) {
          setScheduleSuccess('Interview scheduled!');
          setSelectedAppId(null);
          fetchData();
          setTimeout(() => setScheduleSuccess(''), 3000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredApplicants = selectedDriveFilter === 'all' 
    ? applicants 
    : applicants.filter(a => a.jobDriveId === selectedDriveFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050209] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <span className="font-display font-medium text-sm">Synchronizing recruiter console...</span>
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
              <Building className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate">{company?.name} Hub</span>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'analytics', label: 'Hiring Funnel' },
              { id: 'drives', label: 'Placement Drives', count: drives.length },
              { id: 'candidates', label: 'Screen Applicants', count: applicants.length, countColor: 'emerald' },
              { id: 'company', label: 'Corporate Profile' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeSubTab === tab.id 
                    ? 'bg-gradient-to-r from-violet-650/80 to-fuchsia-600/80 text-white shadow shadow-violet-500/10' 
                    : 'text-slate-400 hover:bg-violet-950/20 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    tab.countColor === 'emerald' 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-violet-950/20 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-650 to-fuchsia-500 flex items-center justify-center font-bold text-sm text-white shadow shadow-violet-500/10">
              {company?.name ? company.name.charAt(0) : 'R'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">{recruiter?.designation}</p>
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
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">{company?.name} Placement Hub</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Logged in as {recruiter?.designation}. Database mode: {isOfflineMode ? 'Cognitive Local Sandbox' : 'Production API Server'}.
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

        {/* HIRING FUNNEL TAB */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { label: 'OPEN DRIVES', val: analytics.totalDrives, icon: Briefcase, color: 'from-violet-650/10 to-fuchsia-600/10 border-violet-500/20 text-violet-400' },
                { label: 'APPLICANTS', val: analytics.totalApplications, icon: Users, color: 'from-cyan-600/10 to-blue-600/10 border-cyan-500/20 text-cyan-400' },
                { label: 'SHORTLISTED', val: analytics.shortlistedCount, icon: Clock, color: 'from-amber-600/10 to-orange-600/10 border-amber-500/20 text-amber-400' },
                { label: 'TOTAL HIRED', val: analytics.selectedCount, icon: UserCheck, color: 'from-emerald-600/10 to-teal-600/10 border-emerald-500/20 text-emerald-400' }
              ].map((kpi, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${kpi.color} border rounded-2xl p-5 hover-glow hover-lift`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{kpi.label}</span>
                      <span className="text-3xl font-black text-white mt-1.5 block font-display">{kpi.val}</span>
                    </div>
                    <div className="h-10 w-10 bg-slate-950/50 rounded-xl flex items-center justify-center">
                      <kpi.icon className="h-5.5 w-5.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pipeline analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="glass rounded-3xl p-6 border-violet-500/15 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-30%] w-60 h-60 rounded-full bg-violet-650/5 blur-[80px]" />
                
                <div>
                  <h3 className="text-sm font-bold text-white mb-2 font-display">Conversion Metrics</h3>
                  <p className="text-[11px] text-slate-400 leading-normal font-medium">Recruitment conversion rates across screen stages and offer releases.</p>
                </div>

                <div className="my-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Screening Conversion</span>
                      <span className="text-white font-bold">{analytics.totalApplications > 0 ? Math.round((analytics.shortlistedCount / analytics.totalApplications) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-[#0a0515] h-2 rounded-full overflow-hidden border border-violet-950/30">
                      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full" style={{ width: `${analytics.totalApplications > 0 ? (analytics.shortlistedCount / analytics.totalApplications) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Offer Select Ratio</span>
                      <span className="text-white font-bold">{analytics.shortlistedCount > 0 ? Math.round((analytics.selectedCount / analytics.shortlistedCount) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-[#0a0515] h-2 rounded-full overflow-hidden border border-violet-950/30">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full" style={{ width: `${analytics.shortlistedCount > 0 ? (analytics.selectedCount / analytics.shortlistedCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-violet-950/40 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Scheduled Interviews</span>
                  <span className="text-violet-300 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{analytics.interviewsScheduledCount} sessions</span>
                </div>
              </div>

              {/* Recent Applicants timeline */}
              <div className="glass rounded-3xl p-6 border-violet-500/15 lg:col-span-2 shadow-2xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white mb-4 font-display">Candidate Pipeline Timeline</h3>
                <div className="space-y-3">
                  {analytics.recentApplicants.length === 0 ? (
                    <p className="text-xs text-slate-550 py-8 text-center border border-dashed border-violet-950/30 rounded-2xl">No candidate applications received yet.</p>
                  ) : (
                    analytics.recentApplicants.map((app: any) => (
                      <div key={app.id || app.applicationId} className="p-3 bg-[#0d071b]/80 border border-violet-500/10 rounded-2xl flex items-center justify-between hover:border-violet-500/30 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-white">{app.student?.fullName || app.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{app.branch || 'CSE'} branch • CGPA: {app.cgpa}</p>
                          <p className="text-[9px] text-violet-350 mt-1 font-semibold">Drive: {app.jobDrive?.title || app.driveTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            app.status === 'SELECTED' ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' :
                            app.status === 'SHORTLISTED' ? 'bg-violet-500/15 border border-violet-500/20 text-violet-400' :
                            app.status === 'REJECTED' ? 'bg-red-500/15 border border-red-500/20 text-red-400' : 'bg-slate-850 text-slate-450'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-[10px] text-white block mt-1.5 font-black">AI Match: {app.matchScore}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* PLACEMENT DRIVES TAB */}
        {activeSubTab === 'drives' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Job drive form */}
            <form onSubmit={handleCreateDrive} className="lg:col-span-2 glass rounded-3xl p-6 border-violet-500/15 space-y-4 shadow-2xl relative">
              <h3 className="text-md font-bold text-white mb-3 font-display">Create Placement Drive</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={driveTitle}
                    onChange={(e) => setDriveTitle(e.target.value)}
                    className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Role Type</label>
                  <select
                    value={driveRoleType}
                    onChange={(e) => setDriveRoleType(e.target.value)}
                    className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Full-time">Full-time Position</option>
                    <option value="Internship">Summer Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">LPA package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={drivePkg}
                    onChange={(e) => setDrivePkg(e.target.value)}
                    className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Minimum CGPA Criteria</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={driveCgpa}
                    onChange={(e) => setDriveCgpa(e.target.value)}
                    className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Eligible Branches (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="CSE, ECE"
                    value={driveBranch}
                    onChange={(e) => setDriveBranch(e.target.value)}
                    className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Drive Date</label>
                  <input
                    type="date"
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Java, React, SQL"
                  value={driveSkills}
                  onChange={(e) => setDriveSkills(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Description details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Duties, technologies, role parameters..."
                  value={driveDesc}
                  onChange={(e) => setDriveDesc(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button type="submit" className="px-5 py-3 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow shadow-violet-500/10 flex items-center gap-1.5 cursor-pointer">
                <Plus className="h-4.5 w-4.5" /> Publish Placement Drive
              </button>
            </form>

            {/* List current drives */}
            <div className="glass rounded-3xl p-6 border-violet-500/15 space-y-4 shadow-2xl h-fit">
              <h3 className="text-sm font-bold text-white border-b border-violet-950/30 pb-2 font-display">Active Campaigns</h3>
              <div className="space-y-3.5">
                {drives.length === 0 ? (
                  <p className="text-xs text-slate-550 py-4 text-center">No drives created yet.</p>
                ) : (
                  drives.map(drive => (
                    <div key={drive.id} className="p-4 bg-[#0d071b]/80 border border-violet-500/10 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-white">{drive.title}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Package: {drive.packageLpa} LPA • CGPA: {drive.eligibilityCgpa}</p>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black border border-emerald-500/20 uppercase tracking-wider">{drive.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* SCREEN CANDIDATES TAB */}
        {activeSubTab === 'candidates' && (
          <div className="space-y-6">
            
            {/* Drive Filter dropdown */}
            <div className="glass rounded-2xl p-4 border-violet-500/15 flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-bold text-white font-display">Applicant Segment:</span>
              </div>
              <select
                value={selectedDriveFilter}
                onChange={(e) => setSelectedDriveFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2 text-xs text-white cursor-pointer focus:outline-none"
              >
                <option value="all">All Placement Drives ({applicants.length})</option>
                {drives.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            {/* Candidate List Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Screening list */}
              <div className="lg:col-span-2 space-y-4">
                {filteredApplicants.length === 0 ? (
                  <p className="text-xs text-slate-555 py-12 text-center border border-dashed border-violet-955/20 rounded-3xl bg-[#090514]/60">No applications open in this segment.</p>
                ) : (
                  filteredApplicants.map(app => (
                    <div key={app.id} className="p-6 glass border-violet-500/10 rounded-3xl space-y-5 hover-glow shadow-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-bold text-white font-display">{app.student?.fullName}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-1">Branch: {app.student?.branch} • CGPA: <span className="text-white">{app.student?.cgpa}</span></p>
                          <p className="text-[10px] text-violet-300 font-bold mt-1.5 uppercase tracking-wider">Role: {app.jobDrive?.title}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            app.status === 'SELECTED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                            app.status === 'SHORTLISTED' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' :
                            app.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-850 border-slate-800 text-slate-455'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-xs font-black block mt-2.5 text-white">AI Overlap: {app.matchScore}%</span>
                        </div>
                      </div>

                      {/* Display projects/skills summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#0a0515]/60 p-4 rounded-2xl border border-violet-500/10">
                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Student Skills stack</span>
                          <div className="flex flex-wrap gap-1.5">
                            {app.student?.skills ? app.student.skills.split(',').map((sk: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-violet-950/20 border border-violet-500/10 text-violet-300 text-[9px] font-semibold">
                                {sk.trim()}
                              </span>
                            )) : 'No skills listed'}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">AI Matching Insights</span>
                          <p className="text-[10px] text-slate-450 leading-relaxed">{app.aiFeedback}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-violet-950/20 pt-4 text-xs">
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1 font-bold">
                          <FileText className="h-4 w-4" /> Download Resume <ExternalLink className="h-3 w-3" />
                        </a>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(app.id, 'REJECTED')}
                            disabled={app.status === 'REJECTED'}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold border border-red-550/20 disabled:opacity-40 cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'SELECTED')}
                            disabled={app.status === 'SELECTED'}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-550/20 disabled:opacity-40 cursor-pointer"
                          >
                            Hired Offer
                          </button>
                          <button
                            onClick={() => { setSelectedAppId(app.id); }}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-white font-bold cursor-pointer"
                          >
                            Schedule Interview
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* Interview scheduler card */}
              <div className="glass rounded-3xl p-6 border-violet-500/15 h-fit shadow-2xl">
                <h3 className="text-sm font-bold text-white mb-1.5 flex items-center gap-1.5 font-display"><Calendar className="h-4.5 w-4.5 text-violet-400" /> Session Scheduler</h3>
                <p className="text-xs text-slate-450 mb-5">Select candidate to write assessment details.</p>
                
                {scheduleSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs mb-4">
                    {scheduleSuccess}
                  </div>
                )}

                {selectedAppId ? (
                  <form onSubmit={handleScheduleInterview} className="space-y-4">
                    <div className="p-3 bg-[#0a0515]/65 rounded-xl border border-violet-500/10 text-xs">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Target Applicant</span>
                      <span className="text-white block font-bold mt-1">Application ID: #{selectedAppId}</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Scheduled time</label>
                      <input
                        type="datetime-local"
                        required
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Duration (Mins)</label>
                      <select
                        value={interviewDuration}
                        onChange={(e) => setInterviewDuration(e.target.value)}
                        className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none"
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Interview Mode</label>
                      <select
                        value={interviewMode}
                        onChange={(e) => setInterviewMode(e.target.value)}
                        className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer focus:outline-none"
                      >
                        <option value="ONLINE">Online Video meeting</option>
                        <option value="IN_PERSON">In-Person Office visit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Venue / Meeting URL</label>
                      <input
                        type="text"
                        required
                        value={interviewLink}
                        onChange={(e) => setInterviewLink(e.target.value)}
                        className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setSelectedAppId(null)} 
                        className="flex-1 py-2.5 bg-[#0a0515]/60 hover:bg-[#0a0515]/90 border border-violet-500/10 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-2.5 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                      >
                        Confirm Session
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-violet-500/20 rounded-2xl bg-[#0a0515]/20">
                    Click "Schedule Interview" next to a candidate in the pipeline to begin setup.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* COMPANY PROFILE TAB */}
        {activeSubTab === 'company' && (
          <form onSubmit={handleUpdateCompany} className="glass rounded-3xl p-6 border-violet-500/15 space-y-5 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 border-b border-violet-950/30 pb-3 font-display">Manage Company Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Industry sector</label>
                <input
                  type="text"
                  required
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Corporate Website</label>
                <input
                  type="text"
                  value={compWebsite}
                  placeholder="https://example.com"
                  onChange={(e) => setCompWebsite(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Headquarters location</label>
                <input
                  type="text"
                  value={compLocation}
                  placeholder="San Francisco, CA"
                  onChange={(e) => setCompLocation(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Company Profile Description</label>
              <textarea
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                rows={4}
                placeholder="Details presented to prospective student applicants..."
                className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <button type="submit" className="px-5 py-3 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow cursor-pointer">
              Update Profile Details
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
