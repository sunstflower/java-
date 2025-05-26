package com.management.system.model;
/* 
 * 二维码表 省流
 * {
 *  "id": 主键
 *  "student": 学生
 *  "code": 二维码
 *  "generatedTime": 生成时间
 *  "expiryTime": 过期时间
 *  "used": 是否使用
 * }
 */

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity // JPA实体类
@Table(name = "qr_codes") 
public class QRCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;
    
    @ManyToOne // 多对一 学生-二维码
    @JoinColumn(name = "student_id")
    private Student student;
    
    private String code;
    
    /* 以下这三是payload */
    private LocalDateTime generatedTime;     // 生成时间
    
    private LocalDateTime expiryTime; // 过期时间
    
    private boolean used; // 是否使用
    
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
} 