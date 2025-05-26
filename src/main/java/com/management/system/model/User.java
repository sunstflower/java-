package com.management.system.model;
/*  
 * 用户表 父类 省流
 * {
 *  "id": 主键
 *  "username": 用户名
 *  "email": 邮箱
 *  "password": 密码
 *  "role": 角色
 *  "qrCodeSecret": 二维码密钥
 * }
 */

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*; // 生命周期持久化
import javax.validation.constraints.Email;    
import javax.validation.constraints.NotBlank; // 非空
import javax.validation.constraints.Size; // 大小   

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity // JPA实体类
@Table(name = "users", // 表名
       uniqueConstraints = { // 唯一约束
           @UniqueConstraint(columnNames = "username"), // 用户名唯一
           @UniqueConstraint(columnNames = "email") // 邮箱唯一
       })
@Inheritance(strategy = InheritanceType.JOINED) // 继承策略-单表继承
public class User {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增
    private Long id;

    @NotBlank 
    @Size(max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 120)
    private String password;

    @Enumerated(EnumType.STRING) // enum 比Typescript和rust的都复杂
    private ERole role;

    private String qrCodeSecret;
    
    // lombok 
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public ERole getRole() {
        return role;
    }

    public void setRole(ERole role) {
        this.role = role;
    }

    public String getQrCodeSecret() {   // 获取二维码密钥
        return qrCodeSecret;
    }

    public void setQrCodeSecret(String qrCodeSecret) { // 设置二维码密钥    
        this.qrCodeSecret = qrCodeSecret;
    }
} 