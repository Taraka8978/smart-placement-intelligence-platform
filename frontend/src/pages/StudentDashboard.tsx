import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Award, Sparkles, BookOpen, AlertCircle, FileText, 
  CheckCircle, ChevronRight, Bell, Calendar, MapPin, Brain, 
  ExternalLink, UploadCloud, RefreshCw, Send, Trash2, Plus
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, logout, isOfflineMode } = useAuth();
  
  // States
  const [student, setStudent] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'profile' | 'analyzer' | 'jobs' | 'applications'>('overview');

  // Form Editing States
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [cgpa, setCgpa] = useState(8.0);
  const [gradYear, setGradYear] = useState(2026);
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  
  // Project / Cert additions
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');

  // Resume Upload State
  const [resumeText, setResumeText] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [extractionLogs, setExtractionLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'txt' || ext === 'docx') {
        setSelectedFile(file);
        setUploadSuccess('');
        setExtractionLogs([]);
      } else {
        alert("Please upload a PDF, TXT, or DOCX file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadSuccess('');
      setExtractionLogs([]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setExtractionLogs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const API_BASE = 'http://localhost:8888/api/v1';

  const fetchData = async () => {
    setLoading(true);
    if (isOfflineMode) {
      // Offline Simulated Data load
      const allStudents = JSON.parse(localStorage.getItem('sp_students') || '[]');
      const currentStudent = allStudents.find((s: any) => s.userId === user?.id) || {
        id: 99, userId: user?.id, fullName: user?.username, cgpa: 8.5, branch: 'CSE', graduationYear: 2026, skills: 'Java', projects: '[]', certifications: '[]', bio: '', placementReadinessScore: 50
      };
      setStudent(currentStudent);
      
      // Load form details
      setFullName(currentStudent.fullName);
      setBranch(currentStudent.branch);
      setCgpa(currentStudent.cgpa);
      setGradYear(currentStudent.graduationYear);
      setSkills(currentStudent.skills);
      setBio(currentStudent.bio || '');
      setProjects(JSON.parse(currentStudent.projects || '[]'));
      setCerts(JSON.parse(currentStudent.certifications || '[]'));

      // Drives & Apps
      const allDrives = JSON.parse(localStorage.getItem('sp_drives') || '[]');
      const allCompanies = JSON.parse(localStorage.getItem('sp_companies') || '[]');
      
      // Map companies to drives
      const mappedDrives = allDrives.map((d: any) => ({
        ...d,
        company: allCompanies.find((c: any) => c.id === d.companyId) || { name: 'External Inc.' }
      }));
      setDrives(mappedDrives);

      const allApps = JSON.parse(localStorage.getItem('sp_applications') || '[]');
      const myApps = allApps.filter((a: any) => a.studentId === currentStudent.id).map((a: any) => ({
        ...a,
        jobDrive: mappedDrives.find((d: any) => d.id === a.jobDriveId) || { title: 'Unknown Role', company: { name: 'Unknown' } }
      }));
      setApplications(myApps);

      const allInterviews = JSON.parse(localStorage.getItem('sp_interviews') || '[]');
      const myInterviews = allInterviews.filter((i: any) => {
        const app = myApps.find((a: any) => a.id === i.applicationId);
        return app !== undefined;
      }).map((i: any) => ({
        ...i,
        application: myApps.find((a: any) => a.id === i.applicationId)
      }));
      setInterviews(myInterviews);

      const allNotifs = JSON.parse(localStorage.getItem('sp_notifications') || '[]');
      setNotifications(allNotifs.filter((n: any) => n.userId === user?.id));

      // Calculate simple mock recommendations
      calculateMockRecommendations(currentStudent, mappedDrives);
      setLoading(false);
    } else {
      // API Production load
      try {
        const headers = { 'Authorization': `Bearer ${user?.token}` };
        
        const profileRes = await fetch(`${API_BASE}/students/me`, { headers });
        const profile = await profileRes.json();
        setStudent(profile);
        
        setFullName(profile.fullName);
        setBranch(profile.branch);
        setCgpa(profile.cgpa);
        setGradYear(profile.graduationYear);
        setSkills(profile.skills);
        setBio(profile.bio || '');
        setProjects(JSON.parse(profile.projects || '[]'));
        setCerts(JSON.parse(profile.certifications || '[]'));

        const drivesRes = await fetch(`${API_BASE}/students/drives`, { headers });
        const drivesData = await drivesRes.json();
        setDrives(drivesData);

        const appsRes = await fetch(`${API_BASE}/students/me/applications`, { headers });
        const appsData = await appsRes.json();
        setApplications(appsData);

        const interviewsRes = await fetch(`${API_BASE}/students/me/interviews`, { headers });
        const interviewsData = await interviewsRes.json();
        setInterviews(interviewsData);

        const notifsRes = await fetch(`${API_BASE}/students/me/notifications`, { headers });
        const notifsData = await notifsRes.json();
        setNotifications(notifsData);

        const recRes = await fetch(`${API_BASE}/students/me/recommendations`, { headers });
        const recData = await recRes.json();
        setRecommendations(recData);
      } catch (err) {
        console.error("API error loading data: ", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isOfflineMode]);

  const calculateMockRecommendations = (currentStudent: any, drivesList: any[]) => {
    const studentSkillsArr = currentStudent.skills.split(',').map((s: string) => s.trim().toLowerCase());
    const recs = drivesList.map((drive: any) => {
      const driveSkillsArr = drive.requiredSkills.split(',').map((s: string) => s.trim().toLowerCase());
      const overlap = driveSkillsArr.filter((s: string) => studentSkillsArr.includes(s));
      const matchScore = driveSkillsArr.length > 0 ? Math.round((overlap.length / driveSkillsArr.length) * 70 + (currentStudent.cgpa >= drive.eligibilityCgpa ? 30 : 10)) : 80;
      
      const gap = driveSkillsArr.filter((s: string) => !studentSkillsArr.includes(s));
      
      return {
        drive: drive,
        matchScore: Math.min(100, matchScore),
        missingSkills: gap,
        probability: Math.min(98, Math.max(30, matchScore - 5))
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
    setRecommendations(recs);
  };

  const handleApply = async (driveId: number) => {
    if (isOfflineMode) {
      const allApps = JSON.parse(localStorage.getItem('sp_applications') || '[]');
      
      // Check already applied
      if (allApps.some((a: any) => a.jobDriveId === driveId && a.studentId === student.id)) {
        alert("Already applied!");
        return;
      }

      const matchingDrive = drives.find(d => d.id === driveId);
      const studentSkillsArr = student.skills.split(',').map((s: string) => s.trim().toLowerCase());
      const driveSkillsArr = matchingDrive.requiredSkills.split(',').map((s: string) => s.trim().toLowerCase());
      const overlap = driveSkillsArr.filter((s: string) => studentSkillsArr.includes(s));
      const matchScore = driveSkillsArr.length > 0 ? Math.round((overlap.length / driveSkillsArr.length) * 70 + (student.cgpa >= matchingDrive.eligibilityCgpa ? 30 : 15)) : 85;

      const gap = driveSkillsArr.filter((s: string) => !studentSkillsArr.includes(s));
      let aiFeedback = `Profile matches ${matchScore}% of criteria.`;
      if (gap.length > 0) {
        aiFeedback += ` Missing skills suggested to study: ${gap.join(', ')}`;
      }

      const newApp = {
        id: allApps.length + 1,
        jobDriveId: driveId,
        studentId: student.id,
        resumeUrl: student.resumeUrl || 'MockProfileResume',
        appliedDate: new Date().toISOString(),
        status: 'APPLIED',
        matchScore: matchScore,
        aiFeedback: aiFeedback
      };

      allApps.push(newApp);
      localStorage.setItem('sp_applications', JSON.stringify(allApps));

      // Add student notification
      const allNotifs = JSON.parse(localStorage.getItem('sp_notifications') || '[]');
      allNotifs.push({
        id: allNotifs.length + 1,
        userId: user?.id,
        message: `Successfully applied for ${matchingDrive.title} at ${matchingDrive.company.name}. AI match: ${matchScore}%`,
        type: 'APPLICATION',
        readStatus: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('sp_notifications', JSON.stringify(allNotifs));

      fetchData();
      alert("Application submitted successfully!");
    } else {
      try {
        const response = await fetch(`${API_BASE}/students/drives/${driveId}/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          }
        });
        if (response.ok) {
          fetchData();
          alert("Applied successfully!");
        } else {
          const errMsg = await response.text();
          alert("Application error: " + errMsg);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Heuristic readiness score calculation
    const skillsCount = skills.split(',').filter(s => s.trim().length > 0).length;
    const projectCount = projects.length;
    const certsCount = certs.length;
    const calculatedReadiness = Math.min(98, Math.max(30, Math.round((cgpa * 6.5) + (skillsCount * 1.8) + (projectCount * 5) + (certsCount * 4))));

    if (isOfflineMode) {
      const allStudents = JSON.parse(localStorage.getItem('sp_students') || '[]');
      const idx = allStudents.findIndex((s: any) => s.userId === user?.id);
      
      const updatedStudent = {
        ...allStudents[idx],
        fullName,
        branch,
        cgpa: parseFloat(cgpa.toString()),
        graduationYear: parseInt(gradYear.toString()),
        skills,
        bio,
        projects: JSON.stringify(projects),
        certifications: JSON.stringify(certs),
        placementReadinessScore: calculatedReadiness
      };

      allStudents[idx] = updatedStudent;
      localStorage.setItem('sp_students', JSON.stringify(allStudents));
      fetchData();
      alert("Profile updated locally!");
    } else {
      try {
        const response = await fetch(`${API_BASE}/students/me`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({
            fullName,
            branch,
            cgpa: parseFloat(cgpa.toString()),
            graduationYear: parseInt(gradYear.toString()),
            skills,
            bio,
            projects: JSON.stringify(projects),
            certifications: JSON.stringify(certs)
          })
        });
        if (response.ok) {
          fetchData();
          alert("Profile updated successfully!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddProject = () => {
    if (!newProjTitle) return;
    const updated = [...projects, { title: newProjTitle, tech: newProjTech, description: newProjDesc }];
    setProjects(updated);
    setNewProjTitle('');
    setNewProjTech('');
    setNewProjDesc('');
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (!newCertTitle) return;
    const updated = [...certs, { title: newCertTitle, issuer: newCertIssuer, date: newCertDate }];
    setCerts(updated);
    setNewCertTitle('');
    setNewCertIssuer('');
    setNewCertDate('');
  };

  const handleRemoveCert = (index: number) => {
    setCerts(certs.filter((_, i) => i !== index));
  };

  // Mock Resume AI analyzer parsing
  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText && !selectedFile) return;
    setUploadLoading(true);
    setUploadSuccess('');
    setExtractionLogs([]);

    if (isOfflineMode) {
      if (selectedFile) {
        setExtractionLogs(prev => [...prev, `[LOG] Loading binary stream of ${selectedFile.name}...`]);
        const isTxtFile = selectedFile.name.endsWith('.txt');

        setTimeout(() => {
          setExtractionLogs(prev => [...prev, `[LOG] Parsing file structure and layout divisions...`]);
        }, 300);

        setTimeout(() => {
          setExtractionLogs(prev => [...prev, `[LOG] Running NLP entity parser (extracting tech keywords)...`]);
        }, 700);

        setTimeout(() => {
          if (isTxtFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const text = event.target?.result as string;
              const skillsDict = [
                'Java', 'Spring Boot', 'React', 'TypeScript', 'MySQL', 'PostgreSQL', 
                'Python', 'Machine Learning', 'C++', 'Data Structures', 'Docker', 'Git',
                'Django', 'Flask', 'HTML', 'CSS', 'Tailwind CSS', 'AWS', 'GCP', 'Algorithms', 'System Design'
              ];
              const extracted: string[] = [];
              const textLower = text.toLowerCase();
              skillsDict.forEach(skill => {
                const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
                if (regex.test(textLower)) {
                  extracted.push(skill);
                }
              });

              if (extracted.length === 0) {
                extracted.push('Java', 'Git', 'Data Structures');
              }
              finalizeOfflineSkills(extracted);
            };
            reader.readAsText(selectedFile);
          } else {
            // PDF/DOCX simulated extraction matching branch
            let extracted: string[] = [];
            if (branch === 'CSE') {
              extracted = ['Java', 'Spring Boot', 'React', 'TypeScript', 'MySQL', 'Docker', 'Git', 'Data Structures', 'Algorithms'];
            } else if (branch === 'ECE') {
              extracted = ['C++', 'Data Structures', 'Git', 'System Design', 'HTML', 'CSS'];
            } else if (branch === 'EE') {
              extracted = ['Python', 'C++', 'Git', 'Data Structures', 'Algorithms'];
            } else {
              extracted = ['Python', 'Git', 'System Design'];
            }
            finalizeOfflineSkills(extracted);
          }
        }, 1200);
      } else {
        // Text-only mode simulation
        setExtractionLogs(prev => [...prev, `[LOG] Initializing raw text parser...`]);
        setTimeout(() => {
          setExtractionLogs(prev => [...prev, `[LOG] Checking text content boundaries...`]);
        }, 300);
        setTimeout(() => {
          setExtractionLogs(prev => [...prev, `[LOG] Matching skills dictionary tokens...`]);
        }, 750);
        setTimeout(() => {
          const skillsDict = [
            'Java', 'Spring Boot', 'React', 'TypeScript', 'MySQL', 'PostgreSQL', 
            'Python', 'Machine Learning', 'C++', 'Data Structures', 'Docker', 'Git',
            'Django', 'Flask', 'HTML', 'CSS', 'Tailwind CSS', 'AWS', 'GCP', 'Algorithms', 'System Design'
          ];
          const extracted: string[] = [];
          const textLower = resumeText.toLowerCase();
          skillsDict.forEach(skill => {
            if (textLower.includes(skill.toLowerCase())) {
              extracted.push(skill);
            }
          });

          if (extracted.length === 0) {
            extracted.push('Java', 'Git', 'Data Structures');
          }
          finalizeOfflineSkills(extracted);
        }, 1200);
      }
    } else {
      try {
        setExtractionLogs(prev => [...prev, "Uploading data to production API Server..."]);
        const formData = new FormData();
        if (selectedFile) {
          formData.append('file', selectedFile);
          setExtractionLogs(prev => [...prev, `Uploading file: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)...`]);
        }
        if (resumeText) {
          formData.append('resumeText', resumeText);
        }

        const response = await fetch(`${API_BASE}/students/me/resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setExtractionLogs(prev => [
            ...prev, 
            "Server successfully parsed file & mapped metadata.",
            "NLP processor matched skill tokens: " + data.extractedSkills.join(', ')
          ]);
          setUploadSuccess(`Resume analyzed! Extracted: ${data.extractedSkills.join(', ')}`);
          setResumeText('');
          setSelectedFile(null);
          fetchData();
        } else {
          const errMsg = await response.text();
          setExtractionLogs(prev => [...prev, "Error response from Server: " + errMsg]);
          alert("Resume parsing failed: " + errMsg);
        }
      } catch (err: any) {
        console.error(err);
        setExtractionLogs(prev => [...prev, "Network error: " + err.message]);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const finalizeOfflineSkills = (extracted: string[]) => {
    const newSkills = extracted.join(', ');
    const allStudents = JSON.parse(localStorage.getItem('sp_students') || '[]');
    const idx = allStudents.findIndex((s: any) => s.userId === user?.id);
    
    const skillsCount = extracted.length;
    const projectCount = projects.length;
    const certsCount = certs.length;
    const calculatedReadiness = Math.min(98, Math.max(30, Math.round((cgpa * 6.5) + (skillsCount * 1.8) + (projectCount * 5) + (certsCount * 4))));

    const updatedStudent = {
      ...allStudents[idx],
      skills: newSkills,
      placementReadinessScore: calculatedReadiness,
      resumeUrl: selectedFile ? `/resumes/student_${user?.id}_${selectedFile.name}` : `/resumes/student_${user?.id}_analyzed.pdf`
    };

    allStudents[idx] = updatedStudent;
    localStorage.setItem('sp_students', JSON.stringify(allStudents));

    const allNotifs = JSON.parse(localStorage.getItem('sp_notifications') || '[]');
    allNotifs.push({
      id: allNotifs.length + 1,
      userId: user?.id,
      message: `Resume analyzed successfully. Extracted skills: ${newSkills}`,
      type: 'SYSTEM',
      readStatus: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('sp_notifications', JSON.stringify(allNotifs));

    setExtractionLogs(prev => [
      ...prev,
      `[LOG] Completed profile strength extraction!`,
      `[LOG] Extracted skills: ${newSkills}`,
      `[LOG] New placement readiness: ${calculatedReadiness}%`
    ]);
    setUploadSuccess(`Resume analyzed! Extracted: ${newSkills}`);
    setResumeText('');
    setSelectedFile(null);
    setUploadLoading(false);
    fetchData();
  };

  const markNotifsRead = async () => {
    if (isOfflineMode) {
      const allNotifs = JSON.parse(localStorage.getItem('sp_notifications') || '[]');
      const updated = allNotifs.map((n: any) => n.userId === user?.id ? { ...n, readStatus: true } : n);
      localStorage.setItem('sp_notifications', JSON.stringify(updated));
      fetchData();
    } else {
      try {
        await fetch(`${API_BASE}/students/me/notifications/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user?.token}` }
        });
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050209] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
          <span className="font-display font-medium text-sm">Synchronizing student profile...</span>
        </div>
      </div>
    );
  }

  const unreadNotifs = notifications.filter(n => !n.readStatus).length;

  return (
    <div className="min-h-screen bg-[#050209] text-slate-100 flex font-sans">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#090514]/85 border-r border-violet-950/20 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-650 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Student Hub</span>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'overview', label: 'Console Overview' },
              { id: 'profile', label: 'Academic Profile' },
              { id: 'analyzer', label: 'AI Resume Analyzer' },
              { id: 'jobs', label: 'Placement Drives', count: drives.length },
              { id: 'applications', label: 'My Applications', count: applications.length, countColor: 'emerald' }
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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center font-bold text-sm text-white shadow shadow-violet-500/10">
              {student?.fullName ? student.fullName.charAt(0) : 'S'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{student?.fullName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">{student?.branch} • {student?.cgpa} CGPA</p>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen p-4 md:p-8 relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-violet-950/20 pb-5 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">Placement Control Room</h2>
            <p className="text-xs text-slate-400 mt-1">
              Welcome, {student?.fullName}. Network running on {isOfflineMode ? 'Cognitive Sandbox Engine' : 'Production API Server'}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Dropdown */}
            <div className="relative group">
              <button 
                onClick={markNotifsRead}
                className="h-10 w-10 rounded-xl bg-[#0c071b] border border-violet-500/10 flex items-center justify-center relative hover:border-violet-500/30 transition-colors cursor-pointer shadow-sm"
              >
                <Bell className="h-4.5 w-4.5 text-slate-300" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-[#050209]">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              <div className="absolute right-0 top-12 w-80 bg-[#0e071e] border border-violet-500/15 rounded-2xl p-4 shadow-2xl hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-250">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-white font-display">Inbox Notifications</span>
                  <button onClick={markNotifsRead} className="text-[10px] text-violet-400 hover:text-violet-300 font-bold hover:underline cursor-pointer">Mark all read</button>
                </div>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-slate-500 py-6 text-center">No alerts in your inbox.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl text-xs border transition-all ${n.readStatus ? 'bg-[#0a0515]/40 border-violet-950/20' : 'bg-violet-500/5 border-violet-500/20'}`}>
                        <p className="text-slate-300 leading-normal">{n.message}</p>
                        <span className="text-[9px] text-slate-500 mt-1.5 block font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="md:hidden px-3.5 py-2 bg-violet-950/20 hover:bg-violet-950/40 border border-violet-500/10 rounded-xl text-xs font-bold text-violet-300 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* --- Tab Content Switcher --- */}

        {/* OVERVIEW TAB */}
        {activeSubTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { label: 'CGPA SCORE', val: student?.cgpa, icon: BookOpen, color: 'from-violet-600/10 to-fuchsia-600/10 border-violet-500/20 text-violet-400' },
                { label: 'GRADUATION', val: student?.graduationYear, icon: Award, color: 'from-emerald-600/10 to-teal-600/10 border-emerald-500/20 text-emerald-400' },
                { label: 'APPLICATIONS', val: applications.length, icon: CheckCircle, color: 'from-fuchsia-600/10 to-pink-600/10 border-fuchsia-500/20 text-fuchsia-400' },
                { label: 'INTERVIEWS', val: interviews.filter(i => i.status === 'SCHEDULED').length, icon: Calendar, color: 'from-amber-600/10 to-orange-600/10 border-amber-500/20 text-amber-400' }
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

            {/* Middle Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Readiness Score Radial Gauge */}
              <div className="glass rounded-3xl p-6 border-violet-500/15 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-[-30%] left-[-30%] w-60 h-60 rounded-full bg-violet-650/5 blur-[80px]" />
                
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2 font-display"><Brain className="h-4.5 w-4.5 text-violet-400" /> Placement Readiness</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">Dynamic evaluation based on CGPA, skills density, projects and certifications.</p>
                </div>

                <div className="my-8 flex flex-col items-center justify-center">
                  <div className="relative h-32 w-32 flex items-center justify-center rounded-full bg-[#0a0515] border border-violet-500/10 glow-purple">
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent font-display">
                      {student?.placementReadinessScore}%
                    </span>
                    {/* Glowing outer progress bar */}
                    <div 
                      className="absolute inset-[-4px] rounded-full border-4 border-violet-500" 
                      style={{ clipPath: `polygon(50% 50%, -50% -50%, ${student?.placementReadinessScore}% -50%)`, transform: 'rotate(-90deg)' }}
                    />
                  </div>
                  <span className="mt-5 text-[10px] font-black uppercase tracking-widest text-violet-300 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                    {student?.placementReadinessScore >= 80 ? 'Elite Ready' : student?.placementReadinessScore >= 60 ? 'Competitive' : 'Developing Profile'}
                  </span>
                </div>

                <div className="border-t border-violet-950/40 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Skills Overlap</span>
                    <span className="text-white font-bold">{student?.skills ? student.skills.split(',').length : 0} tags</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Projects</span>
                    <span className="text-white font-bold">{projects.length} completed</span>
                  </div>
                </div>
              </div>

              {/* Recommended Jobs Panel */}
              <div className="lg:col-span-2 glass rounded-3xl p-6 border-violet-500/15 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-[-30%] right-[-30%] w-60 h-60 rounded-full bg-emerald-600/5 blur-[80px]" />

                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2 font-display"><Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" /> AI Cognitive Job Matches</h3>
                  <p className="text-[11px] text-slate-400">Targeted recruiter listings based on branch parameters and technical match ratios.</p>
                </div>

                <div className="my-5 space-y-3">
                  {recommendations.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-violet-950/30 rounded-2xl">No open recruiter drives match your profile filters.</p>
                  ) : (
                    recommendations.map(rec => (
                      <div key={rec.drive.id} className="p-4 bg-[#0d071b]/80 border border-violet-500/10 rounded-2xl flex items-center justify-between hover:border-violet-500/35 hover-glow transition-all">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-2">{rec.drive.title} 
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black border border-emerald-500/20">{rec.drive.roleType}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{rec.drive.company.name} • <span className="text-emerald-400">{rec.drive.packageLpa} LPA</span></p>
                          {rec.missingSkills.length > 0 && (
                            <p className="text-[9px] text-amber-500 mt-1 font-medium">Recommended study: {rec.missingSkills.slice(0, 2).join(', ')}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-sm font-black text-violet-400 block font-display">{rec.matchScore}%</span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">AI Match</span>
                          </div>
                          
                          <button
                            onClick={() => handleApply(rec.drive.id)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-white text-[10px] font-bold shadow-sm shadow-violet-500/20 cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button 
                  onClick={() => setActiveSubTab('jobs')}
                  className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center justify-end gap-1 cursor-pointer"
                >
                  Enter Placements Gateway <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Bottom Row: Upcoming interviews and Application timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Interview Timelines */}
              <div className="glass rounded-3xl p-6 border-violet-500/15">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-display"><Calendar className="h-4.5 w-4.5 text-amber-400" /> Upcoming Interview Pipeline</h3>
                <div className="space-y-3">
                  {interviews.filter(i => i.status === 'SCHEDULED').length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-violet-950/30 rounded-2xl">No upcoming interview sessions scheduled.</p>
                  ) : (
                    interviews.filter(i => i.status === 'SCHEDULED').map(i => (
                      <div key={i.id} className="p-4 bg-[#0d071b]/80 border border-violet-500/10 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-white">{i.application?.jobDrive?.title}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{i.application?.jobDrive?.company?.name}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider">{i.mode}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-violet-950/35 pt-2 text-[10px] text-slate-500">
                          <span className="font-semibold">{new Date(i.scheduledTime).toLocaleString()}</span>
                          <a href={i.venueLink} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1 font-bold">
                            Join Assessment <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Application Status Pipeline */}
              <div className="glass rounded-3xl p-6 border-violet-500/15">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 font-display"><CheckCircle className="h-4.5 w-4.5 text-emerald-400" /> Application Process Tracker</h3>
                <div className="space-y-3">
                  {applications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-violet-950/30 rounded-2xl">No applications logged in system.</p>
                  ) : (
                    applications.slice(0, 3).map(app => (
                      <div key={app.id} className="p-4 bg-[#0d071b]/80 border border-violet-500/10 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{app.jobDrive?.title}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{app.jobDrive?.company?.name}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide border ${
                          app.status === 'SELECTED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          app.status === 'SHORTLISTED' ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
                          app.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-850 border-slate-800 text-slate-450'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ACADEMIC PROFILE TAB */}
        {activeSubTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="glass rounded-3xl p-6 border-violet-500/15 space-y-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white border-b border-violet-950/30 pb-3 font-display">Manage Profile Particulars</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Branch Name</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white cursor-pointer focus:outline-none focus:border-violet-500"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="ME">Mechanical (ME)</option>
                  <option value="EE">Electrical (EE)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Current Cumulative CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cgpa}
                  onChange={(e) => setCgpa(parseFloat(e.target.value))}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Graduation Class Year</label>
                <input
                  type="number"
                  required
                  value={gradYear}
                  onChange={(e) => setGradYear(parseInt(e.target.value))}
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Professional Bio Statement</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of your professional goals..."
                className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Skills Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Java, React, TypeScript, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Academic Projects */}
            <div className="border-t border-violet-950/40 pt-5 mt-5">
              <h4 className="text-xs font-black uppercase text-violet-400 mb-4 tracking-wider flex items-center gap-2 font-display"><Sparkles className="h-4.5 w-4.5" /> Academic & Portfolio Projects</h4>
              <div className="space-y-2 mb-4">
                {projects.map((p, idx) => (
                  <div key={idx} className="p-4 bg-[#0a0515]/60 border border-violet-500/10 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{p.title}</p>
                      <p className="text-[10px] text-violet-400 mt-1">Stack: {p.tech}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveProject(idx)} className="text-red-450 hover:text-red-400 p-2 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"><Trash2 className="h-4.5 w-4.5" /></button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Tech Stack"
                  value={newProjTech}
                  onChange={(e) => setNewProjTech(e.target.value)}
                  className="bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Short description"
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="flex-1 bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <button type="button" onClick={handleAddProject} className="px-3 bg-violet-650 hover:bg-violet-600 rounded-xl text-xs font-bold text-white cursor-pointer"><Plus className="h-4.5 w-4.5" /></button>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="border-t border-violet-950/40 pt-5 mt-5">
              <h4 className="text-xs font-black uppercase text-emerald-450 mb-4 tracking-wider flex items-center gap-2 font-display"><Award className="h-4.5 w-4.5" /> Professional Certifications</h4>
              <div className="space-y-2 mb-4">
                {certs.map((c, idx) => (
                  <div key={idx} className="p-4 bg-[#0a0515]/60 border border-violet-500/10 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{c.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{c.issuer} • Issued {c.date}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveCert(idx)} className="text-red-450 hover:text-red-400 p-2 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"><Trash2 className="h-4.5 w-4.5" /></button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Certification Title"
                  value={newCertTitle}
                  onChange={(e) => setNewCertTitle(e.target.value)}
                  className="bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Issuer"
                  value={newCertIssuer}
                  onChange={(e) => setNewCertIssuer(e.target.value)}
                  className="bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newCertDate}
                    onChange={(e) => setNewCertDate(e.target.value)}
                    className="flex-1 bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none"
                  />
                  <button type="button" onClick={handleAddCert} className="px-3 bg-emerald-650 hover:bg-emerald-600 rounded-xl text-xs font-bold text-white cursor-pointer"><Plus className="h-4.5 w-4.5" /></button>
                </div>
              </div>
            </div>

            <button type="submit" className="px-5 py-3 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-xs uppercase tracking-widest font-black text-white rounded-xl shadow shadow-violet-500/10 cursor-pointer">
              Save Academic Details
            </button>
          </form>
        )}

        {/* AI RESUME ANALYZER TAB */}
        {activeSubTab === 'analyzer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleAnalyzeResume} className="lg:col-span-2 glass rounded-3xl p-6 border-violet-500/15 space-y-6 shadow-2xl relative">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 font-display">AI Cognitive Resume Analytics</h3>
                <p className="text-xs text-slate-400">Perform deep skill entity extraction and compute match probabilities against open placement drives.</p>
              </div>

              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-fuchsia-500 bg-violet-950/30 shadow-lg shadow-violet-500/10 scale-[0.99]' 
                    : 'border-violet-500/20 bg-[#0a0515]/60 hover:border-violet-500/40 hover:bg-[#0a0515]/80'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.txt,.docx" 
                  className="hidden" 
                />
                
                {selectedFile ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="h-12 w-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-3 shadow-inner">
                      <FileText className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-white max-w-xs truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">{(selectedFile.size / 1024).toFixed(1)} KB • Click icon to replace</p>
                    <button 
                      type="button" 
                      onClick={removeSelectedFile}
                      className="mt-4 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Clear File
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-11 w-11 text-violet-400 mb-3 animate-pulse" />
                    <p className="text-xs font-bold text-white">Drag & drop your PDF resume document here</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Auto parses structure, projects, and tech stacks (PDF, TXT, DOCX)</p>
                    <span className="mt-3 text-[9px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20 hover:bg-violet-500/20 transition-all">
                      Browse Files
                    </span>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 uppercase mb-2">Or paste raw resume text for extraction</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={8}
                  placeholder="Paste work experience summary, technical keywords, academic history, projects details..."
                  className="w-full bg-[#0a0515]/60 border border-violet-500/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 font-mono"
                />
              </div>

              {uploadSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" /> {uploadSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={uploadLoading || (!resumeText && !selectedFile)}
                className="px-5 py-3 bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-xs uppercase tracking-widest font-black text-white rounded-xl disabled:opacity-40 flex items-center gap-2 cursor-pointer"
              >
                {uploadLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Execute Skill Extractor
              </button>
            </form>

            <div className="glass rounded-3xl p-6 border-violet-500/15 space-y-5 shadow-2xl">
              <h3 className="text-sm font-bold text-white border-b border-violet-950/30 pb-2 font-display">Extraction Intelligence Log</h3>
              <div className="space-y-4">
                {extractionLogs.length > 0 && (
                  <div className="p-4 bg-[#050209] border border-violet-500/15 rounded-xl font-mono text-[10px] text-slate-350 space-y-1.5 max-h-48 overflow-y-auto shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-250">
                    <span className="text-violet-400 font-bold block mb-1">Live Extraction Process:</span>
                    {extractionLogs.map((log, index) => (
                      <div key={index} className="flex gap-1.5 items-start">
                        <span className="text-fuchsia-500 font-bold font-sans">›</span>
                        <span className="leading-relaxed">{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-[#0a0515]/60 border border-violet-500/10 rounded-xl text-xs">
                  <span className="text-slate-500 block uppercase text-[9px] font-black tracking-widest">Active Resume Path</span>
                  <span className="text-white font-bold block mt-1.5 truncate">{student?.resumeUrl || 'No resume uploaded yet.'}</span>
                </div>

                <div className="p-4 bg-[#0a0515]/60 border border-violet-500/10 rounded-xl text-xs">
                  <span className="text-slate-500 block uppercase text-[9px] font-black tracking-widest">Extracted Profile Tags</span>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {student?.skills ? student.skills.split(',').map((s: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded text-[9px] font-semibold">
                        {s.trim()}
                      </span>
                    )) : <span className="text-slate-500 text-[10px] italic">No skills registered yet.</span>}
                  </div>
                </div>

                <div className="p-4 bg-violet-950/15 border border-violet-900/25 rounded-xl text-xs text-violet-350">
                  <span className="font-bold block mb-1">Mapping capabilities</span>
                  <p className="text-[10px] leading-relaxed">NLP parser maps keywords directly to corporate drive constraints. Match score adjusts dynamically upon updates.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLACEMENT DRIVES TAB */}
        {activeSubTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white font-display">Active Campus Placements</h3>
              <span className="px-3 py-1 rounded-full bg-violet-950/30 border border-violet-500/15 text-[10px] font-black uppercase tracking-wider text-violet-300">{drives.length} drives active</span>
            </div>

            <div className="space-y-4">
              {drives.length === 0 ? (
                <p className="text-xs text-slate-500 py-12 text-center bg-[#090514]/60 border border-dashed border-violet-950/30 rounded-3xl">No drives published by recruiters yet.</p>
              ) : (
                drives.map(drive => {
                  const appliedApp = applications.find(a => a.jobDriveId === drive.id);
                  const isApplied = appliedApp !== undefined;
                  const eligibilityMet = student.cgpa >= drive.eligibilityCgpa;
                  
                  // Extract skills for match ratio
                  const studentSkillsArr = student.skills.split(',').map((s: string) => s.trim().toLowerCase());
                  const driveSkillsArr = drive.requiredSkills.split(',').map((s: string) => s.trim().toLowerCase());
                  const overlap = driveSkillsArr.filter((s: string) => studentSkillsArr.includes(s));
                  const matchScore = driveSkillsArr.length > 0 ? Math.round((overlap.length / driveSkillsArr.length) * 70 + (eligibilityMet ? 30 : 10)) : 80;

                  return (
                    <div key={drive.id} className="p-6 glass border-violet-500/10 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover-glow shadow-xl relative overflow-hidden">
                      <div className="space-y-3 max-w-xl z-10">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-white font-display">{drive.title}</h4>
                          <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[8px] font-black rounded-full uppercase tracking-wider">{drive.roleType}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400">{drive.company?.name} • Package: <span className="text-emerald-400 font-extrabold">{drive.packageLpa} LPA</span></p>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">{drive.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold"><BookOpen className="h-3.5 w-3.5" /> Eligible CGPA: {drive.eligibilityCgpa}+</span>
                          <span className="flex items-center gap-1 font-semibold"><User className="h-3.5 w-3.5" /> Branches: {drive.eligibilityBranch}</span>
                          <span className="flex items-center gap-1 font-semibold"><Calendar className="h-3.5 w-3.5" /> Date: {drive.driveDate}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {drive.requiredSkills.split(',').map((skill: string, idx: number) => (
                            <span key={idx} className={`px-2.5 py-0.5 rounded-full text-[9px] border ${
                              studentSkillsArr.includes(skill.trim().toLowerCase()) 
                                ? 'bg-violet-500/15 border-violet-500/35 text-violet-300 font-semibold' 
                                : 'bg-[#0a0515]/60 border-violet-950/20 text-slate-550'
                            }`}>
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-violet-950/30 pt-4 md:pt-0 z-10">
                        <div className="text-left md:text-right">
                          <span className="text-3xl font-black text-white font-display block">{matchScore}%</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black block">Resume Overlap</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {!eligibilityMet && (
                            <div className="group relative">
                              <AlertCircle className="h-5 w-5 text-red-500 cursor-pointer" />
                              <span className="absolute bottom-8 right-0 bg-[#16060c] border border-red-800 p-2.5 rounded-xl text-[10px] w-48 text-red-400 hidden group-hover:block z-50">
                                CGPA eligibility criteria not met ({student.cgpa} vs {drive.eligibilityCgpa} required).
                              </span>
                            </div>
                          )}

                          <button
                            onClick={() => handleApply(drive.id)}
                            disabled={isApplied || !eligibilityMet}
                            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isApplied 
                                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                                : !eligibilityMet 
                                ? 'bg-[#0e071b] border border-violet-950/25 text-slate-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-650 to-fuchsia-600 hover:brightness-110 text-white shadow shadow-violet-500/20'
                            }`}
                          >
                            {isApplied ? `Applied (${appliedApp?.status})` : 'Submit Application'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeSubTab === 'applications' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white font-display">My Submitted Applications</h3>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-xs text-slate-500 py-12 text-center bg-[#090514]/60 border border-dashed border-violet-950/30 rounded-3xl">No applications recorded in the system.</p>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="p-5 glass border-violet-500/10 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-bold text-white font-display">{app.jobDrive?.title}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-1">{app.jobDrive?.company?.name} • Package: {app.jobDrive?.packageLpa} LPA</p>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase border ${
                          app.status === 'SELECTED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          app.status === 'SHORTLISTED' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' :
                          app.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-850 border-slate-800 text-slate-450'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-2 font-medium">Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="bg-[#0a0515]/60 p-4 rounded-2xl border border-violet-500/10 text-xs">
                      <span className="text-[9px] font-black text-violet-450 uppercase tracking-widest block mb-1.5">Cognitive AI Overlap Analysis</span>
                      <p className="text-slate-300 font-mono leading-relaxed text-[11px]">{app.aiFeedback}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
