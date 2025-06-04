// 教师考勤报告页面
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ClassGroup } from '../../interfaces';
import { attendanceService, classGroupService } from '../../services/api';

// 教师考勤报告页面
const AttendanceReport: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取教师班级
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        const response = await classGroupService.getTeacherClassGroups();
        setClassGroups(response.data);
        if (response.data.length > 0) {
          setSelectedClassGroup(response.data[0].id.toString());
        }
      } catch (err: any) {
        console.error('Error fetching class groups:', err);
        setError(err.response?.data?.message || '获取班级数据失败');
      }
    };

    fetchTeacherClasses();
  }, []);

  // 获取考勤报告
  const fetchAttendanceReport = useCallback(async () => {
    if (!selectedClassGroup) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await attendanceService.getClassAttendanceReport(Number(selectedClassGroup));
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching attendance report:', err);
      setError(err.response?.data?.message || '获取考勤报告失败');
    } finally {
      setLoading(false);
    }
  }, [selectedClassGroup]);

  // 选择班级变化时自动获取报告
  useEffect(() => {
    if (selectedClassGroup) {
      fetchAttendanceReport();
    }
  }, [selectedClassGroup, fetchAttendanceReport]);

  // 计算百分比
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (loading && !reportData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        班级考勤报告
      </Typography>

      {/* 班级选择 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>选择班级</InputLabel>
              <Select
                value={selectedClassGroup}
                label="选择班级"
                onChange={(e) => setSelectedClassGroup(e.target.value as string)}
              >
                {classGroups.map((group) => (
                  <MenuItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              onClick={fetchAttendanceReport}
              disabled={!selectedClassGroup || loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : '刷新报告'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 错误提示 */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      {/* 报告卡片 */}
      {reportData && (
        <>
          {/* 总体统计 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    班级名称
                  </Typography>
                  <Typography variant="h5" component="div">
                    {reportData.classGroup}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    总考勤次数
                  </Typography>
                  <Typography variant="h5" component="div">
                    {reportData.totalAttendance}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    出勤率
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatPercent(reportData.presentRate)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    缺勤次数
                  </Typography>
                  <Typography variant="h5" component="div">
                    {reportData.absentCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 学生统计表格 */}
          <Typography variant="h5" component="h2" gutterBottom>
            学生出勤详情
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>学号</TableCell>
                  <TableCell>总考勤次数</TableCell>
                  <TableCell>出勤次数</TableCell>
                  <TableCell>缺勤次数</TableCell>
                  <TableCell>出勤率</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.studentStats && Object.entries(reportData.studentStats).map(([studentId, stats]: [string, any]) => (
                  <TableRow key={studentId}>
                    <TableCell>{studentId}</TableCell>
                    <TableCell>{stats.total}</TableCell>
                    <TableCell>{stats.present}</TableCell>
                    <TableCell>{stats.absent}</TableCell>
                    <TableCell>{formatPercent(stats.presentRate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default AttendanceReport; 