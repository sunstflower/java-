package com.management.system.model;
/* 
 * 班级组表 省流
 * {
 *  "id": 主键
 *  "name": 班级名称
 *  "description": 班级描述
 *  "teacher": 教师
 *  "students": 学生
 * }    
 */

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity // JPA实体类
@Table(name = "class_groups") 
public class ClassGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank 
    private String name; // 班级名称

    private String description; // 班级描述

    @ManyToOne // 多对一 教师-班级组
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @ManyToMany(mappedBy = "classGroups", fetch = FetchType.LAZY) // 多对多 学生-班级组,懒加载学生多
    private Set<Student> students = new HashSet<>(); 
    
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

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public Set<Student> getStudents() {
        return students;
    }

    public void setStudents(Set<Student> students) {
        this.students = students;
    }
} 