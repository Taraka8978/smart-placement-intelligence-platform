import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  id: number;
  username: string;
  email: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  token: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isOfflineMode: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: any) => Promise<boolean>;
  setOfflineMode: (offline: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8888/api/v1'; // standard server fallback check, we can try both 8080 and 8888

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Simulated Database for Offline Mode
  const initializeMockDb = () => {
    if (!localStorage.getItem('sp_users')) {
      const mockUsers = [
        { id: 1, username: 'admin', email: 'admin@placement.edu', password: 'password', role: 'ADMIN' },
        { id: 2, username: 'google_hr', email: 'google.hr@google.com', password: 'password', role: 'RECRUITER', companyId: 1 },
        { id: 3, username: 'msft_hr', email: 'msft.hr@microsoft.com', password: 'password', role: 'RECRUITER', companyId: 2 },
        { id: 4, username: 'student1', email: 'tarak.s@placement.edu', password: 'password', role: 'STUDENT' },
        { id: 5, username: 'student2', email: 'ananya.k@placement.edu', password: 'password', role: 'STUDENT' },
        { id: 6, username: 'student3', email: 'rohit.p@placement.edu', password: 'password', role: 'STUDENT' }
      ];
      localStorage.setItem('sp_users', JSON.stringify(mockUsers));
    }
    
    if (!localStorage.getItem('sp_companies')) {
      const mockCompanies = [
        { id: 1, name: 'Google', industry: 'IT & Software', website: 'https://google.com', location: 'Mountain View, CA', description: 'Google LLC is an American technology company...' },
        { id: 2, name: 'Microsoft', industry: 'IT & Software', website: 'https://microsoft.com', location: 'Redmond, WA', description: 'Microsoft Corporation is an American technology corporation...' },
        { id: 3, name: 'Accenture', industry: 'IT & Consulting', website: 'https://accenture.com', location: 'Dublin, IE', description: 'Accenture plc is an Irish-American professional services company...' }
      ];
      localStorage.setItem('sp_companies', JSON.stringify(mockCompanies));
    }

    if (!localStorage.getItem('sp_students')) {
      const mockStudents = [
        {
          id: 1,
          userId: 4,
          fullName: 'Tarak Sharma',
          cgpa: 9.2,
          branch: 'CSE',
          graduationYear: 2026,
          skills: 'Java, Spring Boot, React, TypeScript, MySQL, Git, Data Structures, Algorithms',
          certifications: JSON.stringify([{title: 'AWS Certified Cloud Practitioner', issuer: 'AWS', date: '2025-10-12'}]),
          projects: JSON.stringify([
            {title: 'Smart Placement Platform', tech: 'React, Spring Boot', description: 'AI placement coordination.'},
            {title: 'Cloud Locker', tech: 'AWS, Java', description: 'S3-backed storage.'}
          ]),
          bio: 'Aspiring Full Stack Engineer passionate about software architecture.',
          placementReadinessScore: 88,
          resumeUrl: '/resumes/tarak_sharma_cse.pdf'
        },
        {
          id: 2,
          userId: 5,
          fullName: 'Ananya Kapoor',
          cgpa: 8.4,
          branch: 'ECE',
          graduationYear: 2026,
          skills: 'C++, Python, Machine Learning, Embedded Systems, HTML, CSS',
          certifications: JSON.stringify([{title: 'Deep Learning Specialization', issuer: 'Coursera', date: '2025-08-20'}]),
          projects: JSON.stringify([
            {title: 'IoT Weather Monitor', tech: 'Arduino, C++', description: 'Real-time sensor transmission.'}
          ]),
          bio: 'ML designer focused on smart edge devices.',
          placementReadinessScore: 74,
          resumeUrl: '/resumes/ananya_kapoor_ece.pdf'
        },
        {
          id: 3,
          userId: 6,
          fullName: 'Rohit Patil',
          cgpa: 7.2,
          branch: 'ME',
          graduationYear: 2026,
          skills: 'AutoCAD, Matlab, Java, HTML, CSS, SQL',
          certifications: '[]',
          projects: JSON.stringify([{title: 'CAD Gearbox Model', tech: 'AutoCAD', description: '3D model assembly.'}]),
          bio: 'Mechanical engineer learning software integrations.',
          placementReadinessScore: 45,
          resumeUrl: '/resumes/rohit_patil_me.pdf'
        }
      ];
      localStorage.setItem('sp_students', JSON.stringify(mockStudents));
    }

    if (!localStorage.getItem('sp_recruiters')) {
      const mockRecruiters = [
        { id: 1, userId: 2, companyId: 1, designation: 'Senior Talent Specialist', phone: '+91 9876543210' },
        { id: 2, userId: 3, companyId: 2, designation: 'University Recruiter', phone: '+91 8765432109' }
      ];
      localStorage.setItem('sp_recruiters', JSON.stringify(mockRecruiters));
    }

    if (!localStorage.getItem('sp_drives')) {
      const mockDrives = [
        { id: 1, companyId: 1, title: 'Software Engineer (SWE I)', description: 'Solve algorithms and scale services.', roleType: 'Full-time', packageLpa: 22.5, eligibilityCgpa: 8.5, eligibilityBranch: 'CSE, ECE', requiredSkills: 'Java, C++, Data Structures, Algorithms', driveDate: '2026-06-25', status: 'ACTIVE', createdBy: 1 },
        { id: 2, companyId: 2, title: 'Associate Software Engineer', description: 'Build next-gen cloud experiences with React.', roleType: 'Full-time', packageLpa: 18.0, eligibilityCgpa: 8.0, eligibilityBranch: 'CSE, ECE', requiredSkills: 'React, TypeScript, CSS, Git', driveDate: '2026-07-02', status: 'ACTIVE', createdBy: 2 },
        { id: 3, companyId: 3, title: 'Associate Software Engineer (ASE)', description: 'Deliver technology solutions for global clients.', roleType: 'Full-time', packageLpa: 6.5, eligibilityCgpa: 6.0, eligibilityBranch: 'CSE, ECE, ME', requiredSkills: 'Java, HTML, CSS, SQL', driveDate: '2026-06-15', status: 'ACTIVE', createdBy: 2 }
      ];
      localStorage.setItem('sp_drives', JSON.stringify(mockDrives));
    }

    if (!localStorage.getItem('sp_applications')) {
      const mockApps = [
        { id: 1, jobDriveId: 2, studentId: 1, resumeUrl: '/resumes/tarak_sharma_cse.pdf', appliedDate: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'SHORTLISTED', matchScore: 95, aiFeedback: 'Excellent match. The candidate possesses all required skills (React, TypeScript, Git).' },
        { id: 2, jobDriveId: 1, studentId: 2, resumeUrl: '/resumes/ananya_kapoor_ece.pdf', appliedDate: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'APPLIED', matchScore: 72, aiFeedback: 'Good technical match (C++). CGPA is slightly below threshold (8.4 vs 8.5).' },
        { id: 3, jobDriveId: 3, studentId: 3, resumeUrl: '/resumes/rohit_patil_me.pdf', appliedDate: new Date().toISOString(), status: 'SELECTED', matchScore: 78, aiFeedback: 'Candidate meets eligibility criteria. Skill match is complete for Java.' }
      ];
      localStorage.setItem('sp_applications', JSON.stringify(mockApps));
    }

    if (!localStorage.getItem('sp_interviews')) {
      const mockInterviews = [
        { id: 1, applicationId: 1, recruiterId: 2, scheduledTime: new Date(Date.now() + 3 * 86400000).toISOString(), durationMinutes: 45, mode: 'ONLINE', venueLink: 'https://teams.microsoft.com/l/meetup-join/mock-id', status: 'SCHEDULED', feedback: 'Looking forward to the technical assessment.' }
      ];
      localStorage.setItem('sp_interviews', JSON.stringify(mockInterviews));
    }

    if (!localStorage.getItem('sp_notifications')) {
      const mockNotifs = [
        { id: 1, userId: 4, message: 'Congratulations! You have been shortlisted for the Microsoft interview.', type: 'INTERVIEW', readStatus: false, createdAt: new Date().toISOString() },
        { id: 2, userId: 4, message: 'Welcome to Smart Placement Platform. Complete your profile to get recommendations.', type: 'SYSTEM', readStatus: true, createdAt: new Date(Date.now() - 12 * 3600000).toISOString() }
      ];
      localStorage.setItem('sp_notifications', JSON.stringify(mockNotifs));
    }

    if (!localStorage.getItem('sp_reports')) {
      const mockReports = [
        { id: 1, title: 'Campus Placement Summary Report 2025', description: 'Metrics on highest, average package and branch stats.', fileUrl: '/reports/placement_report_initial.pdf', generatedBy: 1, createdAt: new Date().toISOString() }
      ];
      localStorage.setItem('sp_reports', JSON.stringify(mockReports));
    }
  };

  useEffect(() => {
    // Check if user session already exists in localStorage
    const savedUser = localStorage.getItem('sp_session');
    const offlineFlag = localStorage.getItem('sp_offline') === 'true';
    
    setIsOfflineMode(offlineFlag);
    initializeMockDb();

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Attempt real backend call first, unless explicitly forced offline
    if (!isOfflineMode) {
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
          const data = await response.json();
          const sessionUser: UserSession = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role as any,
            token: data.token
          };
          setUser(sessionUser);
          localStorage.setItem('sp_session', JSON.stringify(sessionUser));
          localStorage.setItem('sp_offline', 'false');
          setIsOfflineMode(false);
          setLoading(false);
          return true;
        }
      } catch (err) {
        console.warn("Backend unavailable, auto-falling back to Simulated Local Database.");
      }
    }

    // Offline Mode Logic
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    const matchingUser = users.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (matchingUser) {
      const sessionUser: UserSession = {
        id: matchingUser.id,
        username: matchingUser.username,
        email: matchingUser.email,
        role: matchingUser.role,
        token: 'mock-jwt-token-' + matchingUser.id
      };
      setUser(sessionUser);
      localStorage.setItem('sp_session', JSON.stringify(sessionUser));
      localStorage.setItem('sp_offline', 'true');
      setIsOfflineMode(true);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const register = async (signUpRequest: any): Promise<boolean> => {
    setLoading(true);

    if (!isOfflineMode) {
      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signUpRequest)
        });
        
        if (response.ok) {
          setLoading(false);
          return true;
        }
      } catch (err) {
        console.warn("Backend unavailable for registration, falling back to simulated database.");
      }
    }

    // Offline registration simulation
    const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
    if (users.some((u: any) => u.username.toLowerCase() === signUpRequest.username.toLowerCase())) {
      setLoading(false);
      throw new Error("Username already exists");
    }

    const newUserId = users.length + 1;
    const newUser = {
      id: newUserId,
      username: signUpRequest.username,
      email: signUpRequest.email,
      password: signUpRequest.password,
      role: signUpRequest.role
    };

    users.push(newUser);
    localStorage.setItem('sp_users', JSON.stringify(users));

    if (signUpRequest.role === 'STUDENT') {
      const students = JSON.parse(localStorage.getItem('sp_students') || '[]');
      const newStudent = {
        id: students.length + 1,
        userId: newUserId,
        fullName: signUpRequest.fullName || signUpRequest.username,
        cgpa: signUpRequest.cgpa || 0.0,
        branch: signUpRequest.branch || 'CSE',
        graduationYear: signUpRequest.graduationYear || 2026,
        skills: '[]',
        certifications: '[]',
        projects: '[]',
        placementReadinessScore: 30,
        resumeUrl: ''
      };
      students.push(newStudent);
      localStorage.setItem('sp_students', JSON.stringify(students));
    } else if (signUpRequest.role === 'RECRUITER') {
      const recruiters = JSON.parse(localStorage.getItem('sp_recruiters') || '[]');
      const companies = JSON.parse(localStorage.getItem('sp_companies') || '[]');
      
      let compId = signUpRequest.companyId;
      if (!compId) {
        compId = companies.length + 1;
        const newComp = {
          id: compId,
          name: signUpRequest.companyName || 'Company Inc.',
          industry: signUpRequest.companyIndustry || 'IT & Consulting',
          website: '',
          location: '',
          description: ''
        };
        companies.push(newComp);
        localStorage.setItem('sp_companies', JSON.stringify(companies));
      }

      const newRecruiter = {
        id: recruiters.length + 1,
        userId: newUserId,
        companyId: compId,
        designation: signUpRequest.designation || 'Recruiter',
        phone: signUpRequest.phone || ''
      };
      recruiters.push(newRecruiter);
      localStorage.setItem('sp_recruiters', JSON.stringify(recruiters));
    }

    // Auto switch to offline since we registered mock user
    setIsOfflineMode(true);
    localStorage.setItem('sp_offline', 'true');
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sp_session');
  };

  const setOfflineMode = (offline: boolean) => {
    setIsOfflineMode(offline);
    localStorage.setItem('sp_offline', offline.toString());
  };

  return (
    <AuthContext.Provider value={{ user, loading, isOfflineMode, login, logout, register, setOfflineMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
