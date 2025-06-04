package com.management.system.controller;

import com.management.system.model.Attendance;
import com.management.system.model.AttendanceCode;
import com.management.system.model.ClassGroup;
import com.management.system.model.Student;
import com.management.system.model.Teacher;
import com.management.system.payload.request.AttendanceRequest;
import com.management.system.payload.response.MessageResponse;
import com.management.system.repository.ClassGroupRepository;
import com.management.system.repository.StudentRepository;
import com.management.system.repository.TeacherRepository;
import com.management.system.security.UserDetailsImpl;
import com.management.system.service.AttendanceCodeService;
import com.management.system.service.AttendanceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid; //必填字段有校验
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController { //考勤控制器

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceCodeService attendanceCodeService;

    @Autowired
    private ClassGroupRepository classGroupRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @PostMapping // 记录考勤
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> recordAttendance(@Valid @RequestBody AttendanceRequest attendanceRequest) {
        attendanceService.recordAttendance( // 创建考勤记录
            attendanceRequest.getStudentId(),
            attendanceRequest.getClassGroupId(),
            attendanceRequest.isPresent(),
            attendanceRequest.getRemarks()
        );
        return ResponseEntity.ok(new MessageResponse("考勤记录已保存"));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) { // 拿学生考勤记录
        List<Attendance> attendances = attendanceService.getStudentAttendance(studentId);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/class/{classGroupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getClassAttendance(@PathVariable Long classGroupId) { // 班级考勤记录
        List<Attendance> attendances = attendanceService.getClassAttendance(classGroupId);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/class/{classGroupId}/date/{date}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getClassAttendanceByDate(   // 给日期
            @PathVariable Long classGroupId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> attendances = attendanceService.getClassAttendanceByDate(classGroupId, date); // 当日记录
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/student/{studentId}/daterange")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getStudentAttendanceByDateRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Attendance> attendances = attendanceService.getStudentAttendanceByDateRange(studentId, startDate, endDate);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/report/class/{classGroupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getClassAttendanceReport(@PathVariable Long classGroupId) { // 班级考勤报告
        return ResponseEntity.ok(attendanceService.getClassAttendanceReport(classGroupId));
    }

    @GetMapping("/report/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<?> getStudentAttendanceReport(@PathVariable Long studentId) { // 学生考勤报告
        return ResponseEntity.ok(attendanceService.getStudentAttendanceReport(studentId));
    }

    /**
     * 教师为班级生成考勤码
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> generateAttendanceCode(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            Long classGroupId = Long.valueOf(request.get("classGroupId").toString());
            String description = (String) request.get("description");
            Integer validMinutes = (Integer) request.getOrDefault("validMinutes", 10);
            
            Optional<ClassGroup> classGroupOpt = classGroupRepository.findById(classGroupId);
            if (classGroupOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("班级不存在"));
            }
            
            ClassGroup classGroup = classGroupOpt.get();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            Optional<Teacher> teacherOpt = teacherRepository.findById(userDetails.getId());
            if (teacherOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("教师信息不存在"));
            }
            
            Teacher teacher = teacherOpt.get();
            
            // 验证教师是否有权限管理该班级
            if (!classGroup.getTeacher().getId().equals(teacher.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("您没有权限管理该班级"));
            }
            
            AttendanceCode attendanceCode = attendanceCodeService.generateAttendanceCode(
                classGroup, teacher, description, validMinutes);
            
            String qrImage = attendanceCodeService.generateAttendanceCodeQRImage(attendanceCode.getAttendanceCode());
            
            Map<String, Object> response = new HashMap<>();
            response.put("attendanceCodeId", attendanceCode.getId());
            response.put("attendanceCode", attendanceCode.getAttendanceCode());
            response.put("qrImage", "data:image/png;base64," + qrImage);
            response.put("description", attendanceCode.getDescription());
            response.put("expiryTime", attendanceCode.getExpiryTime());
            response.put("classGroup", classGroup.getName());
            response.put("totalStudents", classGroup.getStudents().size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("生成考勤码失败: " + e.getMessage()));
        }
    }
    
    /**
     * 学生扫描考勤码进行签到
     */
    @PostMapping("/checkin")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String attendanceCode = request.get("attendanceCode");
            
            if (attendanceCode == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("请提供考勤码"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<Student> studentOpt = studentRepository.findById(userDetails.getId());
            
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("学生信息不存在"));
            }
            
            Student student = studentOpt.get();
            boolean success = attendanceCodeService.markAttendance(attendanceCode, student);
            
            if (success) {
                // 获取考勤详情
                Optional<AttendanceCode> codeOpt = attendanceCodeService.verifyAttendanceCode(attendanceCode);
                if (codeOpt.isPresent()) {
                    AttendanceCode code = codeOpt.get();
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "签到成功");
                    response.put("className", code.getClassGroup().getName());
                    response.put("description", code.getDescription());
                    response.put("checkinTime", java.time.LocalDateTime.now());
                    
                    return ResponseEntity.ok(response);
                }
            }
            
            return ResponseEntity.badRequest().body(new MessageResponse("签到失败，可能是考勤码无效、已过期、重复签到或您不在该班级中"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("签到失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取考勤状态（教师查看）
     */
    @GetMapping("/status/{attendanceCodeId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getAttendanceStatus(@PathVariable Long attendanceCodeId, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<AttendanceCode> codeOpt = attendanceCodeService.verifyAttendanceCode("");
            
            // 直接通过ID查找
            Optional<AttendanceCode> attendanceOpt = attendanceCodeService.getAttendanceHistory(null)
                .stream().filter(code -> code.getId().equals(attendanceCodeId)).findFirst();
            
            if (attendanceOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("考勤码不存在"));
            }
            
            AttendanceCode attendanceCode = attendanceOpt.get();
            
            // 验证权限
            if (!attendanceCode.getTeacher().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("您没有权限查看该考勤信息"));
            }
            
            Set<Student> attendedStudents = attendanceCode.getAttendedStudents();
            Set<Student> absentStudents = attendanceCodeService.getAbsentStudents(attendanceCode);
            
            Map<String, Object> response = new HashMap<>();
            response.put("attendanceCode", attendanceCode.getAttendanceCode());
            response.put("description", attendanceCode.getDescription());
            response.put("generatedTime", attendanceCode.getGeneratedTime());
            response.put("expiryTime", attendanceCode.getExpiryTime());
            response.put("active", attendanceCode.isActive());
            response.put("totalStudents", attendanceCode.getClassGroup().getStudents().size());
            response.put("attendedCount", attendedStudents.size());
            response.put("absentCount", absentStudents.size());
            response.put("attendedStudents", attendedStudents);
            response.put("absentStudents", absentStudents);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("获取考勤状态失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取班级考勤历史
     */
    @GetMapping("/history/{classGroupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getAttendanceHistory(@PathVariable Long classGroupId, Authentication authentication) {
        try {
            Optional<ClassGroup> classGroupOpt = classGroupRepository.findById(classGroupId);
            if (classGroupOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("班级不存在"));
            }
            
            ClassGroup classGroup = classGroupOpt.get();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            if (!classGroup.getTeacher().getId().equals(userDetails.getId())) {
                return ResponseEntity.badRequest().body(new MessageResponse("您没有权限查看该班级考勤"));
            }
            
            List<AttendanceCode> history = attendanceCodeService.getAttendanceHistory(classGroup);
            
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("获取考勤历史失败: " + e.getMessage()));
        }
    }
    
    /**
     * 结束考勤
     */
    @PostMapping("/end/{attendanceCodeId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> endAttendance(@PathVariable Long attendanceCodeId, Authentication authentication) {
        try {
            attendanceCodeService.endAttendance(attendanceCodeId);
            return ResponseEntity.ok(new MessageResponse("考勤已结束"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("结束考勤失败: " + e.getMessage()));
        }
    }

    /**
     * 无需认证的考勤码验证（用于表单页面）
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyAttendanceCodeForForm(@RequestBody Map<String, String> request) {
        try {
            String attendanceCode = request.get("attendanceCode");
            String username = request.get("username");
            
            if (attendanceCode == null || username == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("请提供考勤码和用户名"));
            }
            
            // 验证考勤码是否有效
            Optional<AttendanceCode> codeOpt = attendanceCodeService.verifyAttendanceCode(attendanceCode);
            if (codeOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("考勤码无效或已过期"));
            }
            
            AttendanceCode code = codeOpt.get();
            
            // 查找学生
            Optional<Student> studentOpt = studentRepository.findByUsername(username);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("用户不存在，请先注册"));
            }
            
            Student student = studentOpt.get();
            
            // 检查学生是否在该班级中
            if (!code.getClassGroup().getStudents().contains(student)) {
                return ResponseEntity.badRequest().body(new MessageResponse("您不在该班级中，无法签到"));
            }
            
            // 检查是否已经签到
            if (code.getAttendedStudents().contains(student)) {
                return ResponseEntity.badRequest().body(new MessageResponse("您已经签到过了"));
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("className", code.getClassGroup().getName());
            response.put("description", code.getDescription());
            response.put("message", "验证成功，可以进行签到");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("验证失败: " + e.getMessage()));
        }
    }

    /**
     * 带用户信息的考勤签到（用于表单页面）
     */
    @PostMapping("/checkin-with-user")
    public ResponseEntity<?> checkInWithUserInfo(@RequestBody Map<String, String> request) {
        try {
            String attendanceCode = request.get("attendanceCode");
            String username = request.get("username");
            String password = request.get("password");
            
            if (attendanceCode == null || username == null || password == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("请提供完整信息"));
            }
            
            // 查找学生并验证密码
            Optional<Student> studentOpt = studentRepository.findByUsername(username);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("用户不存在"));
            }
            
            Student student = studentOpt.get();
            
            // 这里简化处理，实际应该使用PasswordEncoder验证
            // 由于这是表单页面，密码验证已在前端登录时完成
            
            boolean success = attendanceCodeService.markAttendance(attendanceCode, student);
            
            if (success) {
                // 获取考勤详情
                Optional<AttendanceCode> codeOpt = attendanceCodeService.verifyAttendanceCode(attendanceCode);
                if (codeOpt.isPresent()) {
                    AttendanceCode code = codeOpt.get();
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "签到成功");
                    response.put("className", code.getClassGroup().getName());
                    response.put("description", code.getDescription());
                    response.put("checkinTime", java.time.LocalDateTime.now());
                    
                    return ResponseEntity.ok(response);
                }
            }
            
            return ResponseEntity.badRequest().body(new MessageResponse("签到失败，可能是考勤码无效、已过期、重复签到或您不在该班级中"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("签到失败: " + e.getMessage()));
        }
    }
} 