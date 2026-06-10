package com.enterprise.placement.dto;

import com.enterprise.placement.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotNull
    private Role role;

    // Student fields (only used if role = STUDENT)
    private String fullName;
    private String branch;
    private Double cgpa;
    private Integer graduationYear;

    // Recruiter fields (only used if role = RECRUITER)
    private String designation;
    private String phone;
    private Long companyId; // Link to existing company
    private String companyName; // Used to create a new company if companyId is null
    private String companyIndustry;
}
