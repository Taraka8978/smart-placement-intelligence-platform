package com.enterprise.placement.repository;

import com.enterprise.placement.model.Recruiter;
import com.enterprise.placement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {
    Optional<Recruiter> findByUser(User user);
    Optional<Recruiter> findByUserId(Long userId);
    List<Recruiter> findByCompanyId(Long companyId);
}
