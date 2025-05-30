package com.management.system.dto;

import com.management.system.model.ClassGroup;
import com.management.system.model.Student;

import java.util.Set;
import java.util.stream.Collectors;

public class ClassGroupDTO {
    private Long id;
    private String name;
    private String description;
    private Set<StudentDTO> students;

    public ClassGroupDTO() {}

    public ClassGroupDTO(ClassGroup classGroup) {
        this.id = classGroup.getId();
        this.name = classGroup.getName();
        this.description = classGroup.getDescription();
        this.students = classGroup.getStudents().stream()
                .map(StudentDTO::new)
                .collect(Collectors.toSet());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<StudentDTO> getStudents() {
        return students;
    }

    public void setStudents(Set<StudentDTO> students) {
        this.students = students;
    }

    // 简化的StudentDTO内部类
    public static class StudentDTO {
        private Long id;
        private String username;
        private String studentId;

        public StudentDTO() {}

        public StudentDTO(Student student) {
            this.id = student.getId();
            this.username = student.getUsername();
            this.studentId = student.getStudentId();
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getStudentId() {
            return studentId;
        }

        public void setStudentId(String studentId) {
            this.studentId = studentId;
        }
    }
} 