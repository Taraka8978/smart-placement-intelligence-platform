package com.enterprise.placement.controller;

import com.enterprise.placement.dto.StudentProfileRequest;
import com.enterprise.placement.model.*;
import com.enterprise.placement.repository.*;
import com.enterprise.placement.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobDriveRepository jobDriveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AIService aiService;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private Student getCurrentStudent() {
        User user = getCurrentUser();
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found for user: " + user.getId()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        try {
            Student student = getCurrentStudent();
            // recalculate readiness score dynamically based on profile
            int readiness = aiService.predictPlacementProbability(student);
            student.setPlacementReadinessScore(readiness);
            studentRepository.save(student);
            return ResponseEntity.ok(student);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody StudentProfileRequest request) {
        try {
            Student student = getCurrentStudent();
            if (request.getFullName() != null) student.setFullName(request.getFullName());
            if (request.getCgpa() != null) student.setCgpa(request.getCgpa());
            if (request.getBranch() != null) student.setBranch(request.getBranch());
            if (request.getGraduationYear() != null) student.setGraduationYear(request.getGraduationYear());
            if (request.getSkills() != null) student.setSkills(request.getSkills());
            if (request.getCertifications() != null) student.setCertifications(request.getCertifications());
            if (request.getProjects() != null) student.setProjects(request.getProjects());
            if (request.getBio() != null) student.setBio(request.getBio());

            // recalculate readiness score
            int readiness = aiService.predictPlacementProbability(student);
            student.setPlacementReadinessScore(readiness);

            Student updated = studentRepository.save(student);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/me/resume")
    public ResponseEntity<?> uploadResume(@RequestParam(value = "file", required = false) MultipartFile file,
                                          @RequestParam(value = "resumeText", required = false) String resumeText) {
        try {
            Student student = getCurrentStudent();
            String contentToParse = "";

            if (file != null && !file.isEmpty()) {
                // Read content from file (mock parsing or read plain txt)
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
                    contentToParse = reader.lines().collect(Collectors.joining("\n"));
                } catch (Exception e) {
                    contentToParse = "Uploaded resume file: " + file.getOriginalFilename();
                }
                student.setResumeUrl("/resumes/student_" + student.getId() + ".pdf");
            } else if (resumeText != null) {
                contentToParse = resumeText;
                student.setResumeUrl("/resumes/student_" + student.getId() + "_text.pdf");
            } else {
                return ResponseEntity.badRequest().body("Please upload a file or supply resume text.");
            }

            // Extract skills using AIService
            List<String> extractedSkills = aiService.extractSkills(contentToParse);
            
            // Format to simple comma separated string to store in student profile
            String skillsString = String.join(", ", extractedSkills);
            student.setSkills(skillsString);

            // Re-calculate readiness score
            int readiness = aiService.predictPlacementProbability(student);
            student.setPlacementReadinessScore(readiness);
            studentRepository.save(student);

            Map<String, Object> response = new HashMap<>();
            response.put("ok", true);
            response.put("message", "Resume analyzed successfully");
            response.put("extractedSkills", extractedSkills);
            response.put("readinessScore", readiness);
            response.put("resumeUrl", student.getResumeUrl());

            // Add notification
            Notification notification = Notification.builder()
                    .user(getCurrentUser())
                    .message("Resume analyzed successfully. Extracted skills: " + skillsString)
                    .type(Notification.NotificationType.SYSTEM)
                    .build();
            notificationRepository.save(notification);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/me/recommendations")
    public ResponseEntity<?> getRecommendations() {
        try {
            Student student = getCurrentStudent();
            List<JobDrive> activeDrives = jobDriveRepository.findByStatus(JobDrive.DriveStatus.ACTIVE);
            List<JobDrive> recommended = aiService.recommendDrives(student, activeDrives);

            List<Map<String, Object>> result = recommended.stream().map(drive -> {
                Map<String, Object> map = new HashMap<>();
                map.put("drive", drive);
                map.put("matchScore", aiService.calculateMatchScore(student, drive));
                map.put("missingSkills", aiService.analyzeSkillGap(student, drive));
                map.put("probability", Math.max(30, aiService.calculateMatchScore(student, drive) - 5));
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/drives")
    public ResponseEntity<?> getAllDrives() {
        Student student = getCurrentStudent();
        List<JobDrive> drives = jobDriveRepository.findByStatus(JobDrive.DriveStatus.ACTIVE);
        
        List<Map<String, Object>> result = drives.stream().map(drive -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", drive.getId());
            map.put("title", drive.getTitle());
            map.put("description", drive.getDescription());
            map.put("company", drive.getCompany());
            map.put("roleType", drive.getRoleType());
            map.put("packageLpa", drive.getPackageLpa());
            map.put("eligibilityCgpa", drive.getEligibilityCgpa());
            map.put("eligibilityBranch", drive.getEligibilityBranch());
            map.put("requiredSkills", drive.getRequiredSkills());
            map.put("driveDate", drive.getDriveDate());
            map.put("status", drive.getStatus());
            
            // Calculate dynamic AI match metrics
            int matchScore = aiService.calculateMatchScore(student, drive);
            List<String> skillGap = aiService.analyzeSkillGap(student, drive);
            boolean isEligible = student.getCgpa() >= drive.getEligibilityCgpa();
            
            map.put("matchScore", matchScore);
            map.put("skillGap", skillGap);
            map.put("isEligible", isEligible);

            // check application status
            Optional<Application> app = applicationRepository.findByJobDriveIdAndStudentId(drive.getId(), student.getId());
            map.put("applied", app.isPresent());
            map.put("applicationStatus", app.map(a -> a.getStatus().name()).orElse(null));

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/drives/{id}/apply")
    public ResponseEntity<?> applyForDrive(@PathVariable Long id) {
        try {
            Student student = getCurrentStudent();
            JobDrive drive = jobDriveRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Job drive not found"));

            Optional<Application> existing = applicationRepository.findByJobDriveIdAndStudentId(id, student.getId());
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body("You have already applied for this placement drive.");
            }

            // Calculate AI matching metrics
            int matchScore = aiService.calculateMatchScore(student, drive);
            List<String> gap = aiService.analyzeSkillGap(student, drive);
            String aiFeedback = "Based on our analysis, your profile matches " + matchScore + "% of the requirements.";
            if (!gap.isEmpty()) {
                aiFeedback += " Missing skills suggested to study: " + String.join(", ", gap);
            } else {
                aiFeedback += " Great work! You meet all specified skill requirements.";
            }

            if (student.getCgpa() < drive.getEligibilityCgpa()) {
                aiFeedback += " Note: Your CGPA is below the eligibility threshold.";
            }

            Application application = Application.builder()
                    .student(student)
                    .jobDrive(drive)
                    .resumeUrl(student.getResumeUrl() != null ? student.getResumeUrl() : "DefaultProfileResume")
                    .matchScore(matchScore)
                    .aiFeedback(aiFeedback)
                    .status(Application.ApplicationStatus.APPLIED)
                    .build();

            Application saved = applicationRepository.save(application);

            // Create notification for Student
            Notification studentNotif = Notification.builder()
                    .user(getCurrentUser())
                    .message("Successfully applied for " + drive.getTitle() + " at " + drive.getCompany().getName() + ". AI Match Score: " + matchScore + "%.")
                    .type(Notification.NotificationType.APPLICATION)
                    .build();
            notificationRepository.save(studentNotif);

            // Create notification for Recruiter
            Notification recruiterNotif = Notification.builder()
                    .user(drive.getCreatedBy().getUser())
                    .message("New application received for drive '" + drive.getTitle() + "' from student " + student.getFullName() + ". Match score: " + matchScore + "%.")
                    .type(Notification.NotificationType.APPLICATION)
                    .build();
            notificationRepository.save(recruiterNotif);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me/applications")
    public ResponseEntity<?> getMyApplications() {
        try {
            Student student = getCurrentStudent();
            List<Application> apps = applicationRepository.findByStudentId(student.getId());
            return ResponseEntity.ok(apps);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/me/interviews")
    public ResponseEntity<?> getMyInterviews() {
        try {
            Student student = getCurrentStudent();
            List<Interview> interviews = interviewRepository.findByApplicationStudentId(student.getId());
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/me/notifications")
    public ResponseEntity<?> getMyNotifications() {
        try {
            User user = getCurrentUser();
            List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            return ResponseEntity.ok(notifs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/me/notifications/read")
    public ResponseEntity<?> markNotificationsAsRead() {
        try {
            User user = getCurrentUser();
            List<Notification> unread = notificationRepository.findByUserIdAndReadStatusOrderByCreatedAtDesc(user.getId(), false);
            for (Notification n : unread) {
                n.setReadStatus(true);
            }
            notificationRepository.saveAll(unread);
            return ResponseEntity.ok("Notifications marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
