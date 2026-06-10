package com.enterprise.placement.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private Double cgpa;

    private String branch;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String skills; // JSON string or comma separated skills

    @Lob
    @Column(columnDefinition = "TEXT")
    private String certifications; // JSON string

    @Lob
    @Column(columnDefinition = "TEXT")
    private String projects; // JSON string

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "placement_readiness_score")
    private Integer placementReadinessScore;

    @Column(length = 1000)
    private String bio;
}
