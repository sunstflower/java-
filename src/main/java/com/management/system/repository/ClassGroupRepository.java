package com.management.system.repository;
/* 
 * 班级组仓库
 * 
 */

import com.management.system.model.ClassGroup;
import com.management.system.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassGroupRepository extends JpaRepository<ClassGroup, Long> {
    List<ClassGroup> findByTeacher(Teacher teacher);
    
    List<ClassGroup> findByTeacherId(Long teacherId);
    
    List<ClassGroup> findByNameContaining(String name);
} 