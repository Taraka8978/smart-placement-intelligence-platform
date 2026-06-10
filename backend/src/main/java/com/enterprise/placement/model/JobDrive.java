package com.enterprise.placement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "job_drives")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "role_type")
    private String roleType; // e.g. Full-time, Internship

    @Column(name = "package_lpa")
    private Double packageLpa;

    @Column(name = "eligibility_cgpa")
    private Double eligibilityCgpa;

    @Column(name = "eligibility_branch")
    private String eligibilityBranch; // comma-separated values CSE, ECE etc.

    @Column(name = "required_skills")
    private String requiredSkills; // comma-separated values React, Java etc.

    @Column(name = "drive_date")
    private LocalDate driveDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DriveStatus status = DriveStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    private Recruiter createdBy;

    public enum DriveStatus {
        DRAFT,
        ACTIVE,
        COMPLETED
    }
}
