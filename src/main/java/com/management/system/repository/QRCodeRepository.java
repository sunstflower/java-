package com.management.system.repository;

import com.management.system.model.QRCode;
import com.management.system.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QRCodeRepository extends JpaRepository<QRCode, Long> {
    Optional<QRCode> findByCode(String code);
    
    List<QRCode> findByStudent(Student student); 
    
    List<QRCode> findByStudentAndUsedFalse(Student student);
    
    List<QRCode> findByExpiryTimeBefore(LocalDateTime time);
    
    Optional<QRCode> findByCodeAndUsedFalseAndExpiryTimeAfter(String code, LocalDateTime now);
} 