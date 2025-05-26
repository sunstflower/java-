package com.management.system.controller;

import com.google.zxing.WriterException;
import com.management.system.model.QRCode;
import com.management.system.model.Student;
import com.management.system.payload.response.MessageResponse;
import com.management.system.repository.StudentRepository;
import com.management.system.service.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600) // 跨域
@RestController // Restful API
@RequestMapping("/api/qrcode") // 路径
public class QRCodeController { //二维码控制器
    
    @Autowired
    private QRCodeService qrCodeService;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @PostMapping("/generate/{studentId}") 
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> generateQRCode(@PathVariable Long studentId) {
        Optional<Student> studentOptional = studentRepository.findById(studentId);
        if (studentOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Student not found"));
        }
        
        Student student = studentOptional.get();
        QRCode qrCode = qrCodeService.generateQRCodeForStudent(student);
        
        try {
            String qrCodeImage = qrCodeService.generateQRCodeImage(qrCode.getCode(), 250, 250);
            
            Map<String, Object> response = new HashMap<>();
            response.put("qrCodeId", qrCode.getId());
            response.put("qrCodeImage", qrCodeImage);
            response.put("expiryTime", qrCode.getExpiryTime());
            
            return ResponseEntity.ok(response);
        } catch (WriterException | IOException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to generate QR code: " + e.getMessage()));
        }
    }
    
    @PostMapping("/verify/{code}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> verifyQRCode(@PathVariable String code) {
        Optional<QRCode> qrCodeOptional = qrCodeService.verifyQRCode(code);
        
        if (qrCodeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired QR code"));
        }
        
        QRCode qrCode = qrCodeOptional.get();
        qrCodeService.markQRCodeAsUsed(qrCode);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("studentId", qrCode.getStudent().getId());
        response.put("studentName", qrCode.getStudent().getUsername());
        
        return ResponseEntity.ok(response);
    }
} 