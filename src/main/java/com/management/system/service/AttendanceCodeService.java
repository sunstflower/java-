package com.management.system.service;

import com.management.system.model.AttendanceCode;
import com.management.system.model.ClassGroup;
import com.management.system.model.Student;
import com.management.system.model.Teacher;
import com.management.system.repository.AttendanceCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 考勤码服务
 * 处理考勤码的生成、验证和考勤记录管理
 */
@Service
public class AttendanceCodeService {
    
    @Autowired
    private AttendanceCodeRepository attendanceCodeRepository;
    
    @Autowired
    private QRCodeService qrCodeService;
    
    @Autowired
    private AttendanceService attendanceService;
    
    /**
     * 教师为班级生成考勤码
     */
    public AttendanceCode generateAttendanceCode(ClassGroup classGroup, Teacher teacher, String description, int validMinutes) {
        String attendanceCode = generateUniqueAttendanceCode();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusMinutes(validMinutes); // 默认10分钟有效期
        
        AttendanceCode code = new AttendanceCode();
        code.setClassGroup(classGroup);
        code.setTeacher(teacher);
        code.setAttendanceCode(attendanceCode);
        code.setDescription(description);
        code.setGeneratedTime(now);
        code.setExpiryTime(expiryTime);
        code.setActive(true);
        
        return attendanceCodeRepository.save(code);
    }
    
    /**
     * 学生扫描考勤码进行签到
     */
    public boolean markAttendance(String attendanceCode, Student student) {
        Optional<AttendanceCode> codeOptional = attendanceCodeRepository
            .findByAttendanceCodeAndActiveTrueAndExpiryTimeAfter(attendanceCode, LocalDateTime.now());
        
        if (codeOptional.isEmpty()) {
            return false; // 考勤码无效或已过期
        }
        
        AttendanceCode code = codeOptional.get();
        
        // 检查学生是否在该班级中
        if (!code.getClassGroup().getStudents().contains(student)) {
            return false; // 学生不在该班级中
        }
        
        // 检查学生是否已经签到
        if (code.getAttendedStudents().contains(student)) {
            return false; // 已经签到过了
        }
        
        // 添加学生到已签到列表
        code.getAttendedStudents().add(student);
        attendanceCodeRepository.save(code);
        
        // 同时创建传统的考勤记录，这样考勤报告就能显示数据
        try {
            attendanceService.recordAttendance(
                student.getId(),
                code.getClassGroup().getId(),
                true, // 签到成功表示出席
                "通过考勤码签到: " + code.getDescription()
            );
        } catch (Exception e) {
            // 记录日志但不影响签到成功
            System.err.println("创建考勤记录失败: " + e.getMessage());
        }
        
        return true;
    }
    
    /**
     * 验证考勤码是否有效
     */
    public Optional<AttendanceCode> verifyAttendanceCode(String attendanceCode) {
        return attendanceCodeRepository
            .findByAttendanceCodeAndActiveTrueAndExpiryTimeAfter(attendanceCode, LocalDateTime.now());
    }
    
    /**
     * 生成考勤码的二维码图片
     */
    public String generateAttendanceCodeQRImage(String attendanceCode) throws Exception {
        // 构造前端表单链接，包含考勤码参数
        String frontendUrl = "http://localhost:3000/join-form?attendanceCode=" + attendanceCode + "&type=attendance";
        return qrCodeService.generateQRCodeImage(frontendUrl, 250, 250);
    }
    
    /**
     * 获取班级的考勤历史
     */
    public List<AttendanceCode> getAttendanceHistory(ClassGroup classGroup) {
        return attendanceCodeRepository.findByClassGroup(classGroup);
    }
    
    /**
     * 获取班级当前活跃的考勤码
     */
    public List<AttendanceCode> getActiveAttendanceCodes(ClassGroup classGroup) {
        return attendanceCodeRepository.findActiveAttendanceCodesByClassGroup(classGroup, LocalDateTime.now());
    }
    
    /**
     * 获取缺勤学生列表
     */
    public Set<Student> getAbsentStudents(AttendanceCode attendanceCode) {
        Set<Student> allStudents = attendanceCode.getClassGroup().getStudents();
        Set<Student> attendedStudents = attendanceCode.getAttendedStudents();
        
        return allStudents.stream()
            .filter(student -> !attendedStudents.contains(student))
            .collect(Collectors.toSet());
    }
    
    /**
     * 结束考勤（将考勤码设为无效）
     */
    public void endAttendance(Long attendanceCodeId) {
        Optional<AttendanceCode> codeOptional = attendanceCodeRepository.findById(attendanceCodeId);
        if (codeOptional.isPresent()) {
            AttendanceCode code = codeOptional.get();
            code.setActive(false);
            attendanceCodeRepository.save(code);
        }
    }
    
    /**
     * 生成唯一的考勤码
     */
    private String generateUniqueAttendanceCode() {
        String attendanceCode;
        do {
            attendanceCode = UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        } while (attendanceCodeRepository.findByAttendanceCode(attendanceCode).isPresent());
        
        return attendanceCode;
    }
} 