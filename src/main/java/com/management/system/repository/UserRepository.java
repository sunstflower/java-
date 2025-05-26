package com.management.system.repository;

import com.management.system.model.User;// 对应model/User.java
import org.springframework.data.jpa.repository.JpaRepository;// JPA
import org.springframework.stereotype.Repository; //springboot仓库

import java.util.Optional; // 类似Rust的Option，但Rust的舒服多了

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username); // 根据用户名查找用户
    
    Optional<User> findByEmail(String email); // 根据邮箱查找用户
    
    Boolean existsByUsername(String username); // 判断用户名是否存在
    
    Boolean existsByEmail(String email); // 判断邮箱是否存在
} 