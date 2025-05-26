package com.management.system.repository;

import com.management.system.model.Attendance;
import com.management.system.model.ClassGroup;
import com.management.system.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent(Student student);
    
    List<Attendance> findByClassGroup(ClassGroup classGroup);
    
    List<Attendance> findByClassGroupAndCheckInTimeBetween(
        ClassGroup classGroup, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    );
    
    List<Attendance> findByStudentAndCheckInTimeBetween(
        Student student, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    );

    
    List<Attendance> findByStudentAndClassGroup(Student student, ClassGroup classGroup);

} 