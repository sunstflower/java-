package com.management.system.service;

import com.management.system.model.ClassGroup;
import com.management.system.model.Student;
import com.management.system.model.Teacher;
import com.management.system.repository.ClassGroupRepository;
import com.management.system.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClassGroupService {
    
    @Autowired
    private ClassGroupRepository classGroupRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    public List<ClassGroup> getAllClassGroups() {
        return classGroupRepository.findAll();
    }
    
    public Optional<ClassGroup> getClassGroupById(Long id) {
        return classGroupRepository.findById(id);
    }
    
    public List<ClassGroup> getClassGroupsByTeacher(Teacher teacher) {
        return classGroupRepository.findByTeacher(teacher);
    }
    
    public ClassGroup createClassGroup(ClassGroup classGroup) {
        return classGroupRepository.save(classGroup);
    }
    
    public ClassGroup updateClassGroup(ClassGroup classGroup) {
        return classGroupRepository.save(classGroup);
    }
    
    public void deleteClassGroup(Long id) {
        classGroupRepository.deleteById(id);
    }
    
    @Transactional
    public void addStudentToClassGroup(Long classGroupId, Long studentId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        student.getClassGroups().add(classGroup);
        classGroup.getStudents().add(student);
        
        studentRepository.save(student);
        classGroupRepository.save(classGroup);
    }
    
    @Transactional
    public void removeStudentFromClassGroup(Long classGroupId, Long studentId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        student.getClassGroups().remove(classGroup);
        classGroup.getStudents().remove(student);
        
        studentRepository.save(student);
        classGroupRepository.save(classGroup);
    }
} 