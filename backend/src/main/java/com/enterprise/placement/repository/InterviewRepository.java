package com.enterprise.placement.repository;

import com.enterprise.placement.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationStudentId(Long studentId);
    List<Interview> findByRecruiterId(Long recruiterId);
    List<Interview> findByApplicationId(Long applicationId);
}
