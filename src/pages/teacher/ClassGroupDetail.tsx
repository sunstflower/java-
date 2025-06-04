import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { QrCode2, Share, People, AccessTime } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { ClassGroup } from '../../interfaces';
import { classGroupService, classJoinService, attendanceCodeService } from '../../services/api';

const ClassGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 班级加入码相关状态
  const [joinCodeInfo, setJoinCodeInfo] = useState<any>(null);
  const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false);
  const [generateJoinCodeLoading, setGenerateJoinCodeLoading] = useState(false);

  // 考勤码相关状态
  const [attendanceCodeInfo, setAttendanceCodeInfo] = useState<any>(null);
  const [attendanceCodeDialogOpen, setAttendanceCodeDialogOpen] = useState(false);
  const [generateAttendanceCodeDialogOpen, setGenerateAttendanceCodeDialogOpen] = useState(false);
  const [generateAttendanceCodeLoading, setGenerateAttendanceCodeLoading] = useState(false);
  const [attendanceDescription, setAttendanceDescription] = useState('');
  const [attendanceValidMinutes, setAttendanceValidMinutes] = useState(10);

  useEffect(() => {
    const fetchClassGroup = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await classGroupService.getClassGroupById(parseInt(id));
        setClassGroup(response.data);
        
        // 尝试获取班级加入码信息
        try {
          const joinCodeResponse = await classJoinService.getJoinCodeInfo(parseInt(id));
          setJoinCodeInfo(joinCodeResponse.data);
        } catch (joinCodeError) {
          // 如果没有加入码，这是正常的
          console.log('No join code exists yet');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || '获取班级详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchClassGroup();
  }, [id]);

  const handleGenerateJoinCode = async () => {
    if (!id) return;
    
    try {
      setGenerateJoinCodeLoading(true);
      const response = await classJoinService.generateJoinCode(parseInt(id));
      setJoinCodeInfo(response.data);
      setJoinCodeDialogOpen(true);
      toast.success('班级加入码生成成功');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '生成加入码失败');
    } finally {
      setGenerateJoinCodeLoading(false);
    }
  };

  const handleShowJoinCode = () => {
    setJoinCodeDialogOpen(true);
  };

  const copyJoinCode = () => {
    if (joinCodeInfo?.joinCode) {
      navigator.clipboard.writeText(joinCodeInfo.joinCode);
      toast.success('加入码已复制到剪贴板');
    }
  };

  const handleGenerateAttendanceCode = async () => {
    if (!id) return;
    
    try {
      setGenerateAttendanceCodeLoading(true);
      const response = await attendanceCodeService.generateAttendanceCode(
        parseInt(id), 
        attendanceDescription || '课堂考勤',
        attendanceValidMinutes
      );
      setAttendanceCodeInfo(response.data);
      setAttendanceCodeDialogOpen(true);
      setGenerateAttendanceCodeDialogOpen(false);
      setAttendanceDescription('');
      setAttendanceValidMinutes(10);
      toast.success('考勤码生成成功');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '生成考勤码失败');
    } finally {
      setGenerateAttendanceCodeLoading(false);
    }
  };

  const copyAttendanceCode = () => {
    if (attendanceCodeInfo?.attendanceCode) {
      navigator.clipboard.writeText(attendanceCodeInfo.attendanceCode);
      toast.success('考勤码已复制到剪贴板');
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (!classGroup) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6">班级不存在</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {classGroup.name}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          {classGroup.description || '暂无描述'}
        </Typography>
      </Paper>

      {/* 班级加入码卡片 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              班级加入码
            </Typography>
            {joinCodeInfo ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<QrCode2 />}
                  onClick={handleShowJoinCode}
                >
                  查看二维码
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={copyJoinCode}
                >
                  复制加入码
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<QrCode2 />}
                onClick={handleGenerateJoinCode}
                disabled={generateJoinCodeLoading}
              >
                生成加入码
              </Button>
            )}
          </Box>
          
          {joinCodeInfo ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                学生可以扫描加入码二维码或手动输入加入码来加入班级
              </Alert>
              <Typography variant="body2" color="text.secondary">
                加入码：<strong>{joinCodeInfo.joinCode}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                有效期至：{formatDateTime(joinCodeInfo.expiryTime)}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={joinCodeInfo.active ? "有效" : "已失效"}
                  color={joinCodeInfo.active ? "success" : "error"}
                  size="small"
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info">
              还没有生成班级加入码。生成后，学生可以通过扫描二维码加入班级。
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 考勤码管理卡片 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              考勤码管理
            </Typography>
            <Button
              variant="contained"
              startIcon={<AccessTime />}
              onClick={() => setGenerateAttendanceCodeDialogOpen(true)}
              color="secondary"
            >
              生成考勤码
            </Button>
          </Box>
          
          <Alert severity="info">
            生成考勤码后，学生可以扫描二维码进行签到。每个考勤码都有时间限制。
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              班级学生 ({classGroup.students?.length || 0}人)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<People />}
              disabled // 可以在这里添加手动添加学生的功能
            >
              管理学生
            </Button>
          </Box>
          
          {classGroup.students && classGroup.students.length > 0 ? (
            <List>
              {classGroup.students.map((student) => (
                <ListItem key={student.id}>
                  <ListItemText
                    primary={student.username}
                    secondary={`学号: ${student.studentId || 'N/A'}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                该班级暂无学生
              </Typography>
              {joinCodeInfo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  请将班级加入码分享给学生，让他们扫码加入班级
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 加入码二维码对话框 */}
      <Dialog open={joinCodeDialogOpen} onClose={() => setJoinCodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>班级加入二维码</DialogTitle>
        <DialogContent>
          {joinCodeInfo && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                {classGroup.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                学生扫描此二维码即可加入班级
              </Typography>
              
              {joinCodeInfo.qrImage && (
                <Box sx={{ my: 2 }}>
                  <img
                    src={joinCodeInfo.qrImage}
                    alt="班级加入二维码"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary">
                加入码：<strong>{joinCodeInfo.joinCode}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                有效期至：{formatDateTime(joinCodeInfo.expiryTime)}
              </Typography>
              
              <Button
                variant="outlined"
                onClick={copyJoinCode}
                sx={{ mt: 2 }}
              >
                复制加入码
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinCodeDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 生成考勤码对话框 */}
      <Dialog open={generateAttendanceCodeDialogOpen} onClose={() => setGenerateAttendanceCodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>生成考勤码</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="考勤描述"
            fullWidth
            variant="outlined"
            value={attendanceDescription}
            onChange={(e) => setAttendanceDescription(e.target.value)}
            placeholder="例如：第一节课考勤"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined">
            <InputLabel>有效时长（分钟）</InputLabel>
            <Select
              value={attendanceValidMinutes}
              onChange={(e) => setAttendanceValidMinutes(Number(e.target.value))}
              label="有效时长（分钟）"
            >
              <MenuItem value={5}>5分钟</MenuItem>
              <MenuItem value={10}>10分钟</MenuItem>
              <MenuItem value={15}>15分钟</MenuItem>
              <MenuItem value={30}>30分钟</MenuItem>
              <MenuItem value={60}>60分钟</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateAttendanceCodeDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleGenerateAttendanceCode}
            disabled={generateAttendanceCodeLoading}
            variant="contained"
          >
            {generateAttendanceCodeLoading ? <CircularProgress size={24} /> : '生成'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 考勤码二维码对话框 */}
      <Dialog open={attendanceCodeDialogOpen} onClose={() => setAttendanceCodeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>考勤二维码</DialogTitle>
        <DialogContent>
          {attendanceCodeInfo && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" gutterBottom>
                {attendanceCodeInfo.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                学生扫描此二维码即可签到
              </Typography>
              
              {attendanceCodeInfo.qrImage && (
                <Box sx={{ my: 2 }}>
                  <img
                    src={attendanceCodeInfo.qrImage}
                    alt="考勤二维码"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
              
              <Typography variant="body2" color="text.secondary">
                考勤码：<strong>{attendanceCodeInfo.attendanceCode}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                有效期至：{formatDateTime(attendanceCodeInfo.expiryTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                班级学生总数：{attendanceCodeInfo.totalStudents}人
              </Typography>
              
              <Button
                variant="outlined"
                onClick={copyAttendanceCode}
                sx={{ mt: 2 }}
              >
                复制考勤码
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceCodeDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassGroupDetail;
