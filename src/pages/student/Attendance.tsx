// 学生出勤记录页面
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/lab';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { Attendance as AttendanceType } from '../../interfaces';
import { attendanceService } from '../../services/api';

// 学生出勤记录页面
const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [attendances, setAttendances] = useState<AttendanceType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 格式化日期时间
  const formatDateTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateTimeString;
    }
  };

  // 加载学生考勤记录
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await attendanceService.getStudentAttendance(user.id);
        setAttendances(response.data);
      } catch (err: any) {
        console.error('Error fetching attendance records:', err);
        setError(err.response?.data?.message || '获取考勤记录失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [user]);

  // 按日期范围过滤考勤记录
  const filterByDateRange = async () => {
    if (!user || !startDate || !endDate) {
      setError('请选择开始和结束日期');
      return;
    }

    setLoading(true);
    try {
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');
      
      const response = await attendanceService.getStudentAttendanceByDateRange(
        user.id,
        start,
        end
      );
      
      setAttendances(response.data);
    } catch (err: any) {
      console.error('Error filtering attendance records:', err);
      setError(err.response?.data?.message || '过滤考勤记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置过滤器
  const resetFilter = async () => {
    setStartDate(null);
    setEndDate(null);
    
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await attendanceService.getStudentAttendance(user.id);
      setAttendances(response.data);
    } catch (err: any) {
      console.error('Error resetting attendance records:', err);
      setError(err.response?.data?.message || '重置考勤记录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          我的出勤记录
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          查看您的课堂出勤记录。
        </Typography>
      </Box>

      {/* 日期过滤器 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <DatePicker
              label="开始日期"
              value={startDate}
              onChange={(newValue: Date | null) => setStartDate(newValue)}
              renderInput={(params: any) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="结束日期"
              value={endDate}
              onChange={(newValue: Date | null) => setEndDate(newValue)}
              renderInput={(params: any) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={filterByDateRange}
                disabled={!startDate || !endDate}
                fullWidth
              >
                筛选
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={resetFilter}
                fullWidth
              >
                重置
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 错误信息 */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      {/* 考勤记录表格 */}
      <Paper sx={{ width: '100%', mb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>班级</TableCell>
                  <TableCell>签到时间</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>备注</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendances.length > 0 ? (
                  attendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell>{attendance.classGroup.name}</TableCell>
                      <TableCell>{formatDateTime(attendance.checkInTime)}</TableCell>
                      <TableCell>
                        {attendance.present ? (
                          <Chip label="出席" color="success" size="small" />
                        ) : (
                          <Chip label="缺席" color="error" size="small" />
                        )}
                      </TableCell>
                      <TableCell>{attendance.remarks || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      没有找到考勤记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default Attendance; 