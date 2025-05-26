package com.management.system.model;

/* 
 * 学生表 子类 省流
 * {
 *  "studentId": 学生ID
 *  "classGroups": 班级组
 *  "username": 用户名
 *  "email": 邮箱
 *  "password": 密码
 *  "role": 角色
 *  "qrCodeSecret": 二维码密钥
 * }
 */ 

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "students")
public class Student extends User {
    
    private String studentId;
    
    @ManyToMany(fetch = FetchType.LAZY) // 懒加载 因为学生多
    @JoinTable( // 连接表  多对多 学生-班级组
        name = "student_classgroups", // 表名
        joinColumns = @JoinColumn(name = "student_id"), // 学生ID
        inverseJoinColumns = @JoinColumn(name = "classgroup_id") // 班级组ID
    )
    private Set<ClassGroup> classGroups = new HashSet<>(); // 班级组
    
    // NoArgsConstructor
    public Student() {
        super();
    }
    
    public Student(String username, String email, String password, String studentId) {
        super();
        this.setUsername(username);
        this.setEmail(email);
        this.setPassword(password);
        this.setRole(ERole.ROLE_STUDENT);
        this.studentId = studentId;
    }
    

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public Set<ClassGroup> getClassGroups() {
        return classGroups;
    }

    public void setClassGroups(Set<ClassGroup> classGroups) {
        this.classGroups = classGroups;
    }
} 