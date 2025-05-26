// 教师仪表盘页面
import React, { useEffect, useState } from 'react';
import { 
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ClassOutlined, PersonOutlined, QrCodeScannerOutlined } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ClassGroup, Teacher } from '../../interfaces';
import { classGroupService } from '../../services/api';

// 教师仪表盘页面
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState<number>(0);

  // 加载教师班级信息
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      setLoading(true);
      try {
        const response = await classGroupService.getTeacherClassGroups();
        setClassGroups(response.data);
        
        // 计算学生总数
        let studentCount = 0;
        response.data.forEach((group: ClassGroup) => {
          studentCount += group.students?.length || 0;
        });
        setTotalStudents(studentCount);
      } catch (err: any) {
        console.error('Error fetching teacher data:', err);
        setError(err.response?.data?.message || '获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* 欢迎卡片 */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Typography component="h1" variant="h5" gutterBottom>
              欢迎回来，{user?.username}！
            </Typography>
            <Typography variant="body1">
              教师ID: {(user as Teacher)?.teacherId || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* 统计卡片 */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                班级数量
              </Typography>
              <Typography variant="h3" component="div">
                {classGroups.length}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/teacher/classgroups"
                  variant="text"
                  color="primary"
                  endIcon={<ClassOutlined />}
                >
                  管理班级
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                学生总数
              </Typography>
              <Typography variant="h3" component="div">
                {totalStudents}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/teacher/attendance/report"
                  variant="text"
                  color="primary"
                  endIcon={<PersonOutlined />}
                >
                  查看考勤报告
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                考勤管理
              </Typography>
              <Typography variant="h3" component="div">
                快速操作
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/teacher/attendance"
                  variant="text"
                  color="primary"
                  endIcon={<QrCodeScannerOutlined />}
                >
                  扫码考勤
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 班级列表 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="我的班级" />
            <Divider />
            <CardContent>
              {classGroups.length > 0 ? (
                <List>
                  {classGroups.map((group) => (
                    <ListItem
                      key={group.id}
                      button
                      component={RouterLink}
                      to={`/teacher/classgroups/${group.id}`}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <ClassOutlined />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={group.name}
                        secondary={`${group.students?.length || 0} 名学生 | ${group.description || '无描述'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    您目前没有创建任何班级
                  </Typography>
                  <Button 
                    component={RouterLink} 
                    to="/teacher/classgroups"
                    variant="contained"
                    color="primary"
                  >
                    创建班级
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 错误信息显示 */}
        {error && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography>{error}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard; 