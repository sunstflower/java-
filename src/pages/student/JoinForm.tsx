// 二维码扫描后的独立表单页面
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { authService, classJoinService, attendanceCodeService } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

// 表单页面组件
const JoinForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useAuth();
  
  // 从URL参数获取信息
  const urlParams = new URLSearchParams(location.search);
  const joinCode = urlParams.get('joinCode');
  const attendanceCode = urlParams.get('attendanceCode');
  const type = urlParams.get('type'); // 'class' 或 'attendance'
  
  // 表单状态
  const [tabValue, setTabValue] = useState(0); // 0: 登录, 1: 注册
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 检查参数有效性
  useEffect(() => {
    if (!joinCode && !attendanceCode) {
      setError('无效的二维码链接');
      return;
    }
    
    if (type !== 'class' && type !== 'attendance') {
      setError('无效的操作类型');
      return;
    }
  }, [joinCode, attendanceCode, type]);

  // 如果用户已登录，预填用户信息
  useEffect(() => {
    if (isAuthenticated && user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setStudentId((user as any).studentId || '');
    }
  }, [isAuthenticated, user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  // 处理登录后的操作
  const handlePostLogin = async () => {
    try {
      if (type === 'class' && joinCode) {
        // 班级加入 - 需要学号信息
        if (!studentId) {
          setError('请填写学号信息');
          return;
        }
        
        const response = await classJoinService.joinClass({
          joinCode,
          studentName: username,
          studentId: studentId,
          password: password
        });
        setSuccess(`成功加入班级: ${response.data.className}`);
        setTimeout(() => navigate('/student/dashboard'), 2000);
      } else if (type === 'attendance' && attendanceCode) {
        // 考勤签到 - 使用新的API
        const response = await attendanceCodeService.checkInWithUserInfo(attendanceCode, username, password);
        setSuccess('考勤签到成功！');
        setTimeout(() => navigate('/student/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败');
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }

    // 对于班级加入，需要学号信息
    if (type === 'class' && !studentId) {
      setError('请填写学号信息');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 如果用户未登录，先登录
      if (!isAuthenticated) {
        await login(username, password);
        setSuccess('登录成功！正在处理...');
      }
      
      // 登录成功后处理相应操作
      await handlePostLogin();
    } catch (err: any) {
      setError('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !studentId) {
      setError('请填写所有必填信息');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 对于班级加入，直接调用班级加入API（支持自动注册）
      if (type === 'class' && joinCode) {
        const response = await classJoinService.joinClass({
          joinCode,
          studentName: username,
          studentId: studentId,
          password: password
        });
        setSuccess(`成功注册并加入班级: ${response.data.className}! 请使用刚注册的账号登录。`);
        setTimeout(() => {
          setTabValue(0); // 切换到登录标签
          setPassword(''); // 清空密码让用户重新输入
        }, 2000);
      } else {
        // 对于考勤，需要先注册再登录
        await authService.register(
          username,
          email,
          password,
          'ROLE_STUDENT',
          studentId
        );

        // 注册成功后立即登录
        await login(username, password);
        setSuccess('注册并登录成功！正在处理...');
        
        // 处理考勤签到
        await handlePostLogin();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        {/* 页面标题 */}
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          {type === 'class' ? '加入班级' : '考勤签到'}
        </Typography>
        
        <Typography variant="body2" align="center" sx={{ mb: 3, color: 'text.secondary' }}>
          {type === 'class' 
            ? '请登录现有账号或注册新账号以加入班级' 
            : '请登录现有账号或注册新账号以进行考勤签到'
          }
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* 标签页 */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab icon={<LoginIcon />} label="登录" />
            <Tab icon={<RegisterIcon />} label="注册" />
          </Tabs>
        </Box>

        {/* 登录表单 */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {/* 在班级加入场景下需要学号 */}
            {type === 'class' && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="学号"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={loading}
                placeholder="请输入您的学号"
                helperText="加入班级需要提供学号信息"
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : '登录并继续'}
            </Button>
          </Box>
        </TabPanel>

        {/* 注册表单 */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleRegister}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="电子邮件"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="your.email@example.com"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="学号"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={loading}
              placeholder="请输入您的学号"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : '注册并继续'}
            </Button>
          </Box>
        </TabPanel>

        <Divider sx={{ my: 3 }} />

        {/* 说明信息 */}
        <Card sx={{ bgcolor: 'info.light' }}>
          <CardContent>
            <Typography variant="body2" color="info.contrastText">
              <strong>操作说明：</strong><br />
              • 如果您已有账号，请使用"登录"标签页<br />
              • 如果您是新用户，请使用"注册"标签页<br />
              • {type === 'class' ? '完成后将自动加入指定班级' : '完成后将自动进行考勤签到'}<br />
              • 请确保信息准确，以免影响后续操作
            </Typography>
          </CardContent>
        </Card>

        {/* 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <Card sx={{ mt: 2, bgcolor: 'grey.100' }}>
            <CardContent>
              <Typography variant="body2">
                <strong>调试信息：</strong><br />
                joinCode: {joinCode || 'null'}<br />
                attendanceCode: {attendanceCode || 'null'}<br />
                type: {type || 'null'}<br />
                tabValue: {tabValue}<br />
                isAuthenticated: {isAuthenticated.toString()}<br />
                username: {username || 'empty'}<br />
                studentId: {studentId || 'empty'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default JoinForm; 