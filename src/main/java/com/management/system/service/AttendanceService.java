package com.management.system.service;

//stream,有点函数式的样子了
import com.management.system.model.Attendance;
import com.management.system.model.ClassGroup;
import com.management.system.model.Student;
import com.management.system.repository.AttendanceRepository;
import com.management.system.repository.ClassGroupRepository;
import com.management.system.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service // 服务层组件，是由Spring管理的
public class AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private ClassGroupRepository classGroupRepository;
    
    public Attendance recordAttendance( // 记录考勤
        Long studentId,
        Long classGroupId,
        boolean present, 
        String remarks
        ) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));// or else throw 
        
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));//抛出异常
        
        // 创建考勤记录
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setClassGroup(classGroup);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setPresent(present); // 是否出席
        attendance.setRemarks(remarks); // 备注
        
        return attendanceRepository.save(attendance); // 保存考勤记录，存入JPA仓库
    }
    
    public List<Attendance> getStudentAttendance(Long studentId) { // 获取学生所有考勤记录
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        return attendanceRepository.findByStudent(student);
    }
    
    public List<Attendance> getClassAttendance(Long classGroupId) { // 获取班级所有考勤记录
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        return attendanceRepository.findByClassGroup(classGroup);
    }
    
    public List<Attendance> getAttendanceByStudent(Long studentId) { // 获取学生所有考勤记录
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        return attendanceRepository.findByStudent(student);
    }
    
    public List<Attendance> getAttendanceByClassGroup(Long classGroupId) { // 获取班级所有考勤记录
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        return attendanceRepository.findByClassGroup(classGroup);
    }
    
    public List<Attendance> getClassAttendanceByDate(Long classGroupId, LocalDate date) { // 获取班级所有考勤记录
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);
        
        return attendanceRepository.findByClassGroupAndCheckInTimeBetween(classGroup, startOfDay, endOfDay);
    }
    
    public List<Attendance> getStudentAttendanceByDateRange(Long studentId, LocalDate startDate, LocalDate endDate) { // 获取学生所有考勤记录
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1);
        
        return attendanceRepository.findByStudentAndCheckInTimeBetween(student, startDateTime, endDateTime);
    }
    
    public List<Attendance> getStudentAttendanceForClass(Long studentId, Long classGroupId) { // 获取学生所有考勤记录   
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        return attendanceRepository.findByStudentAndClassGroup(student, classGroup);
    }

    
    public Map<String, Object> getClassAttendanceReport(Long classGroupId) { // 获取班级考勤统计报告
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        List<Attendance> attendances = attendanceRepository.findByClassGroup(classGroup);
        
        int totalAttendance = attendances.size(); // 总考勤次数
        int presentCount = (int) attendances.stream().filter(Attendance::isPresent).count(); // 出席次数
        int absentCount = totalAttendance - presentCount; // 缺席次数
        
        Map<Student, List<Attendance>> attendanceByStudent = attendances.stream() // 按学生分组
                .collect(Collectors.groupingBy(Attendance::getStudent));
        
        Map<String, Object> studentStats = new HashMap<>(); // 学生统计
        attendanceByStudent.forEach((student, studentAttendances) -> {
            Map<String, Object> stats = new HashMap<>(); // 学生统计
            stats.put("total", studentAttendances.size()); // 总考勤次数
            stats.put("present", studentAttendances.stream().filter(Attendance::isPresent).count()); // 出席次数
            stats.put("absent", studentAttendances.stream().filter(a -> !a.isPresent()).count()); // 缺席次数
            stats.put("presentRate", studentAttendances.isEmpty() ? 0 : 
                    (double) studentAttendances.stream().filter(Attendance::isPresent).count() / studentAttendances.size()); // 出席率
            
            studentStats.put(student.getStudentId(), stats); // 学生统计
            /*  
             * {
             *   "学生ID1": {
             *     "total": 总考勤次数（Integer）,
             *     "present": 出席次数（Long）, // filter.count() 返回long，需注意类型
             *     "absent": 缺席次数（Long）,
             *     "presentRate": 出席率（Double）
             *   },
             *   "学生ID2": { ... },
             *   ...
             * }
             */

             //换成Javascript长这样     不得不感叹脚本语言的醒目
             
             /* 
              * const studentStats = {}; // 最终结果对象
              *
              * Object.entries(attendanceByStudent).forEach(([studentId, studentAttendances]) => {
              *    const total = studentAttendances.length; 
              *    const present = studentAttendances.filter(attendance => attendance.present).length; 
              *    const absent = total - present; 
              *    const presentRate = total === 0 ? 0 : present / total;
              *
              *    studentStats[studentId] = {
              *        total, // 等价于 total: total
              *        present,
              *        absent,
              *        presentRate: Number(presentRate.toFixed(2))      脚本语言特有的精度问题
              *    };
              *});
              */
            
        });
        
        // 构建班级考勤统计报告
        Map<String, Object> report = new HashMap<>();
        report.put("classGroup", classGroup.getName());
        report.put("totalAttendance", totalAttendance);
        report.put("presentCount", presentCount);
        report.put("absentCount", absentCount);
        report.put("presentRate", totalAttendance == 0 ? 0 : (double) presentCount / totalAttendance);
        report.put("studentStats", studentStats);
        
        return report;
    }

    public Map<String, Object> getStudentAttendanceReport(Long studentId) { // 获取学生考勤统计报告
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        List<Attendance> attendances = attendanceRepository.findByStudent(student);
        
        int totalAttendance = attendances.size();
        int presentCount = (int) attendances.stream().filter(Attendance::isPresent).count();
        int absentCount = totalAttendance - presentCount;
        double presentRate = totalAttendance == 0 ? 0 : (double) presentCount / totalAttendance;
        
        Map<ClassGroup, List<Attendance>> attendanceByClass = attendances.stream() // 按班级分组
                .collect(Collectors.groupingBy(Attendance::getClassGroup));
        
        Map<String, Object> classStats = new HashMap<>();
        attendanceByClass.forEach((classGroup, classAttendances) -> {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", classAttendances.size());
            stats.put("present", classAttendances.stream().filter(Attendance::isPresent).count());
            stats.put("absent", classAttendances.stream().filter(a -> !a.isPresent()).count());
            stats.put("presentRate", classAttendances.isEmpty() ? 0 : 
                    (double) classAttendances.stream().filter(Attendance::isPresent).count() / classAttendances.size());
            
            classStats.put(classGroup.getName(), stats);
        });
        
        // 构建学生考勤统计报告
        Map<String, Object> report = new HashMap<>();
        report.put("student", student.getUsername());
        report.put("studentId", student.getStudentId());
        report.put("totalAttendance", totalAttendance);
        report.put("presentCount", presentCount);
        report.put("absentCount", absentCount);
        report.put("presentRate", presentRate);
        report.put("classStats", classStats);
        
        return report;
    }
    
    public Optional<Attendance> getAttendanceById(Long id) { // 获取考勤记录
        return attendanceRepository.findById(id);
    }
    
    public Attendance updateAttendance(Attendance attendance) { // 更新考勤记录
        return attendanceRepository.save(attendance);
    }
    
    public void deleteAttendance(Long id) { // 删除考勤记录
        attendanceRepository.deleteById(id);
    }
} 