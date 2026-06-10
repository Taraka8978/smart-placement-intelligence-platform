package com.enterprise.placement.config;

import com.enterprise.placement.model.*;
import com.enterprise.placement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private JobDriveRepository jobDriveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // DB already seeded
        }

        System.out.println("Seeding database with realistic enterprise mock data...");

        String defaultPass = passwordEncoder.encode("password");

        // 1. Create Admin
        User adminUser = User.builder()
                .username("admin")
                .email("admin@placement.edu")
                .password(defaultPass)
                .role(Role.ADMIN)
                .build();
        userRepository.save(adminUser);

        // 2. Create Companies
        Company google = Company.builder()
                .name("Google")
                .industry("IT & Software")
                .website("https://google.com")
                .location("Mountain View, CA & Bangalore, IN")
                .description("Google LLC is an American multinational technology company specializing in online advertising, search engine technology, cloud computing, computer software, quantum computing, and artificial intelligence.")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg")
                .build();

        Company microsoft = Company.builder()
                .name("Microsoft")
                .industry("IT & Software")
                .website("https://microsoft.com")
                .location("Redmond, WA & Hyderabad, IN")
                .description("Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and cloud services.")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg")
                .build();

        Company accenture = Company.builder()
                .name("Accenture")
                .industry("Management Consulting & IT")
                .website("https://accenture.com")
                .location("Dublin, IE & Mumbai, IN")
                .description("Accenture plc is an Irish-American professional services company based in Dublin, specializing in information technology services and consulting.")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg")
                .build();

        companyRepository.saveAll(Arrays.asList(google, microsoft, accenture));

        // 3. Create Recruiters
        User googleRecruiterUser = User.builder()
                .username("google_hr")
                .email("google.hr@google.com")
                .password(defaultPass)
                .role(Role.RECRUITER)
                .build();
        userRepository.save(googleRecruiterUser);
        Recruiter googleRecruiter = Recruiter.builder()
                .user(googleRecruiterUser)
                .company(google)
                .designation("Senior Talent Specialist")
                .phone("+91 9876543210")
                .build();
        recruiterRepository.save(googleRecruiter);

        User msftRecruiterUser = User.builder()
                .username("msft_hr")
                .email("msft.hr@microsoft.com")
                .password(defaultPass)
                .role(Role.RECRUITER)
                .build();
        userRepository.save(msftRecruiterUser);
        Recruiter msftRecruiter = Recruiter.builder()
                .user(msftRecruiterUser)
                .company(microsoft)
                .designation("University Recruiter")
                .phone("+91 8765432109")
                .build();
        recruiterRepository.save(msftRecruiter);

        // 4. Create Students
        User studentUser1 = User.builder()
                .username("student1")
                .email("tarak.s@placement.edu")
                .password(defaultPass)
                .role(Role.STUDENT)
                .build();
        userRepository.save(studentUser1);
        Student student1 = Student.builder()
                .user(studentUser1)
                .fullName("Tarak Sharma")
                .cgpa(9.2)
                .branch("CSE")
                .graduationYear(2026)
                .skills("Java, Spring Boot, React, TypeScript, MySQL, Git, Data Structures, Algorithms")
                .certifications("[{\"title\":\"AWS Certified Cloud Practitioner\",\"issuer\":\"Amazon Web Services\",\"date\":\"2025-10-12\"}]")
                .projects("[{\"title\":\"Smart Placement Platform\",\"tech\":\"Spring Boot, React, MySQL\",\"description\":\"AI-powered platform to optimize placement coordination.\"},{\"title\":\"Cloud Locker\",\"tech\":\"AWS, Java\",\"description\":\"Secure file storage solution on S3.\"}]")
                .bio("Aspiring Full Stack Engineer passionate about software architecture, algorithms, and microservices.")
                .placementReadinessScore(88)
                .resumeUrl("/resumes/tarak_sharma_cse.pdf")
                .build();
        studentRepository.save(student1);

        User studentUser2 = User.builder()
                .username("student2")
                .email("ananya.k@placement.edu")
                .password(defaultPass)
                .role(Role.STUDENT)
                .build();
        userRepository.save(studentUser2);
        Student student2 = Student.builder()
                .user(studentUser2)
                .fullName("Ananya Kapoor")
                .cgpa(8.4)
                .branch("ECE")
                .graduationYear(2026)
                .skills("C++, Python, Machine Learning, Embedded Systems, HTML, CSS")
                .certifications("[{\"title\":\"Deep Learning Specialization\",\"issuer\":\"Coursera (DeepLearning.AI)\",\"date\":\"2025-08-20\"}]")
                .projects("[{\"title\":\"IoT Weather Monitor\",\"tech\":\"Arduino, C++\",\"description\":\"Real-time sensor data transmitter.\"},{\"title\":\"Image Classifier\",\"tech\":\"Python, PyTorch\",\"description\":\"CNN classifier for medical images.\"}]")
                .bio("Hardware enthusiast and ML designer focused on smart edge devices and automation.")
                .placementReadinessScore(74)
                .resumeUrl("/resumes/ananya_kapoor_ece.pdf")
                .build();
        studentRepository.save(student2);

        User studentUser3 = User.builder()
                .username("student3")
                .email("rohit.p@placement.edu")
                .password(defaultPass)
                .role(Role.STUDENT)
                .build();
        userRepository.save(studentUser3);
        Student student3 = Student.builder()
                .user(studentUser3)
                .fullName("Rohit Patil")
                .cgpa(7.2)
                .branch("ME")
                .graduationYear(2026)
                .skills("AutoCAD, Matlab, Java, HTML, CSS, SQL")
                .certifications("[]")
                .projects("[{\"title\":\"CAD Gearbox Model\",\"tech\":\"AutoCAD\",\"description\":\"3D model design of industrial double gear assembly.\"}]")
                .bio("Mechanical engineering student building technical skills in scripting and software integrations.")
                .placementReadinessScore(45)
                .resumeUrl("/resumes/rohit_patil_me.pdf")
                .build();
        studentRepository.save(student3);

        // 5. Create Job Drives
        JobDrive googleDrive = JobDrive.builder()
                .company(google)
                .title("Software Engineer (SWE I)")
                .description("Join our engineering team to solve high-scale computer science problems. Responsibilities include building backend services, optimizing data pipelines, and implementing algorithmic solutions.")
                .roleType("Full-time")
                .packageLpa(22.5)
                .eligibilityCgpa(8.5)
                .eligibilityBranch("CSE, ECE")
                .requiredSkills("Java, C++, Data Structures, Algorithms")
                .driveDate(LocalDate.now().plusWeeks(2))
                .status(JobDrive.DriveStatus.ACTIVE)
                .createdBy(googleRecruiter)
                .build();

        JobDrive msftDrive = JobDrive.builder()
                .company(microsoft)
                .title("Associate Software Engineer")
                .description("We are looking for frontend and full-stack software engineers to help build next-generation cloud interfaces. Focus areas will include React development, accessibility, and high performance components.")
                .roleType("Full-time")
                .packageLpa(18.0)
                .eligibilityCgpa(8.0)
                .eligibilityBranch("CSE, ECE")
                .requiredSkills("React, TypeScript, CSS, Git")
                .driveDate(LocalDate.now().plusWeeks(3))
                .status(JobDrive.DriveStatus.ACTIVE)
                .createdBy(msftRecruiter)
                .build();

        JobDrive accentureDrive = JobDrive.builder()
                .company(accenture)
                .title("Associate Software Engineer (ASE)")
                .description("Help deliver technology solutions for global clients. Ideal role for fresh graduates starting their career in web engineering and software delivery.")
                .roleType("Full-time")
                .packageLpa(6.5)
                .eligibilityCgpa(6.0)
                .eligibilityBranch("CSE, ECE, ME")
                .requiredSkills("Java, HTML, CSS, SQL")
                .driveDate(LocalDate.now().plusDays(5))
                .status(JobDrive.DriveStatus.ACTIVE)
                .createdBy(msftRecruiter) // MSFT HR handles accenture as placeholder or recruiter can handle multiple
                .build();

        jobDriveRepository.saveAll(Arrays.asList(googleDrive, msftDrive, accentureDrive));

        // 6. Create Applications
        // Student 1 (Tarak) -> Microsoft (CSE, CGPA 9.2, skills: Java, Spring Boot, React, TypeScript...)
        // Microsoft requires: React, TypeScript, CSS, Git. Eligibility CGPA: 8.0.
        // Match score: high.
        Application app1 = Application.builder()
                .student(student1)
                .jobDrive(msftDrive)
                .resumeUrl(student1.getResumeUrl())
                .status(Application.ApplicationStatus.SHORTLISTED)
                .matchScore(95)
                .aiFeedback("Excellent match. The candidate possesses all required skills (React, TypeScript, Git) and matches the branch and CGPA requirements.")
                .build();

        // Student 2 (Ananya) -> Google (ECE, CGPA 8.4, skills: C++, Python...)
        // Google requires: Java, C++, DSA. Eligibility CGPA: 8.5.
        // CGPA is slightly lower than 8.5.
        Application app2 = Application.builder()
                .student(student2)
                .jobDrive(googleDrive)
                .resumeUrl(student2.getResumeUrl())
                .status(Application.ApplicationStatus.APPLIED)
                .matchScore(72)
                .aiFeedback("Good technical match (C++). However, candidate CGPA (8.4) is slightly below Google's threshold of 8.5.")
                .build();

        // Student 3 (Rohit) -> Accenture (ME, CGPA 7.2, skills: AutoCAD, Matlab, Java...)
        // Accenture requires: Java, HTML, CSS, SQL. Eligibility CGPA: 6.0.
        // Match score: decent. Let's make him selected.
        Application app3 = Application.builder()
                .student(student3)
                .jobDrive(accentureDrive)
                .resumeUrl(student3.getResumeUrl())
                .status(Application.ApplicationStatus.SELECTED)
                .matchScore(78)
                .aiFeedback("Candidate meets CGPA eligibility. Skill match is complete for Java, HTML, and CSS.")
                .build();

        applicationRepository.saveAll(Arrays.asList(app1, app2, app3));

        // 7. Schedule Interviews
        Interview interview1 = Interview.builder()
                .application(app1)
                .recruiter(msftRecruiter)
                .scheduledTime(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0).withSecond(0))
                .durationMinutes(45)
                .mode(Interview.InterviewMode.ONLINE)
                .venueLink("https://teams.microsoft.com/l/meetup-join/mock-id")
                .status(Interview.InterviewStatus.SCHEDULED)
                .feedback("Looking forward to the technical assessment.")
                .build();
        interviewRepository.save(interview1);

        // 8. Add Notifications
        Notification notifAdmin = Notification.builder()
                .user(adminUser)
                .message("Placement database seeded successfully. System is ready.")
                .type(Notification.NotificationType.SYSTEM)
                .build();

        Notification notifStudent1 = Notification.builder()
                .user(studentUser1)
                .message("Congratulations! You have been shortlisted for the Microsoft Associate Software Engineer interview.")
                .type(Notification.NotificationType.INTERVIEW)
                .build();

        Notification notifStudent2 = Notification.builder()
                .user(studentUser2)
                .message("Your application for Google SWE I has been successfully received.")
                .type(Notification.NotificationType.APPLICATION)
                .build();

        Notification notifStudent3 = Notification.builder()
                .user(studentUser3)
                .message("Congratulations! You have been Selected by Accenture.")
                .type(Notification.NotificationType.APPLICATION)
                .build();

        notificationRepository.saveAll(Arrays.asList(notifAdmin, notifStudent1, notifStudent2, notifStudent3));

        // 9. Create a Report
        Report report = Report.builder()
                .title("Campus Placement Summary Report 2025")
                .description("Detailed metrics representing highest vs average package, branch breakdown of placement statistics, and key recruiters.")
                .fileUrl("/reports/placement_report_initial.pdf")
                .generatedBy(adminUser)
                .build();
        reportRepository.save(report);

        System.out.println("Database seeding completed.");
    }
}
