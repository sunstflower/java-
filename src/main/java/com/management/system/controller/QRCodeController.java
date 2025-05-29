package com.management.system.controller;

import com.google.zxing.WriterException;

//以下群贤毕至
import com.management.system.model.QRCode; 
import com.management.system.model.Student;
import com.management.system.payload.response.MessageResponse; 
import com.management.system.repository.StudentRepository; 
import com.management.system.service.QRCodeService; 

import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.http.ResponseEntity; // 响应实体
import org.springframework.security.access.prepost.PreAuthorize; // 权限控制
import org.springframework.web.bind.annotation.*; // 注解

import java.io.IOException; // 输入输出
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600) // 跨域 **CORS 配置**
@RestController // Restful API
@RequestMapping("/api/qrcode") // 注解路径
public class QRCodeController { //二维码控制器
    
    @Autowired
    private QRCodeService qrCodeService; // 业务逻辑
    
    @Autowired
    private StudentRepository studentRepository; // 数据访问
    
    @PostMapping("/generate/{studentId}") //只响应post
    @PreAuthorize("hasRole('STUDENT')") // 权限控制,学生生成
    public ResponseEntity<?> generateQRCode(@PathVariable Long studentId) {
        Optional<Student> studentOptional = studentRepository.findById(studentId);
        if (studentOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Student not found")); //查无此人
        }
        
        Student student = studentOptional.get();
        QRCode qrCode = qrCodeService.generateQRCodeForStudent(student); //sudentmodel入repository在上studentOptional.get()了，model最后入service中被qcCode生成二维码了
        
        try {
            String qrCodeImage = qrCodeService.generateQRCodeImage(qrCode.getCode(), 250, 250);//generateQRCodeForStudent生成记录用了UUID，这里生成码
            
            Map<String, Object> response = new HashMap<>();
            response.put("qrCodeId", qrCode.getId());
            response.put("qrCodeImage", qrCodeImage);
            response.put("expiryTime", qrCode.getExpiryTime());
            /* 
             * {
             *     "qrCodeId": id,
             *     "qrCodeImage": "data:image/png;base64,...",图片
             *     "expiryTime": "2025-05-28T12:00:00Z"
             * }
             */
            
            return ResponseEntity.ok(response); //返回二维码
        } catch (WriterException | IOException e) { // 写入异常或IO异常
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to generate QR code: " + e.getMessage()));
        }
    }
    

    @PostMapping("/verify/{code}") // 注解路径，用于验证二维码
    @PreAuthorize("hasRole('TEACHER')") // 权限控制,只有Teacher
    public ResponseEntity<?> verifyQRCode(@PathVariable String code) { // 验证二维码
        Optional<QRCode> qrCodeOptional = qrCodeService.verifyQRCode(code); // 有没有，查一下
        
        if (qrCodeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired QR code")); //查无此人or过期
        }
        
        QRCode qrCode = qrCodeOptional.get();
        qrCodeService.markQRCodeAsUsed(qrCode); // 使用标记
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true); // 成功
        response.put("studentId", qrCode.getStudent().getId());
        response.put("studentName", qrCode.getStudent().getUsername());
        /* 
         * {
         *     "success": true,
         *     "studentId": id,
         *     "studentName": name
         * }
         */ 
        return ResponseEntity.ok(response);
    }
} 