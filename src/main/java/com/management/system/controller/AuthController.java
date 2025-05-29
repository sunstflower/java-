package com.management.system.controller;

/* 
 * 登录,注册,权限,认证
*/

import com.management.system.model.ERole;
import com.management.system.model.Student;
import com.management.system.model.Teacher;
import com.management.system.model.User;
import com.management.system.payload.request.LoginRequest;
import com.management.system.payload.request.SignupRequest;
import com.management.system.payload.response.JwtResponse;
import com.management.system.payload.response.MessageResponse;
import com.management.system.repository.StudentRepository;
import com.management.system.repository.TeacherRepository;
import com.management.system.repository.UserRepository;
import com.management.system.security.JwtTokenUtil;
import com.management.system.security.UserDetailsImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // 响应实体
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication; 
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;  // 认证管理器

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    TeacherRepository teacherRepository;

    @Autowired
    PasswordEncoder encoder;  // 密码编码器

    @Autowired
    JwtTokenUtil jwtTokenUtil;  // JWT工具类生成

    @PostMapping("/login")   /* @param loginRequest 前端传入的登录请求 */
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication); // 设置成安全上下文
        String jwt = jwtTokenUtil.generateJwtToken(authentication); // 生成JWT

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); // 获取用户详情

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getAuthorities().toString()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) { // 注册 
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));  // 用户名已存在
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));  // 邮箱重复
        }

        // 创建新用户
        if (signUpRequest.getRole() == ERole.ROLE_STUDENT) {
            Student student = new Student(
                    signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    encoder.encode(signUpRequest.getPassword()),
                    signUpRequest.getUserId());
            studentRepository.save(student);
        } else if (signUpRequest.getRole() == ERole.ROLE_TEACHER) {
            Teacher teacher = new Teacher(
                    signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    encoder.encode(signUpRequest.getPassword()),
                    signUpRequest.getUserId());
            teacherRepository.save(teacher);
        } else {
            User user = new User();
            user.setUsername(signUpRequest.getUsername());
            user.setEmail(signUpRequest.getEmail());
            user.setPassword(encoder.encode(signUpRequest.getPassword()));
            user.setRole(signUpRequest.getRole());
            userRepository.save(user);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
} 