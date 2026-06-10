package com.enterprise.placement.repository;

import com.enterprise.placement.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    List<Application> findByJobDriveId(Long jobDriveId);
    List<Application> findByJobDriveCreatedById(Long recruiterId);
    Optional<Application> findByJobDriveIdAndStudentId(Long jobDriveId, Long studentId);
    long countByStatus(Application.ApplicationStatus status);
}
