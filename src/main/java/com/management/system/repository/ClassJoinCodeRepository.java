package com.management.system.repository;

import com.management.system.model.ClassGroup;
import com.management.system.model.ClassJoinCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ClassJoinCodeRepository extends JpaRepository<ClassJoinCode, Long> {
    
    Optional<ClassJoinCode> findByJoinCode(String joinCode);
    
    Optional<ClassJoinCode> findByClassGroup(ClassGroup classGroup);
    
    Optional<ClassJoinCode> findByJoinCodeAndActiveTrue(String joinCode);
    
    Optional<ClassJoinCode> findByJoinCodeAndActiveTrueAndExpiryTimeAfter(String joinCode, LocalDateTime now);
} 