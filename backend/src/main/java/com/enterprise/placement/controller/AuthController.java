package com.enterprise.placement.controller;

import com.enterprise.placement.dto.JwtResponse;
import com.enterprise.placement.dto.LoginRequest;
import com.enterprise.placement.dto.SignupRequest;
import com.enterprise.placement.model.*;
import com.enterprise.placement.repository.*;
import com.enterprise.placement.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        User userDetails = (User) authentication.getPrincipal();
        
        return ResponseEntity.ok(new JwtResponse(
                jwt, 
                userDetails.getId(), 
                userDetails.getUsername(), 
                userDetails.getEmail(), 
                userDetails.getRole().name()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole())
                .build();

        if (signUpRequest.getRole() == Role.STUDENT) {
            // Save user first so we have an ID
            user = userRepository.save(user);

            // Create Student Profile
            Student student = Student.builder()
                    .user(user)
                    .fullName(signUpRequest.getFullName() != null ? signUpRequest.getFullName() : signUpRequest.getUsername())
                    .branch(signUpRequest.getBranch() != null ? signUpRequest.getBranch() : "CSE")
                    .cgpa(signUpRequest.getCgpa() != null ? signUpRequest.getCgpa() : 0.0)
                    .graduationYear(signUpRequest.getGraduationYear() != null ? signUpRequest.getGraduationYear() : 2026)
                    .skills("[]")
                    .certifications("[]")
                    .projects("[]")
                    .placementReadinessScore(30) // Default starting score
                    .build();

            studentRepository.save(student);

        } else if (signUpRequest.getRole() == Role.RECRUITER) {
            Company company;
            if (signUpRequest.getCompanyId() != null) {
                Optional<Company> optCompany = companyRepository.findById(signUpRequest.getCompanyId());
                if (optCompany.isEmpty()) {
                    return ResponseEntity.badRequest().body("Error: Company ID not found!");
                }
                company = optCompany.get();
            } else {
                // Create a new Company profile if name is provided
                String companyName = signUpRequest.getCompanyName() != null ? signUpRequest.getCompanyName() : "Company Inc.";
                Optional<Company> existingCompany = companyRepository.findByName(companyName);
                if (existingCompany.isPresent()) {
                    company = existingCompany.get();
                } else {
                    company = Company.builder()
                            .name(companyName)
                            .industry(signUpRequest.getCompanyIndustry() != null ? signUpRequest.getCompanyIndustry() : "IT & Software")
                            .build();
                    company = companyRepository.save(company);
                }
            }

            // Save user
            user = userRepository.save(user);

            // Create Recruiter Profile
            Recruiter recruiter = Recruiter.builder()
                    .user(user)
                    .company(company)
                    .designation(signUpRequest.getDesignation() != null ? signUpRequest.getDesignation() : "HR Specialist")
                    .phone(signUpRequest.getPhone() != null ? signUpRequest.getPhone() : "")
                    .build();

            recruiterRepository.save(recruiter);
        } else {
            // Admin role
            userRepository.save(user);
        }

        return ResponseEntity.ok("User registered successfully!");
    }
}
