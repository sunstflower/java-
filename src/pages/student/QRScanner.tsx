import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { QrCodeScanner, Class, Schedule } from '@mui/icons-material';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { classJoinService, attendanceCodeService } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  
  // 加入班级相关状态
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (user) {
      setStudentName(user.username);
      // 假设学生有studentId属性，如果没有可以设为用户名
      setStudentId((user as any).studentId || user.username);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    stopScanner();
  };

  const startScanner = () => {
    if (scannerActive) return;

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    setScanner(html5QrcodeScanner);
    setScannerActive(true);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
    setScannerActive(false);
  };

  const onScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    stopScanner();
    processScanResult(decodedText);
  };

  const onScanFailure = (error: string) => {
    // 忽略扫描失败错误，避免过多日志
  };

  const processScanResult = async (result: string) => {
    setProcessing(true);
    
    try {
      // 检查是否是前端表单链接
      if (result.includes('/join-form')) {
        // 直接跳转到表单页面
        window.location.href = result;
        return;
      }
      
      // 兼容旧格式
      if (result.startsWith('CLASS_JOIN:')) {
        // 班级加入码
        const code = result.replace('CLASS_JOIN:', '');
        setJoinCode(code);
        setJoinDialogOpen(true);
      } else if (result.startsWith('ATTENDANCE:')) {
        // 考勤码
        const attendanceCode = result.replace('ATTENDANCE:', '');
        await handleAttendanceCheckin(attendanceCode);
      } else {
        // 尝试直接处理为考勤码或加入码
        if (tabValue === 0) {
          // 当前在加入班级标签页
          setJoinCode(result);
          setJoinDialogOpen(true);
        } else {
          // 当前在考勤标签页
          await handleAttendanceCheckin(result);
        }
      }
    } catch (error) {
      toast.error('处理扫码结果失败');
    } finally {
      setProcessing(false);
    }
  };

  const handleJoinClass = async () => {
    if (!joinCode || !studentName || !studentId) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      setProcessing(true);
      const response = await classJoinService.joinClass({
        joinCode,
        studentName,
        studentId
      });
      toast.success(response.data.message);
      setJoinDialogOpen(false);
      setJoinCode('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加入班级失败');
    } finally {
      setProcessing(false);
    }
  };

  const handleAttendanceCheckin = async (attendanceCode: string) => {
    try {
      setProcessing(true);
      const response = await attendanceCodeService.checkIn(attendanceCode);
      toast.success(response.data.message);
      
      // 显示签到详情
      const { className, description, checkinTime } = response.data;
      toast.success(`${className} - ${description} 签到成功！`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '签到失败');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualJoin = () => {
    setJoinDialogOpen(true);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        扫码功能
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<Class />} label="加入班级" />
          <Tab icon={<Schedule />} label="考勤签到" />
        </Tabs>
      </Paper>

      {/* 加入班级页面 */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom textAlign="center">
              扫描班级加入码
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
              扫描教师提供的班级加入二维码，或手动输入加入码
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {!scannerActive ? (
                <Button
                  variant="contained"
                  startIcon={<QrCodeScanner />}
                  onClick={startScanner}
                  size="large"
                >
                  开始扫描
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={stopScanner}
                  color="error"
                >
                  停止扫描
                </Button>
              )}
              
              <Button
                variant="text"
                onClick={handleManualJoin}
                sx={{ ml: 2 }}
              >
                手动输入
              </Button>
            </Box>

            {scannerActive && (
              <Box sx={{ mt: 2 }}>
                <div id="qr-reader" style={{ width: '100%' }}></div>
              </Box>
            )}

            {processing && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 考勤签到页面 */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom textAlign="center">
              扫描考勤码
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" paragraph>
              扫描教师生成的考勤二维码进行签到
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              请确保您已加入相应的班级才能进行考勤签到
            </Alert>
            
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {!scannerActive ? (
                <Button
                  variant="contained"
                  startIcon={<QrCodeScanner />}
                  onClick={startScanner}
                  size="large"
                >
                  开始扫描
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={stopScanner}
                  color="error"
                >
                  停止扫描
                </Button>
              )}
            </Box>

            {scannerActive && (
              <Box sx={{ mt: 2 }}>
                <div id="qr-reader" style={{ width: '100%' }}></div>
              </Box>
            )}

            {processing && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 加入班级对话框 */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>加入班级</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="加入码"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            margin="normal"
            placeholder="输入班级加入码"
          />
          <TextField
            fullWidth
            label="学生姓名"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="学号"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>取消</Button>
          <Button onClick={handleJoinClass} variant="contained" disabled={processing}>
            加入班级
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QRScanner; 