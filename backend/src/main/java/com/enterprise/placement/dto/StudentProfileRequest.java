package com.enterprise.placement.dto;

import lombok.Data;

@Data
public class StudentProfileRequest {
    private String fullName;
    private Double cgpa;
    private String branch;
    private Integer graduationYear;
    private String skills; // JSON string or comma separated
    private String certifications; // JSON string
    private String projects; // JSON string
    private String bio;
}
