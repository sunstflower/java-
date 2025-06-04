package com.management.system.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 考勤码实体类
 * 教师生成考勤码，学生扫描进行考勤打卡
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance_codes")
public class AttendanceCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_group_id")
    private ClassGroup classGroup;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
    
    @Column(unique = true, nullable = false)
    private String attendanceCode;
    
    private String description; // 考勤描述，如"第1节课"
    
    private LocalDateTime generatedTime;
    
    private LocalDateTime expiryTime; // 考勤截止时间
    
    private boolean active = true;
    
    // 已签到的学生
    @ManyToMany
    @JoinTable(
        name = "attendance_records",
        joinColumns = @JoinColumn(name = "attendance_code_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<Student> attendedStudents = new HashSet<>();
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ClassGroup getClassGroup() {
        return classGroup;
    }

    public void setClassGroup(ClassGroup classGroup) {
        this.classGroup = classGroup;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public String getAttendanceCode() {
        return attendanceCode;
    }

    public void setAttendanceCode(String attendanceCode) {
        this.attendanceCode = attendanceCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getGeneratedTime() {
        return generatedTime;
    }

    public void setGeneratedTime(LocalDateTime generatedTime) {
        this.generatedTime = generatedTime;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Set<Student> getAttendedStudents() {
        return attendedStudents;
    }

    public void setAttendedStudents(Set<Student> attendedStudents) {
        this.attendedStudents = attendedStudents;
    }
} 