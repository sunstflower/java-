// 测试二维码表单功能的页面
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { QrCode2, Assessment } from '@mui/icons-material';
import { attendanceService } from '../../services/api';

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

const QRTest: React.FC = () => {
  const [joinCode, setJoinCode] = useState('TEST1234');
  const [attendanceCode, setAttendanceCode] = useState('ATTEND5678');
  const [tabValue, setTabValue] = useState(0);
  const [classGroupId, setClassGroupId] = useState('1');
  const [attendanceReport, setAttendanceReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 生成测试链接
  const generateJoinLink = () => {
    return `http://localhost:3000/join-form?joinCode=${joinCode}&type=class`;
  };
  
  const generateAttendanceLink = () => {
    return `http://localhost:3000/join-form?attendanceCode=${attendanceCode}&type=attendance`;
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('链接已复制到剪贴板');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 获取考勤报告
  const fetchAttendanceReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.getClassAttendanceReport(Number(classGroupId));
      setAttendanceReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '获取考勤报告失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        二维码表单测试页面
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        这是一个测试页面，用于生成和测试二维码表单链接。
      </Alert>

      {/* 标签页 */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<QrCode2 />} label="二维码测试" />
          <Tab icon={<Assessment />} label="考勤报告测试" />
        </Tabs>
      </Box>

      {/* 二维码测试页面 */}
      <TabPanel value={tabValue} index={0}>
        {/* 班级加入测试 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              班级加入码测试
            </Typography>
            
            <TextField
              fullWidth
              label="加入码"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                生成的链接: {generateJoinLink()}
              </Typography>
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<QrCode2 />}
                onClick={() => copyToClipboard(generateJoinLink())}
              >
                复制班级加入链接
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.open(generateJoinLink(), '_blank')}
              >
                在新窗口打开
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 考勤码测试 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              考勤码测试
            </Typography>
            
            <TextField
              fullWidth
              label="考勤码"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                生成的链接: {generateAttendanceLink()}
              </Typography>
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<QrCode2 />}
                onClick={() => copyToClipboard(generateAttendanceLink())}
                color="secondary"
              >
                复制考勤链接
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.open(generateAttendanceLink(), '_blank')}
              >
                在新窗口打开
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 测试说明 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              测试说明
            </Typography>
            
            <Typography variant="body2" paragraph>
              1. 点击"复制链接"按钮复制生成的测试链接
            </Typography>
            
            <Typography variant="body2" paragraph>
              2. 在新窗口或新标签页中打开链接
            </Typography>
            
            <Typography variant="body2" paragraph>
              3. 测试表单的登录和注册功能
            </Typography>
            
            <Typography variant="body2" paragraph>
              4. 对于班级加入：应该可以注册新用户并自动加入班级
            </Typography>
            
            <Typography variant="body2" paragraph>
              5. 对于考勤：需要先有用户账号才能进行签到
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 考勤报告测试页面 */}
      <TabPanel value={tabValue} index={1}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              考勤报告测试
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              测试考勤码签到后是否正确生成考勤记录
            </Typography>
            
            <TextField
              fullWidth
              label="班级ID"
              value={classGroupId}
              onChange={(e) => setClassGroupId(e.target.value)}
              sx={{ mb: 2 }}
              type="number"
            />
            
            <Button
              variant="contained"
              onClick={fetchAttendanceReport}
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading ? '加载中...' : '获取考勤报告'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {attendanceReport && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(attendanceReport, null, 2)}
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              测试步骤
            </Typography>
            
            <Typography variant="body2" paragraph>
              1. 首先确保有班级数据（班级ID默认为1）
            </Typography>
            
            <Typography variant="body2" paragraph>
              2. 切换到"二维码测试"标签页，复制考勤链接
            </Typography>
            
            <Typography variant="body2" paragraph>
              3. 在新窗口打开链接，完成考勤签到
            </Typography>
            
            <Typography variant="body2" paragraph>
              4. 回到此页面，点击"获取考勤报告"查看结果
            </Typography>
            
            <Typography variant="body2" paragraph>
              5. 如果修复成功，应该能看到考勤记录数据
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Container>
  );
};

export default QRTest; 