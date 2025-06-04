package com.management.system.repository;

import com.management.system.model.AttendanceCode;
import com.management.system.model.ClassGroup;
import com.management.system.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceCodeRepository extends JpaRepository<AttendanceCode, Long> {
    
    Optional<AttendanceCode> findByAttendanceCode(String attendanceCode);
    
    Optional<AttendanceCode> findByAttendanceCodeAndActiveTrue(String attendanceCode);
    
    Optional<AttendanceCode> findByAttendanceCodeAndActiveTrueAndExpiryTimeAfter(String attendanceCode, LocalDateTime now);
    
    List<AttendanceCode> findByClassGroup(ClassGroup classGroup);
    
    List<AttendanceCode> findByTeacher(Teacher teacher);
    
    List<AttendanceCode> findByClassGroupAndActiveTrue(ClassGroup classGroup);
    
    @Query("SELECT ac FROM AttendanceCode ac WHERE ac.classGroup = :classGroup AND ac.active = true AND ac.expiryTime > :now")
    List<AttendanceCode> findActiveAttendanceCodesByClassGroup(@Param("classGroup") ClassGroup classGroup, @Param("now") LocalDateTime now);
} 