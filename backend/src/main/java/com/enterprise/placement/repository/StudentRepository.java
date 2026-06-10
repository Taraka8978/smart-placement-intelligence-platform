package com.enterprise.placement.repository;

import com.enterprise.placement.model.Student;
import com.enterprise.placement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    List<Student> findByBranch(String branch);
}
