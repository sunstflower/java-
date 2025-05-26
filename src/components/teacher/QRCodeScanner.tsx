// 教师二维码扫描器组件
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { ClassGroup, QRCodeVerifyResponse } from '../../interfaces';
import { qrCodeService, classGroupService, attendanceService } from '../../services/api';

// HTML5 QR码扫描器配置
const qrcodeRegionId = 'html5qr-code-full-region';
const config = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
};

// 扫描器组件
const QRCodeScanner: React.FC = () => {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<QRCodeVerifyResponse | null>(null);
  
  // 加载教师的班级列表
  useEffect(() => {
    const fetchClassGroups = async () => {
      setLoading(true);
      try {
        const response = await classGroupService.getTeacherClassGroups();
        setClassGroups(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || '获取班级列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchClassGroups();
  }, []);

  // 清理扫描器
  useEffect(() => {
    return () => {
      if (scanning) {
        try {
          const html5QrCode = new Html5QrcodeScanner(qrcodeRegionId, config, false);
          html5QrCode.clear();
          setScanning(false);
        } catch (err) {
          console.error('Failed to clear scanner', err);
        }
      }
    };
  }, [scanning]);

  // 启动扫描器
  const startScanner = () => {
    if (!selectedClassGroup) {
      setError('请先选择一个班级');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setScanResult(null);
    setScanning(true);

    try {
      // 初始化扫描器
      const html5QrcodeScanner = new Html5QrcodeScanner(
        qrcodeRegionId,
        config,
        false
      );

      // 成功扫描回调
      const onScanSuccess = async (decodedText: string) => {
        // 停止扫描
        html5QrcodeScanner.clear();
        setScanning(false);

        try {
          // 验证二维码
          const response = await qrCodeService.verifyQRCode(decodedText);
          const verificationResult = response.data as QRCodeVerifyResponse;
          
          if (verificationResult.success) {
            setScanResult(verificationResult);
            
            // 记录考勤
            const attendanceResponse = await attendanceService.recordAttendance(
              verificationResult.studentId,
              parseInt(selectedClassGroup),
              true,
              '通过二维码签到'
            );
            
            setSuccess(`${verificationResult.studentName} 考勤记录成功！`);
          } else {
            setError('无效或已过期的二维码');
          }
        } catch (err: any) {
          console.error('QR verification error:', err);
          setError(err.response?.data?.message || '验证二维码失败');
        }
      };

      // 扫描失败回调
      const onScanFailure = (error: any) => {
        // 处理错误但不停止扫描
        console.warn('QR scan error:', error);
      };

      // 启动扫描
      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    } catch (err: any) {
      console.error('Scanner initialization error:', err);
      setError('初始化扫描器失败');
      setScanning(false);
    }
  };

  // 重置扫描器
  const resetScanner = () => {
    setError(null);
    setSuccess(null);
    setScanResult(null);
    setScanning(false);
    
    // 清除现有扫描器
    try {
      const element = document.getElementById(qrcodeRegionId);
      if (element) {
        element.innerHTML = '';
      }
    } catch (err) {
      console.error('Failed to clear scanner element', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          扫描考勤二维码
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          请选择班级后扫描学生的考勤二维码
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* 班级选择 */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="classgroup-select-label">选择班级</InputLabel>
              <Select
                labelId="classgroup-select-label"
                id="classgroup-select"
                value={selectedClassGroup}
                label="选择班级"
                onChange={(e) => setSelectedClassGroup(e.target.value)}
                disabled={scanning}
              >
                {classGroups.map((group) => (
                  <MenuItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
              {classGroups.length === 0 && (
                <FormHelperText>没有可用的班级</FormHelperText>
              )}
            </FormControl>

            {/* 错误信息 */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>错误</AlertTitle>
                {error}
              </Alert>
            )}

            {/* 成功信息 */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <AlertTitle>成功</AlertTitle>
                {success}
                {scanResult && (
                  <Box component="div" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      学生ID: {scanResult.studentId}
                    </Typography>
                    <Typography variant="body2">
                      学生姓名: {scanResult.studentName}
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}

            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
              {!scanning && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startScanner}
                  disabled={!selectedClassGroup || classGroups.length === 0}
                >
                  开始扫描
                </Button>
              )}
              
              {scanning && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={resetScanner}
                >
                  停止扫描
                </Button>
              )}
              
              {success && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={resetScanner}
                >
                  扫描下一个
                </Button>
              )}
            </Box>

            {/* 扫描器容器 */}
            {scanning && (
              <Box 
                sx={{ 
                  mt: 3, 
                  '& video': { maxWidth: '100%' },
                  '& img': { maxWidth: '100%' }
                }}
              >
                <div id={qrcodeRegionId} />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default QRCodeScanner; 