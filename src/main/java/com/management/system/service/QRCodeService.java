package com.management.system.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.management.system.model.QRCode;
import com.management.system.model.Student;
import com.management.system.repository.QRCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class QRCodeService {
    
    @Autowired
    private QRCodeRepository qrCodeRepository;
    
    public QRCode generateQRCodeForStudent(Student student) {
        // 生成随机码
        String code = UUID.randomUUID().toString();
        
        // 设置过期时间（10分钟后）
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusMinutes(10);
        
        // 创建QR码记录
        QRCode qrCode = new QRCode();
        qrCode.setStudent(student);
        qrCode.setCode(code);
        qrCode.setGeneratedTime(now);
        qrCode.setExpiryTime(expiryTime);
        qrCode.setUsed(false);
        
        // 保存到数据库
        return qrCodeRepository.save(qrCode);
    }
    
    public String generateQRCodeImage(String content, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }
    
    public Optional<QRCode> verifyQRCode(String code) {
        // 查找未使用且未过期的QR码
        return qrCodeRepository.findByCodeAndUsedFalseAndExpiryTimeAfter(code, LocalDateTime.now());
    }
    
    public void markQRCodeAsUsed(QRCode qrCode) {
        qrCode.setUsed(true);
        qrCodeRepository.save(qrCode);
    }
    
    public void cleanupExpiredQRCodes() {
        LocalDateTime now = LocalDateTime.now();
        qrCodeRepository.findByExpiryTimeBefore(now).forEach(qrCode -> {
            qrCode.setUsed(true);
            qrCodeRepository.save(qrCode);
        });
    }
} 