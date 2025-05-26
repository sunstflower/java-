package com.management.system.service;

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

@Service
public class AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private ClassGroupRepository classGroupRepository;
    
    public Attendance recordAttendance(Long studentId, Long classGroupId, boolean present, String remarks) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setClassGroup(classGroup);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setPresent(present);
        attendance.setRemarks(remarks);
        
        return attendanceRepository.save(attendance);
    }
    
    // 获取学生所有考勤记录
    public List<Attendance> getStudentAttendance(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        return attendanceRepository.findByStudent(student);
    }
    
    // 获取班级所有考勤记录
    public List<Attendance> getClassAttendance(Long classGroupId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        return attendanceRepository.findByClassGroup(classGroup);
    }
    
    public List<Attendance> getAttendanceByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        return attendanceRepository.findByStudent(student);
    }
    
    public List<Attendance> getAttendanceByClassGroup(Long classGroupId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        return attendanceRepository.findByClassGroup(classGroup);
    }
    
    public List<Attendance> getClassAttendanceByDate(Long classGroupId, LocalDate date) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusNanos(1);
        
        return attendanceRepository.findByClassGroupAndCheckInTimeBetween(classGroup, startOfDay, endOfDay);
    }
    
    public List<Attendance> getStudentAttendanceByDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay().minusNanos(1);
        
        return attendanceRepository.findByStudentAndCheckInTimeBetween(student, startDateTime, endDateTime);
    }
    
    public List<Attendance> getStudentAttendanceForClass(Long studentId, Long classGroupId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        return attendanceRepository.findByStudentAndClassGroup(student, classGroup);
    }
    
    // 获取班级考勤统计报告
    public Map<String, Object> getClassAttendanceReport(Long classGroupId) {
        ClassGroup classGroup = classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new RuntimeException("Class group not found with id: " + classGroupId));
        
        List<Attendance> attendances = attendanceRepository.findByClassGroup(classGroup);
        
        int totalAttendance = attendances.size();
        int presentCount = (int) attendances.stream().filter(Attendance::isPresent).count();
        int absentCount = totalAttendance - presentCount;
        
        Map<Student, List<Attendance>> attendanceByStudent = attendances.stream()
                .collect(Collectors.groupingBy(Attendance::getStudent));
        
        Map<String, Object> studentStats = new HashMap<>();
        attendanceByStudent.forEach((student, studentAttendances) -> {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", studentAttendances.size());
            stats.put("present", studentAttendances.stream().filter(Attendance::isPresent).count());
            stats.put("absent", studentAttendances.stream().filter(a -> !a.isPresent()).count());
            stats.put("presentRate", studentAttendances.isEmpty() ? 0 : 
                    (double) studentAttendances.stream().filter(Attendance::isPresent).count() / studentAttendances.size());
            
            studentStats.put(student.getStudentId(), stats);
        });
        
        Map<String, Object> report = new HashMap<>();
        report.put("classGroup", classGroup.getName());
        report.put("totalAttendance", totalAttendance);
        report.put("presentCount", presentCount);
        report.put("absentCount", absentCount);
        report.put("presentRate", totalAttendance == 0 ? 0 : (double) presentCount / totalAttendance);
        report.put("studentStats", studentStats);
        
        return report;
    }
    
    // 获取学生考勤统计报告
    public Map<String, Object> getStudentAttendanceReport(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        List<Attendance> attendances = attendanceRepository.findByStudent(student);
        
        int totalAttendance = attendances.size();
        int presentCount = (int) attendances.stream().filter(Attendance::isPresent).count();
        int absentCount = totalAttendance - presentCount;
        double presentRate = totalAttendance == 0 ? 0 : (double) presentCount / totalAttendance;
        
        Map<ClassGroup, List<Attendance>> attendanceByClass = attendances.stream()
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
    
    public Optional<Attendance> getAttendanceById(Long id) {
        return attendanceRepository.findById(id);
    }
    
    public Attendance updateAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }
    
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
} 