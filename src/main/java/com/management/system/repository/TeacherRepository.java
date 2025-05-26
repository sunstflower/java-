package com.management.system.repository;

import com.management.system.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByTeacherId(String teacherId); // 根据教师ID查找教师
    
    Optional<Teacher> findByUsername(String username); // 根据用户名查找教师
} 