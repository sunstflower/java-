package com.management.system.model;
/*  
 * 考勤表 省流
 * {
 *  "id": 主键
 *  "student": 学生
 *  "classGroup": 班级
 *  "checkInTime": 签到时间
 *  "present": 是否出席
 *  "remarks": 备注
 * }
 */

import lombok.AllArgsConstructor;   // 所有参数的构造函数
import lombok.Data;                 // 所有属性的getter和setter方法
import lombok.NoArgsConstructor;    // 无参数的构造函数

import javax.persistence.*;    // 持久化相关的注解
import java.time.LocalDateTime; // 日期时间相关的类

// 考勤类
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity // 实体类
@Table(name = "attendance") // 表名
public class Attendance {
    @Id // 主键
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增
    private Long id;
    
    @ManyToOne // 多对一关系
    @JoinColumn(name = "student_id")
    private Student student; // 学生
    
    @ManyToOne // 多对一关系
    @JoinColumn(name = "class_group_id")
    private ClassGroup classGroup; // 班级
    
    private LocalDateTime checkInTime; // 签到时间
    
    private boolean present; // 是否出席
    
    // 备注，如迟到、早退等
    private String remarks;
    
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) { // 设置主键
        this.id = id;
    }

    public Student getStudent() { // 获取学生
        return student;
    }

    public void setStudent(Student student) { // 设置学生
        this.student = student;
    }

    public ClassGroup getClassGroup() { // 获取班级
        return classGroup;
    }

    public void setClassGroup(ClassGroup classGroup) { // 设置班级
        this.classGroup = classGroup;
    }

    public LocalDateTime getCheckInTime() { // 获取签到时间
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) { // 设置签到时间
        this.checkInTime = checkInTime;
    }

    public boolean isPresent() { // 是否出席
        return present;
    }

    public void setPresent(boolean present) { // 设置是否出席
        this.present = present;
    }

    public String getRemarks() { // 获取备注
        return remarks;
    }

    public void setRemarks(String remarks) { // 设置备注
        this.remarks = remarks;
    }
} 