package com.management.system.repository;
/* 
 * 班级组仓库
 * 
 */

import com.management.system.model.ClassGroup;
import com.management.system.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;  //`
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassGroupRepository extends JpaRepository<ClassGroup, Long> {
    List<ClassGroup> findByTeacher(Teacher teacher);
    /* 进行 班级组 的 查询  */
    
    @Query("SELECT DISTINCT cg FROM ClassGroup cg LEFT JOIN FETCH cg.students WHERE cg.teacher.id = :teacherId")
    List<ClassGroup> findByTeacherIdWithStudents(@Param("teacherId") Long teacherId);  
    
    List<ClassGroup> findByTeacherId(Long teacherId);
    
    @Query("SELECT DISTINCT cg FROM ClassGroup cg LEFT JOIN FETCH cg.students WHERE cg.id = :id")
    Optional<ClassGroup> findByIdWithStudents(@Param("id") Long id);
    
    List<ClassGroup> findByNameContaining(String name);
} 