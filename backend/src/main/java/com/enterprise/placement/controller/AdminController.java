package com.enterprise.placement.controller;

import com.enterprise.placement.model.*;
import com.enterprise.placement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobDriveRepository jobDriveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ReportRepository reportRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @GetMapping("/recruiters")
    public ResponseEntity<?> getAllRecruiters() {
        return ResponseEntity.ok(recruiterRepository.findAll());
    }

    @GetMapping("/companies")
    public ResponseEntity<?> getAllCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @GetMapping("/analytics/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalRecruiters = recruiterRepository.count();
        long totalCompanies = companyRepository.count();

        List<Application> allApps = applicationRepository.findAll();
        long placedCount = allApps.stream()
                .filter(a -> a.getStatus() == Application.ApplicationStatus.SELECTED)
                .map(a -> a.getStudent().getId())
                .distinct()
                .count();

        double placementRate = totalStudents > 0 ? ((double) placedCount / totalStudents) * 100 : 0.0;

        List<JobDrive> drives = jobDriveRepository.findAll();
        double maxLpa = drives.stream().mapToDouble(JobDrive::getPackageLpa).max().orElse(0.0);
        double avgLpa = drives.stream().mapToDouble(JobDrive::getPackageLpa).average().orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalRecruiters", totalRecruiters);
        stats.put("totalCompanies", totalCompanies);
        stats.put("placedStudents", placedCount);
        stats.put("placementRate", Math.round(placementRate * 10.0) / 10.0);
        stats.put("highestPackageLpa", maxLpa);
        stats.put("averagePackageLpa", Math.round(avgLpa * 10.0) / 10.0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/branch")
    public ResponseEntity<?> getBranchAnalytics() {
        List<Student> students = studentRepository.findAll();
        List<Application> selectedApps = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == Application.ApplicationStatus.SELECTED)
                .collect(Collectors.toList());

        // Group students by branch
        Map<String, List<Student>> studentsByBranch = students.stream()
                .collect(Collectors.groupingBy(s -> s.getBranch() != null ? s.getBranch() : "Other"));

        List<Map<String, Object>> branchStats = new ArrayList<>();

        for (Map.Entry<String, List<Student>> entry : studentsByBranch.entrySet()) {
            String branch = entry.getKey();
            List<Student> branchStudents = entry.getValue();
            long total = branchStudents.size();

            // Placed students in this branch
            long placed = branchStudents.stream()
                    .filter(s -> selectedApps.stream().anyMatch(a -> a.getStudent().getId().equals(s.getId())))
                    .count();

            double rate = total > 0 ? ((double) placed / total) * 100 : 0.0;

            Map<String, Object> map = new HashMap<>();
            map.put("branch", branch);
            map.put("totalStudents", total);
            map.put("placedStudents", placed);
            map.put("placementRate", Math.round(rate * 10.0) / 10.0);
            branchStats.add(map);
        }

        return ResponseEntity.ok(branchStats);
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<?> generateReport(@RequestParam String title, @RequestParam String description) {
        try {
            User admin = getCurrentUser();
            String mockFileUrl = "/reports/placement_report_" + System.currentTimeMillis() + ".pdf";

            Report report = Report.builder()
                    .title(title)
                    .description(description)
                    .fileUrl(mockFileUrl)
                    .generatedBy(admin)
                    .build();

            Report saved = reportRepository.save(report);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        return ResponseEntity.ok(reportRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/system/monitor")
    public ResponseEntity<?> getSystemMonitor() {
        // Mock server stats that fluctuate realistically
        Random random = new Random();
        double cpuLoad = 15.0 + random.nextDouble() * 25.0; // 15% - 40%
        double memoryUsed = 1.2 + random.nextDouble() * 0.8; // 1.2GB - 2.0GB
        double dbConnections = 8 + random.nextInt(12); // 8 - 20 active connections
        int avgLatency = 45 + random.nextInt(40); // 45ms - 85ms

        Map<String, Object> monitor = new HashMap<>();
        monitor.put("cpuLoadPercentage", Math.round(cpuLoad * 10.0) / 10.0);
        monitor.put("memoryUsedGb", Math.round(memoryUsed * 10.0) / 10.0);
        monitor.put("memoryTotalGb", 8.0);
        monitor.put("dbConnectionPoolActive", dbConnections);
        monitor.put("dbConnectionPoolSize", 50);
        monitor.put("averageLatencyMs", avgLatency);
        monitor.put("systemStatus", "OPERATIONAL");
        monitor.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(monitor);
    }
}
