package com.management.system.controller;

import com.management.system.model.Attendance;
import com.management.system.payload.request.AttendanceRequest;
import com.management.system.payload.response.MessageResponse;
import com.management.system.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController { //考勤控制器

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> recordAttendance(@Valid @RequestBody AttendanceRequest attendanceRequest) {
        attendanceService.recordAttendance(
            attendanceRequest.getStudentId(),
            attendanceRequest.getClassGroupId(),
            attendanceRequest.isPresent(),
            attendanceRequest.getRemarks()
        );
        return ResponseEntity.ok(new MessageResponse("考勤记录已保存"));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        List<Attendance> attendances = attendanceService.getStudentAttendance(studentId);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/class/{classGroupId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getClassAttendance(@PathVariable Long classGroupId) {
        List<Attendance> attendances = attendanceService.getClassAttendance(classGroupId);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/class/{classGroupId}/date/{date}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getClassAttendanceByDate(
            @PathVariable Long classGroupId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> attendances = attendanceService.getClassAttendanceByDate(classGroupId, date);
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
    public ResponseEntity<?> getClassAttendanceReport(@PathVariable Long classGroupId) {
        return ResponseEntity.ok(attendanceService.getClassAttendanceReport(classGroupId));
    }

    @GetMapping("/report/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<?> getStudentAttendanceReport(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceReport(studentId));
    }
} 