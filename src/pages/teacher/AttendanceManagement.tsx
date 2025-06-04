import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert
} from '@mui/material';
import {
  QrCode2,
  School,
  Schedule,
  People,
  CheckCircle,
  Cancel,
  Add
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { classGroupService, attendanceCodeService } from '../../services/api';

interface ClassGroup {
  id: number;
  name: string;
  description: string;
  students: any[];
}

interface AttendanceCode {
  id: number;
  attendanceCode: string;
  description: string;
  generatedTime: string;
  expiryTime: string;
  active: boolean;
  attendedStudents: any[];
}

const AttendanceManagement: React.FC = () => {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState<number | ''>('');
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceCode[]>([]);
  const [currentAttendanceCode, setCurrentAttendanceCode] = useState<any>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  
  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [validMinutes, setValidMinutes] = useState(10);
  const [loading, setLoading] = useState(false);

  // 加载教师班级
  useEffect(() => {
    loadTeacherClassGroups();
  }, []);

  // 当选择班级时加载考勤历史
  useEffect(() => {
    if (selectedClassGroup) {
      loadAttendanceHistory(selectedClassGroup as number);
    }
  }, [selectedClassGroup]);

  const loadTeacherClassGroups = async () => {
    try {
      const response = await classGroupService.getTeacherClassGroups();
      setClassGroups(response.data);
    } catch (error) {
      toast.error('加载班级列表失败');
    }
  };

  const loadAttendanceHistory = async (classGroupId: number) => {
    try {
      const response = await attendanceCodeService.getAttendanceHistory(classGroupId);
      setAttendanceHistory(response.data);
    } catch (error) {
      toast.error('加载考勤历史失败');
    }
  };

  const handleCreateAttendanceCode = async () => {
    if (!selectedClassGroup || !description) {
      toast.error('请选择班级并填写考勤描述');
      return;
    }

    try {
      setLoading(true);
      const response = await attendanceCodeService.generateAttendanceCode(
        selectedClassGroup as number,
        description,
        validMinutes
      );
      
      setCurrentAttendanceCode(response.data);
      setQrCodeImage(response.data.qrImage);
      setCreateDialogOpen(false);
      setDescription('');
      toast.success('考勤码创建成功');
      
      // 刷新考勤历史
      loadAttendanceHistory(selectedClassGroup as number);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '创建考勤码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEndAttendance = async (attendanceCodeId: number) => {
    try {
      await attendanceCodeService.endAttendance(attendanceCodeId);
      toast.success('考勤已结束');
      
      // 刷新状态
      if (currentAttendanceCode && currentAttendanceCode.attendanceCodeId === attendanceCodeId) {
        setCurrentAttendanceCode(null);
        setQrCodeImage('');
      }
      loadAttendanceHistory(selectedClassGroup as number);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '结束考勤失败');
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('zh-CN');
  };

  const isExpired = (expiryTime: string) => {
    return new Date(expiryTime) < new Date();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        考勤管理
      </Typography>

      {/* 班级选择 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>选择班级</InputLabel>
            <Select
              value={selectedClassGroup}
              onChange={(e) => setSelectedClassGroup(e.target.value as number | '')}
              label="选择班级"
            >
              {classGroups.map((classGroup) => (
                <MenuItem key={classGroup.id} value={classGroup.id}>
                  {classGroup.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={!selectedClassGroup}
          >
            创建考勤码
          </Button>
        </Box>

        {selectedClassGroup && (
          <Alert severity="info">
            已选择班级：{classGroups.find(c => c.id === selectedClassGroup)?.name}
            （学生数：{classGroups.find(c => c.id === selectedClassGroup)?.students?.length || 0}）
          </Alert>
        )}
      </Paper>

      {/* 当前活跃的考勤码 */}
      {currentAttendanceCode && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            当前考勤
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {currentAttendanceCode.description}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    考勤码：{currentAttendanceCode.attendanceCode}
                  </Typography>
                  <Typography variant="body2">
                    截止时间：{formatDateTime(currentAttendanceCode.expiryTime)}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={<People />}
                      label={`已签到：${currentAttendanceCode.attendedCount || 0} / ${currentAttendanceCode.totalStudents || 0}`}
                      color="primary"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    color="error"
                    onClick={() => handleEndAttendance(currentAttendanceCode.attendanceCodeId)}
                  >
                    结束考勤
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              {qrCodeImage && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    扫描二维码签到
                  </Typography>
                  <img
                    src={qrCodeImage}
                    alt="考勤二维码"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* 考勤历史 */}
      {selectedClassGroup && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            考勤历史
          </Typography>
          
          {attendanceHistory.length === 0 ? (
            <Typography color="text.secondary">
              暂无考勤记录
            </Typography>
          ) : (
            <List>
              {attendanceHistory.map((attendance, index) => (
                <React.Fragment key={attendance.id}>
                  <ListItem>
                    <ListItemIcon>
                      {attendance.active && !isExpired(attendance.expiryTime) ? (
                        <Schedule color="primary" />
                      ) : (
                        <CheckCircle color={attendance.active ? 'success' : 'disabled'} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={attendance.description}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            创建时间：{formatDateTime(attendance.generatedTime)}
                          </Typography>
                          <Typography variant="body2">
                            截止时间：{formatDateTime(attendance.expiryTime)}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              label={attendance.active ? '进行中' : '已结束'}
                              color={attendance.active ? 'primary' : 'default'}
                              sx={{ mr: 1 }}
                            />
                            {isExpired(attendance.expiryTime) && (
                              <Chip
                                size="small"
                                label="已过期"
                                color="error"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < attendanceHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* 创建考勤码对话框 */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建考勤码</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="考勤描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            placeholder="例如：第1节课"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>有效时长（分钟）</InputLabel>
            <Select
              value={validMinutes}
              onChange={(e) => setValidMinutes(e.target.value as number)}
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
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateAttendanceCode} variant="contained" disabled={loading}>
            创建
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AttendanceManagement; 