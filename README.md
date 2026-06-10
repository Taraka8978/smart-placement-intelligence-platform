# 🧠 Smart Placement Intelligence Platform

An enterprise-grade, cognitive placement intelligence application that streamlines campus recruitment. The platform matches students with job descriptions using Jaccard skill overlaps, calculates academic readiness scores, automates recruiter pipeline screening, and provides administrator monitoring panels.

---

## 🚀 Key Features

### 🎓 Student Hub
* **Academic Profile Management**: Log CGPA, branch particulars, graduation class year, bios, and upload resumes.
* **Resume Upload & AI Skill Extraction**: Drag-and-drop or browse `.pdf`, `.txt`, and `.docx` files. Built-in JavaScript extraction and Java multipart handlers parse text files and simulate structure logs to extract skill tags.
* **Placement Readiness Score**: Radial gauges compute student employability probability based on CGPA compliance, skill density, projects, and certifications.
* **Application Timeline**: Track recruiter hiring decisions (Applied, Shortlisted, Selected, Rejected) with real-time NLP suitability feedback.

### 💼 Recruiter Portal
* **Placement Drive Manager**: Publish job opportunities with custom eligibility parameters (minimum CGPA, target branches, required skillsets).
* **Funnel Analytics**: Gauge student enrollment, candidate application volume, and final placement rates.
* **Screening Board**: Drag-and-drop or select applicant cards to shortlist, reject, or select candidates.
* **Pipeline Scheduler**: Automate interview booking with meeting rooms and venue links.

### 🛡️ Administrator Panel
* **Student & Recruiter Auditing**: Search, list, and edit active profiles across the university campus.
* **Branch-wise Statistics**: Dynamic dashboard charts visualizing placement ratios across departments.
* **System Infrastructure Monitor**: Real-time server diagnostics reporting CPU load, JVM memory utilization, database pool size, and endpoint latency.
* **Placement Reports**: Compile, generate, and compile downloadable PDF reports.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Tailwind CSS (v4) with Obsidian light-theme styling.
* **Backend**: Spring Boot 3.3.0, Spring Security (JWT authentication), JPA Hibernate.
* **Database**: H2 (development in-memory) / MySQL (production).
* **Build System**: Apache Maven 3.9+ and Node.js.
* **Java Target**: Java 21.

---

## 📂 Project Structure

```
smart-placement-intelligence-platform/
│
├── backend/                       # Spring Boot REST API Service
│   ├── pom.xml                    # Maven configuration & Lombok dependencies
│   ├── src/main/java/             # Source Java classes
│   │   └── com/enterprise/placement/
│   │       ├── config/            # Security & Database Seed configurations
│   │       ├── controller/        # Auth, Student, Recruiter, and Admin REST endpoints
│   │       ├── dto/               # Data Transfer Objects (Payload requests)
│   │       ├── model/             # JPA entities (User, Student, JobDrive, Application)
│   │       ├── repository/        # Spring Data JPA Repository interfaces
│   │       └── service/           # AIService (Suitability matching & readiness metrics)
│   └── src/main/resources/        # application.yml
│
├── frontend/                      # React SPA Client
│   ├── package.json
│   ├── vite.config.ts             # Vite configurations
│   ├── index.html                 # Google Font links (Plus Jakarta Sans & Space Grotesk)
│   └── src/
│       ├── context/               # AuthContext (role routing & localStorage fallback DB)
│       ├── pages/                 # Student, Recruiter, Admin dashboards, and Auth pages
│       └── index.css              # Custom light SaaS theme overrides
│
├── run_backend.ps1                # Automation runner setting JAVA_HOME to JDK 21
└── start_platform.ps1             # Concurrent runner orchestrating frontend and backend
```

---

## 💻 Setup & Execution Guide

### Prerequisites
* **Java**: JDK 21+ (compilation and Lombok support).
* **Node.js**: LTS version.

### Quick Start (PowerShell Orchestrator)
The root repository contains automation scripts to bootstrap and run both projects concurrently. In your terminal, run:

```powershell
./start_platform.ps1
```
*This will automatically configure `JAVA_HOME` to JDK 21, bootstrap dependencies, launch the Spring Boot backend in a separate window, and start the React dev server in your current window.*

---

## 🔑 Pre-Seeded Test Credentials

You can test all dashboard roles immediately using these seeded accounts:

| Console | Username | Password | Notes |
|---------|----------|----------|-------|
| **Administrator** | `admin` | `password` | University Admin auditing credentials |
| **Student** | `student1` | `password` | Seeded Computer Science student profile |
| **Recruiter (Google)** | `google_hr` | `password` | Google talent acquisition manager console |
| **Recruiter (Microsoft)** | `msft_hr` | `password` | Microsoft campus hiring drive console |

---

## 🧠 Cognitive Suitability Formulas

The backend uses a Jaccard overlap suitability algorithm (`AIService.java`):

* **Resume Match Score**:
  $$\text{Match Ratio} = (\text{Skills Overlap} \times 70\%) + (\text{CGPA Compliance} \times 30\%)$$
  
* **Placement Probability**:
  $$\text{Placement Readiness} = (\text{CGPA} \times 6.5) + (\text{Skills Count} \times 1.5) + (\text{Projects} \times 4) + (\text{Certifications} \times 3)$$
