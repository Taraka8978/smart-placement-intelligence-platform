package com.enterprise.placement.repository;

import com.enterprise.placement.model.JobDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobDriveRepository extends JpaRepository<JobDrive, Long> {
    List<JobDrive> findByCreatedById(Long recruiterId);
    List<JobDrive> findByStatus(JobDrive.DriveStatus status);
}
