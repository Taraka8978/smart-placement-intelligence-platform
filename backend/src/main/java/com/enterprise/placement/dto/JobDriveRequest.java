package com.enterprise.placement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class JobDriveRequest {
    @NotBlank
    private String title;

    private String description;

    private String roleType;

    @NotNull
    private Double packageLpa;

    @NotNull
    private Double eligibilityCgpa;

    private String eligibilityBranch; // comma-separated

    private String requiredSkills; // comma-separated

    private LocalDate driveDate;

    private String status; // ACTIVE, DRAFT, COMPLETED
}
