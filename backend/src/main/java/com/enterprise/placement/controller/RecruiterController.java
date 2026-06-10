package com.enterprise.placement.controller;

import com.enterprise.placement.dto.InterviewRequest;
import com.enterprise.placement.dto.JobDriveRequest;
import com.enterprise.placement.model.*;
import com.enterprise.placement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/recruiters")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecruiterController {

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobDriveRepository jobDriveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private Recruiter getCurrentRecruiter() {
        User user = getCurrentUser();
        return recruiterRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        try {
            return ResponseEntity.ok(getCurrentRecruiter());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/company")
    public ResponseEntity<?> updateCompany(@RequestBody Company updatedCompany) {
        try {
            Recruiter recruiter = getCurrentRecruiter();
            Company company = recruiter.getCompany();
            
            if (updatedCompany.getName() != null) company.setName(updatedCompany.getName());
            if (updatedCompany.getIndustry() != null) company.setIndustry(updatedCompany.getIndustry());
            if (updatedCompany.getWebsite() != null) company.setWebsite(updatedCompany.getWebsite());
            if (updatedCompany.getLocation() != null) company.setLocation(updatedCompany.getLocation());
            if (updatedCompany.getDescription() != null) company.setDescription(updatedCompany.getDescription());
            if (updatedCompany.getLogoUrl() != null) company.setLogoUrl(updatedCompany.getLogoUrl());

            Company saved = companyRepository.save(company);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/drives")
    public ResponseEntity<?> createDrive(@RequestBody JobDriveRequest request) {
        try {
            Recruiter recruiter = getCurrentRecruiter();
            
            JobDrive drive = JobDrive.builder()
                    .createdBy(recruiter)
                    .company(recruiter.getCompany())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .roleType(request.getRoleType())
                    .packageLpa(request.getPackageLpa())
                    .eligibilityCgpa(request.getEligibilityCgpa())
                    .eligibilityBranch(request.getEligibilityBranch())
                    .requiredSkills(request.getRequiredSkills())
                    .driveDate(request.getDriveDate() != null ? request.getDriveDate() : java.time.LocalDate.now().plusWeeks(2))
                    .status(request.getStatus() != null ? JobDrive.DriveStatus.valueOf(request.getStatus().toUpperCase()) : JobDrive.DriveStatus.ACTIVE)
                    .build();

            JobDrive saved = jobDriveRepository.save(drive);

            // Notify all system users about the new job drive (mock) or system broadcast
            // For simplicity, generate a system notification for admins, and can notify qualifying students later
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/drives")
    public ResponseEntity<?> getMyDrives() {
        try {
            Recruiter recruiter = getCurrentRecruiter();
            List<JobDrive> drives = jobDriveRepository.findByCreatedById(recruiter.getId());
            return ResponseEntity.ok(drives);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/drives/{id}/applications")
    public ResponseEntity<?> getDriveApplications(@PathVariable Long id) {
        try {
            // Verify recruiter owns this drive or is admin
            Recruiter recruiter = getCurrentRecruiter();
            JobDrive drive = jobDriveRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Drive not found"));
            
            if (!drive.getCreatedBy().getId().equals(recruiter.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not manage this placement drive.");
            }

            List<Application> apps = applicationRepository.findByJobDriveId(id);
            return ResponseEntity.ok(apps);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Recruiter recruiter = getCurrentRecruiter();
            Application app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Check authorization
            if (!app.getJobDrive().getCreatedBy().getId().equals(recruiter.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not manage this drive.");
            }

            Application.ApplicationStatus appStatus = Application.ApplicationStatus.valueOf(status.toUpperCase());
            app.setStatus(appStatus);
            Application saved = applicationRepository.save(app);

            // Notify student
            String message = String.format("Your application for '%s' at '%s' has been updated to: %s.",
                    app.getJobDrive().getTitle(),
                    app.getJobDrive().getCompany().getName(),
                    appStatus.name()
            );

            Notification notification = Notification.builder()
                    .user(app.getStudent().getUser())
                    .message(message)
                    .type(Notification.NotificationType.APPLICATION)
                    .build();
            notificationRepository.save(notification);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/interviews/schedule")
    public ResponseEntity<?> scheduleInterview(@RequestBody InterviewRequest request) {
        try {
            Recruiter recruiter = getCurrentRecruiter();
            Application app = applicationRepository.findById(request.getApplicationId())
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Check authorization
            if (!app.getJobDrive().getCreatedBy().getId().equals(recruiter.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not manage this drive.");
            }

            Interview interview = Interview.builder()
                    .application(app)
                    .recruiter(recruiter)
                    .scheduledTime(request.getScheduledTime())
                    .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 45)
                    .mode(request.getMode() != null ? Interview.InterviewMode.valueOf(request.getMode().toUpperCase()) : Interview.InterviewMode.ONLINE)
                    .venueLink(request.getVenueLink() != null ? request.getVenueLink() : "Google Meet Link")
                    .status(Interview.InterviewStatus.SCHEDULED)
                    .build();

            Interview saved = interviewRepository.save(interview);

            // Update application status to SHORTLISTED automatically
            if (app.getStatus() == Application.ApplicationStatus.APPLIED) {
                app.setStatus(Application.ApplicationStatus.SHORTLISTED);
                applicationRepository.save(app);
            }

            // Notify Student
            String message = String.format("Interview scheduled for '%s' at '%s' on %s. Mode: %s. Link: %s",
                    app.getJobDrive().getTitle(),
                    app.getJobDrive().getCompany().getName(),
                    saved.getScheduledTime().toString(),
                    saved.getMode().name(),
                    saved.getVenueLink()
            );

            Notification notification = Notification.builder()
                    .user(app.getStudent().getUser())
                    .message(message)
                    .type(Notification.NotificationType.INTERVIEW)
                    .build();
            notificationRepository.save(notification);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        try {
            Recruiter recruiter = getCurrentRecruiter();
            List<JobDrive> myDrives = jobDriveRepository.findByCreatedById(recruiter.getId());
            List<Application> myApps = applicationRepository.findByJobDriveCreatedById(recruiter.getId());

            long totalApplied = myApps.size();
            long shortlisted = myApps.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.SHORTLISTED).count();
            long selected = myApps.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.SELECTED).count();
            long rejected = myApps.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.REJECTED).count();

            List<Interview> myInterviews = interviewRepository.findByRecruiterId(recruiter.getId());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalDrives", myDrives.size());
            stats.put("totalApplications", totalApplied);
            stats.put("shortlistedCount", shortlisted);
            stats.put("selectedCount", selected);
            stats.put("rejectedCount", rejected);
            stats.put("interviewsScheduledCount", myInterviews.stream().filter(i -> i.getStatus() == Interview.InterviewStatus.SCHEDULED).count());

            // Recent applicants
            List<Map<String, Object>> recentApplicants = myApps.stream()
                    .sorted(Comparator.comparing(Application::getAppliedDate).reversed())
                    .limit(5)
                    .map(a -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("applicationId", a.getId());
                        m.put("studentName", a.getStudent().getFullName());
                        m.put("branch", a.getStudent().getBranch());
                        m.put("cgpa", a.getStudent().getCgpa());
                        m.put("driveTitle", a.getJobDrive().getTitle());
                        m.put("matchScore", a.getMatchScore());
                        m.put("status", a.getStatus().name());
                        m.put("appliedDate", a.getAppliedDate());
                        return m;
                    }).collect(Collectors.toList());

            stats.put("recentApplicants", recentApplicants);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
