package com.management.system.service;

/* 
 * 二维码生，存，查，用
 * 
 */

import com.google.zxing.BarcodeFormat;  // 二维码格式   
import com.google.zxing.WriterException;  // 二维码生成异常
import com.google.zxing.client.j2se.MatrixToImageWriter;  // 二维码生成 矩阵ToImageの写手
import com.google.zxing.common.BitMatrix;  // 二维码矩阵
import com.google.zxing.qrcode.QRCodeWriter;  // 二维码生成
import com.management.system.model.QRCode;
import com.management.system.model.Student;
import com.management.system.repository.QRCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;  // 字节数组输出流
import java.io.IOException;  // 输入输出异常
import java.time.LocalDateTime;  // 本地日期时间
import java.util.Base64;  // 基础64编码 用于加密
import java.util.Optional;
import java.util.UUID;  // 通用唯一标识符 生成唯一码

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
        /* {
         *  "student": 学生,
         *  "code": 二维码,
         *  "generatedTime": 生成时间,
         *  "expiryTime": 过期时间,
         *  "used": 是否使用,
        } */
        
        // 保存到数据库
        return qrCodeRepository.save(qrCode);
    }
    
    public String generateQRCodeImage(String content, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(
            content,  // 二维码内容
            BarcodeFormat.QR_CODE,  // 二维码格式
            width, height  // 二维码大小
            ); 
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(); // 二维码里的点
        MatrixToImageWriter.writeToStream(
            bitMatrix,  // 矩阵
            "PNG",  // 格式
            outputStream  // 二维码输出流
            );
        
        return Base64.getEncoder().encodeToString(outputStream.toByteArray());  // 二维码のBase64编码
    }
    
    public Optional<QRCode> verifyQRCode(String code) {
        // 查找未使用且未过期的QR码
        return qrCodeRepository.findByCodeAndUsedFalseAndExpiryTimeAfter(code, LocalDateTime.now());
    }
    
    public void markQRCodeAsUsed(QRCode qrCode) {  //二维码使用标记
        qrCode.setUsed(true);
        qrCodeRepository.save(qrCode);
    }
    
    public void cleanupExpiredQRCodes() {  // 清理过期二维码
        LocalDateTime now = LocalDateTime.now();
        qrCodeRepository.findByExpiryTimeBefore(now).forEach(qrCode -> {
            qrCode.setUsed(true);
            qrCodeRepository.save(qrCode);
        });
    }
} 