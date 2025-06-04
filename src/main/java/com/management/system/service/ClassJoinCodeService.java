package com.management.system.service;

import com.management.system.model.ClassGroup;
import com.management.system.model.ClassJoinCode;
import com.management.system.model.Student;
import com.management.system.repository.ClassJoinCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * 班级加入码服务
 * 处理班级加入码的生成、验证和管理
 */
@Service
public class ClassJoinCodeService {
    
    @Autowired
    private ClassJoinCodeRepository classJoinCodeRepository;
    
    @Autowired
    private QRCodeService qrCodeService;
    
    /**
     * 为班级生成加入码
     */
    public ClassJoinCode generateJoinCodeForClass(ClassGroup classGroup) {
        // 检查是否已有有效的加入码
        Optional<ClassJoinCode> existingCode = classJoinCodeRepository.findByClassGroup(classGroup);
        if (existingCode.isPresent() && existingCode.get().isActive() && 
            existingCode.get().getExpiryTime().isAfter(LocalDateTime.now())) {
            return existingCode.get();
        }
        
        // 如果有旧的加入码，将其设为无效
        existingCode.ifPresent(code -> {
            code.setActive(false);
            classJoinCodeRepository.save(code);
        });
        
        // 生成新的加入码
        String joinCode = generateUniqueJoinCode();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusDays(30); // 30天有效期
        
        ClassJoinCode classJoinCode = new ClassJoinCode();
        classJoinCode.setClassGroup(classGroup);
        classJoinCode.setJoinCode(joinCode);
        classJoinCode.setGeneratedTime(now);
        classJoinCode.setExpiryTime(expiryTime);
        classJoinCode.setActive(true);
        
        return classJoinCodeRepository.save(classJoinCode);
    }
    
    /**
     * 验证加入码并返回对应的班级
     */
    public Optional<ClassGroup> verifyJoinCode(String joinCode) {
        Optional<ClassJoinCode> codeOptional = classJoinCodeRepository
            .findByJoinCodeAndActiveTrueAndExpiryTimeAfter(joinCode, LocalDateTime.now());
        
        if (codeOptional.isPresent()) {
            return Optional.of(codeOptional.get().getClassGroup());
        }
        return Optional.empty();
    }
    
    /**
     * 生成班级加入码的二维码图片
     */
    public String generateJoinCodeQRImage(String joinCode) throws Exception {
        // 构造前端表单链接，包含加入码参数
        String frontendUrl = "http://localhost:3000/join-form?joinCode=" + joinCode + "&type=class";
        return qrCodeService.generateQRCodeImage(frontendUrl, 250, 250);
    }
    
    /**
     * 获取班级的加入码
     */
    public Optional<ClassJoinCode> getJoinCodeByClass(ClassGroup classGroup) {
        return classJoinCodeRepository.findByClassGroup(classGroup);
    }
    
    /**
     * 生成唯一的加入码
     */
    private String generateUniqueJoinCode() {
        String joinCode;
        do {
            // 生成8位随机码
            joinCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (classJoinCodeRepository.findByJoinCode(joinCode).isPresent());
        
        return joinCode;
    }
} 