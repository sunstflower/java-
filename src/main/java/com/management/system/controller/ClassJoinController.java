package com.management.system.controller;

import com.management.system.model.ClassGroup;
import com.management.system.model.ClassJoinCode;
import com.management.system.model.ERole;
import com.management.system.model.Student;
import com.management.system.model.Teacher;
import com.management.system.model.User;
import com.management.system.payload.response.MessageResponse;
import com.management.system.repository.ClassGroupRepository;
import com.management.system.repository.StudentRepository;
import com.management.system.repository.UserRepository;
import com.management.system.security.UserDetailsImpl;
import com.management.system.service.ClassJoinCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/class-join")
public class ClassJoinController {
    
    @Autowired
    private ClassJoinCodeService classJoinCodeService;
    
    @Autowired
    private ClassGroupRepository classGroupRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder encoder;

    /**
     * 教师为班级生成加入码
     */
    @PostMapping("/generate/{classGroupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> generateJoinCode(@PathVariable Long classGroupId, Authentication authentication) {
        try {
            Optional<ClassGroup> classGroupOpt = classGroupRepository.findById(classGroupId);
            if (classGroupOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("班级不存在"));
            }
            
            ClassGroup classGroup = classGroupOpt.get();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // 验证教师是否有权限管理该班级
            if (!classGroup.getTeacher().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("您没有权限管理该班级"));
            }
            
            ClassJoinCode joinCode = classJoinCodeService.generateJoinCodeForClass(classGroup);
            String qrImage = classJoinCodeService.generateJoinCodeQRImage(joinCode.getJoinCode());
            
            Map<String, Object> response = new HashMap<>();
            response.put("joinCode", joinCode.getJoinCode());
            response.put("qrImage", "data:image/png;base64," + qrImage);
            response.put("expiryTime", joinCode.getExpiryTime());
            response.put("classGroup", classGroup.getName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("生成加入码失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取班级的加入码信息
     */
    @GetMapping("/info/{classGroupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getJoinCodeInfo(@PathVariable Long classGroupId, Authentication authentication) {
        try {
            Optional<ClassGroup> classGroupOpt = classGroupRepository.findById(classGroupId);
            if (classGroupOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("班级不存在"));
            }
            
            ClassGroup classGroup = classGroupOpt.get();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            if (!classGroup.getTeacher().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("您没有权限查看该班级信息"));
            }
            
            Optional<ClassJoinCode> joinCodeOpt = classJoinCodeService.getJoinCodeByClass(classGroup);
            if (joinCodeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("该班级尚未生成加入码"));
            }
            
            ClassJoinCode joinCode = joinCodeOpt.get();
            String qrImage = classJoinCodeService.generateJoinCodeQRImage(joinCode.getJoinCode());
            
            Map<String, Object> response = new HashMap<>();
            response.put("joinCode", joinCode.getJoinCode());
            response.put("qrImage", "data:image/png;base64," + qrImage);
            response.put("expiryTime", joinCode.getExpiryTime());
            response.put("active", joinCode.isActive());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("获取加入码信息失败: " + e.getMessage()));
        }
    }
    
    /**
     * 学生通过加入码申请加入班级（支持新用户自动注册）
     */
    @PostMapping("/join")
    public ResponseEntity<?> joinClass(@RequestBody Map<String, String> request) {
        try {
            String joinCode = request.get("joinCode");
            String studentName = request.get("studentName");
            String studentId = request.get("studentId");
            String password = request.get("password");
            
            if (joinCode == null || studentName == null || studentId == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("请提供完整的信息"));
            }
            
            // 验证加入码
            Optional<ClassGroup> classGroupOpt = classJoinCodeService.verifyJoinCode(joinCode);
            if (classGroupOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("加入码无效或已过期"));
            }
            
            ClassGroup classGroup = classGroupOpt.get();
            
            // 查找现有学生账号
            Optional<Student> existingStudent = studentRepository.findByUsername(studentName);
            Student student;
            
            if (existingStudent.isPresent()) {
                // 用户已存在，验证密码
                if (password == null || !encoder.matches(password, existingStudent.get().getPassword())) {
                    return ResponseEntity.badRequest().body(new MessageResponse("用户名已存在，密码错误"));
                }
                
                student = existingStudent.get();
            } else {
                // 用户不存在，创建新学生记录
                if (password == null) {
                    return ResponseEntity.badRequest().body(new MessageResponse("新用户必须提供密码"));
                }
                
                // 检查学号是否已存在
                if (studentRepository.findByStudentId(studentId).isPresent()) {
                    return ResponseEntity.badRequest().body(new MessageResponse("学号已存在"));
                }
                
                // 创建新学生
                student = new Student();
                student.setUsername(studentName);
                student.setEmail(studentName.contains("@") ? studentName : studentName + "@student.edu.cn"); // 确保邮箱格式正确
                student.setPassword(encoder.encode(password));
                student.setRole(ERole.ROLE_STUDENT);
                student.setStudentId(studentId);
                
                // 验证邮箱格式
                String email = student.getEmail();
                if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                    student.setEmail(studentId + "@student.edu.cn");
                }
                
                student = studentRepository.save(student);
            }
            
            // 检查学生是否已在班级中
            if (classGroup.getStudents().contains(student)) {
                return ResponseEntity.badRequest().body(new MessageResponse("您已经在该班级中"));
            }
            
            // 添加学生到班级
            classGroup.getStudents().add(student);
            classGroupRepository.save(classGroup);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "成功加入班级: " + classGroup.getName());
            response.put("className", classGroup.getName());
            response.put("teacherName", classGroup.getTeacher().getUsername());
            response.put("isNewUser", !existingStudent.isPresent());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("加入班级失败: " + e.getMessage()));
        }
    }
} 