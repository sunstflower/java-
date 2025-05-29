package com.management.system.model;
/* 
 * 教师表 子类 省流
 * {
 *  "teacherId": 教师ID
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

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@EqualsAndHashCode(callSuper = true) // 是继承父类的
@Data
@Entity // JPA实体类
@Table(name = "teachers") 
public class Teacher extends User {
    
    private String teacherId;
    
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL) // 级联操作
    private Set<ClassGroup> classGroups = new HashSet<>(); // 班级组
    
    // 无参
    public Teacher() {
        super();
    }
    
    public Teacher(String username, String email, String password, String teacherId) {
        super();
        this.setUsername(username);
        this.setEmail(email);
        this.setPassword(password);
        this.setRole(ERole.ROLE_TEACHER);
        this.teacherId = teacherId;
    }
   
    
    public String getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(String teacherId) {
        this.teacherId = teacherId;
    }

    public Set<ClassGroup> getClassGroups() {
        return classGroups;
    }

    public void setClassGroups(Set<ClassGroup> classGroups) {
        this.classGroups = classGroups;
    }
} 