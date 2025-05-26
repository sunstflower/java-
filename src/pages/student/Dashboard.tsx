// 学生仪表盘页面
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
  ListItemText,
  CircularProgress 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { ClassGroup, Student } from '../../interfaces';
import { classGroupService } from '../../services/api';

// 学生仪表盘页面
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 加载学生信息
  useEffect(() => {
    const fetchStudentClasses = async () => {
      setLoading(true);
      try {
        // 在实际应用中应创建一个专门的学生API端点来获取此信息
        const studentUser = user as Student;
        if (studentUser && studentUser.id) {
          // 获取学生的班级
          const response = await classGroupService.getAllClassGroups();
          // 假设后端返回学生的班级列表
          setClassGroups(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching student data:', err);
        setError(err.response?.data?.message || '获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentClasses();
  }, [user]);

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
              学生ID: {(user as Student)?.studentId || 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* 班级信息 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="我的班级" />
            <Divider />
            <CardContent>
              {classGroups.length > 0 ? (
                <List>
                  {classGroups.map((group) => (
                    <ListItem key={group.id}>
                      <ListItemText
                        primary={group.name}
                        secondary={`教师: ${group.teacher?.username || 'N/A'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  您目前没有加入任何班级
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 提醒卡片 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="提醒" />
            <Divider />
            <CardContent>
              <Typography variant="body2" paragraph>
                请记得在每节课开始时使用二维码进行签到。
              </Typography>
              <Typography variant="body2" color="text.secondary">
                您可以在"我的二维码"页面生成签到用的二维码。
              </Typography>
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