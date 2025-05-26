// 班级详情页面
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ClassGroup, Student } from '../../interfaces';
import { classGroupService } from '../../services/api';

// 表单验证架构
const validationSchema = Yup.object({
  name: Yup.string().required('请输入班级名称'),
  description: Yup.string(),
});

// 标签面板组件
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// 班级详情页面
const ClassGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState<boolean>(false);
  const [studentIdToAdd, setStudentIdToAdd] = useState<string>('');
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [tabValue, setTabValue] = useState<number>(0);

  // 加载班级详情
  useEffect(() => {
    if (!id) return;
    
    const fetchClassGroupDetails = async () => {
      setLoading(true);
      try {
        const response = await classGroupService.getClassGroupById(parseInt(id));
        setClassGroup(response.data);
      } catch (err: any) {
        console.error('Error fetching class group details:', err);
        setError(err.response?.data?.message || '获取班级详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchClassGroupDetails();
  }, [id]);

  // 编辑班级表单
  const formik = useFormik({
    initialValues: {
      name: classGroup?.name || '',
      description: classGroup?.description || '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!id) return;
      
      try {
        await classGroupService.updateClassGroup(parseInt(id), values.name, values.description);
        setEditDialogOpen(false);
        
        // 更新本地状态
        if (classGroup) {
          setClassGroup({
            ...classGroup,
            name: values.name,
            description: values.description
          });
        }
        
        showSnackbar('更新班级成功', 'success');
      } catch (err: any) {
        console.error('Error updating class group:', err);
        showSnackbar(err.response?.data?.message || '更新班级失败', 'error');
      }
    },
  });

  // 处理添加学生
  const handleAddStudent = async () => {
    if (!id || !studentIdToAdd) return;
    
    try {
      // 这里假设有一个API可以通过学生ID添加学生到班级
      await classGroupService.addStudentToClassGroup(parseInt(id), parseInt(studentIdToAdd));
      setAddStudentDialogOpen(false);
      setStudentIdToAdd('');
      
      // 重新加载班级详情
      const response = await classGroupService.getClassGroupById(parseInt(id));
      setClassGroup(response.data);
      
      showSnackbar('添加学生成功', 'success');
    } catch (err: any) {
      console.error('Error adding student:', err);
      showSnackbar(err.response?.data?.message || '添加学生失败', 'error');
    }
  };

  // 处理移除学生
  const handleRemoveStudent = async () => {
    if (!id || !selectedStudent) return;
    
    try {
      await classGroupService.removeStudentFromClassGroup(parseInt(id), selectedStudent.id);
      setRemoveConfirmOpen(false);
      setSelectedStudent(null);
      
      // 更新本地状态
      if (classGroup && classGroup.students) {
        setClassGroup({
          ...classGroup,
          students: classGroup.students.filter(s => s.id !== selectedStudent.id)
        });
      }
      
      showSnackbar('移除学生成功', 'success');
    } catch (err: any) {
      console.error('Error removing student:', err);
      showSnackbar(err.response?.data?.message || '移除学生失败', 'error');
    }
  };

  // 显示提示信息
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 处理标签变更
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !classGroup) {
    return (
      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            错误
          </Typography>
          <Typography>{error || '无法加载班级详情'}</Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/teacher/classgroups')}
          >
            返回班级列表
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 班级信息卡片 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {classGroup.name}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
          >
            编辑
          </Button>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 1 }}>
          {classGroup.description || '无描述'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            教师: {classGroup.teacher?.username || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            学生人数: {classGroup.students?.length || 0}
          </Typography>
        </Box>
      </Paper>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="班级管理标签页">
          <Tab label="学生管理" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="考勤记录" id="tab-1" aria-controls="tabpanel-1" disabled />
        </Tabs>
      </Box>

      {/* 学生管理标签面板 */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardHeader
            title="学生列表"
            action={
              <Button
                startIcon={<AddIcon />}
                color="primary"
                onClick={() => setAddStudentDialogOpen(true)}
              >
                添加学生
              </Button>
            }
          />
          <Divider />
          <CardContent sx={{ p: 0 }}>
            <List>
              {classGroup.students && classGroup.students.length > 0 ? (
                classGroup.students.map((student) => (
                  <React.Fragment key={student.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.username}
                        secondary={`学号: ${student.studentId} | ${student.email}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="删除"
                          onClick={() => {
                            setSelectedStudent(student);
                            setRemoveConfirmOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="班级中还没有学生" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 考勤记录标签面板 */}
      <TabPanel value={tabValue} index={1}>
        <Typography>考勤记录功能尚未实现</Typography>
      </TabPanel>

      {/* 编辑班级对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>编辑班级</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="班级名称"
              type="text"
              fullWidth
              variant="outlined"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="description"
              name="description"
              label="班级描述"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button type="submit" color="primary" variant="contained">
              保存
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 添加学生对话框 */}
      <Dialog open={addStudentDialogOpen} onClose={() => setAddStudentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加学生</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            请输入要添加到班级的学生ID。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="studentId"
            label="学生ID"
            type="text"
            fullWidth
            variant="outlined"
            value={studentIdToAdd}
            onChange={(e) => setStudentIdToAdd(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleAddStudent}
            color="primary"
            variant="contained"
            disabled={!studentIdToAdd}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>

      {/* 移除学生确认对话框 */}
      <Dialog
        open={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
      >
        <DialogTitle>确认移除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要将学生 "{selectedStudent?.username}" 从班级中移除吗？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveConfirmOpen(false)}>取消</Button>
          <Button onClick={handleRemoveStudent} color="error" autoFocus>
            移除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClassGroupDetail; 