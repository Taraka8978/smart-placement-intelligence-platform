package com.enterprise.placement.service;

import com.enterprise.placement.model.JobDrive;
import com.enterprise.placement.model.Student;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    private static final List<String> SKILL_DICTIONARY = Arrays.asList(
            "Java", "Spring Boot", "Hibernate", "Python", "Django", "Flask",
            "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js",
            "Express", "HTML", "CSS", "Tailwind CSS", "Bootstrap",
            "MySQL", "PostgreSQL", "MongoDB", "Oracle", "Redis",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub",
            "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
            "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch",
            "Data Structures", "Algorithms", "System Design"
    );

    /**
     * Extracts skills from resume text. Case-insensitive dictionary matching.
     */
    public List<String> extractSkills(String resumeContent) {
        if (resumeContent == null || resumeContent.trim().isEmpty()) {
            return Arrays.asList("Java", "Data Structures", "Algorithms", "Git");
        }
        
        Set<String> extracted = new HashSet<>();
        String normalized = resumeContent.toLowerCase();
        
        for (String skill : SKILL_DICTIONARY) {
            String regex = "\\b" + java.util.regex.Pattern.quote(skill.toLowerCase()) + "\\b";
            if (java.util.regex.Pattern.compile(regex).matcher(normalized).find()) {
                extracted.add(skill);
            }
        }
        
        if (extracted.isEmpty()) {
            extracted.addAll(Arrays.asList("Java", "Data Structures", "Git"));
        }
        
        return new ArrayList<>(extracted);
    }

    /**
     * Calculates resume matching score with job criteria (0 to 100).
     */
    public int calculateMatchScore(Student student, JobDrive drive) {
        if (student == null || drive == null) return 0;

        List<String> studentSkills = parseSkillsList(student.getSkills());
        List<String> requiredSkills = parseCommaSeparatedList(drive.getRequiredSkills());

        if (requiredSkills.isEmpty()) {
            return 80; // default score if no skills listed
        }

        // Calculate overlap
        long overlapCount = requiredSkills.stream()
                .filter(req -> studentSkills.stream().anyMatch(s -> s.equalsIgnoreCase(req.trim())))
                .count();

        double skillMatchRatio = (double) overlapCount / requiredSkills.size();
        double cgpaFactor = student.getCgpa() >= drive.getEligibilityCgpa() ? 1.0 : 0.5;

        // Formula: 70% skill match + 30% CGPA compliance
        double score = (skillMatchRatio * 70) + (cgpaFactor * 30);
        return Math.min(100, Math.max(0, (int) Math.round(score)));
    }

    /**
     * Heuristic calculation of Placement Probability (0 to 100).
     */
    public int predictPlacementProbability(Student student) {
        if (student == null) return 0;

        double cgpa = student.getCgpa() != null ? student.getCgpa() : 7.0;
        List<String> skills = parseSkillsList(student.getSkills());
        
        // Count mock projects and certifications from stored json/strings
        int projectCount = countItemsInJson(student.getProjects());
        int certCount = countItemsInJson(student.getCertifications());

        double baseScore = (cgpa * 6.5) // Max 65% from CGPA
                + (skills.size() * 1.5) // Max 15% from skills
                + (projectCount * 4.0) // Max 12% from projects
                + (certCount * 3.0); // Max 9% from certifications

        return Math.min(98, Math.max(30, (int) Math.round(baseScore)));
    }

    /**
     * Identifies skills required by job drive but missing from student.
     */
    public List<String> analyzeSkillGap(Student student, JobDrive drive) {
        if (student == null || drive == null) return Collections.emptyList();

        List<String> studentSkills = parseSkillsList(student.getSkills());
        List<String> requiredSkills = parseCommaSeparatedList(drive.getRequiredSkills());

        return requiredSkills.stream()
                .filter(req -> studentSkills.stream().noneMatch(s -> s.equalsIgnoreCase(req.trim())))
                .map(String::trim)
                .collect(Collectors.toList());
    }

    /**
     * Matches student profile with active drives.
     */
    public List<JobDrive> recommendDrives(Student student, List<JobDrive> allDrives) {
        if (student == null || allDrives == null || allDrives.isEmpty()) {
            return Collections.emptyList();
        }

        return allDrives.stream()
                .filter(drive -> drive.getStatus() == JobDrive.DriveStatus.ACTIVE)
                .sorted((d1, d2) -> {
                    int score1 = calculateMatchScore(student, d1);
                    int score2 = calculateMatchScore(student, d2);
                    return Integer.compare(score2, score1); // Descending order
                })
                .limit(5)
                .collect(Collectors.toList());
    }

    // --- Helpers ---

    private List<String> parseSkillsList(String skillsJson) {
        if (skillsJson == null || skillsJson.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        // Handle raw comma separated values or bracket JSON arrays: ["Java", "Python"]
        if (skillsJson.startsWith("[")) {
            String cleaned = skillsJson.replace("[", "").replace("]", "").replace("\"", "");
            return parseCommaSeparatedList(cleaned);
        }
        return parseCommaSeparatedList(skillsJson);
    }

    private List<String> parseCommaSeparatedList(String commaSeparated) {
        if (commaSeparated == null || commaSeparated.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(commaSeparated.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private int countItemsInJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty() || jsonString.equals("[]")) {
            return 0;
        }
        // Basic parser counting occurrences of objects/strings in array
        // Expected structure is JSON list: [{"title": "X"}, {"title": "Y"}]
        int count = 0;
        int index = 0;
        while ((index = jsonString.indexOf("{", index)) != -1) {
            count++;
            index++;
        }
        if (count == 0 && jsonString.startsWith("[")) {
            // It could be string list like ["A", "B"]
            String cleaned = jsonString.replace("[", "").replace("]", "").trim();
            if (cleaned.isEmpty()) return 0;
            return cleaned.split(",").length;
        }
        return count;
    }
}
