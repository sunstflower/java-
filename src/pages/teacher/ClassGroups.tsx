// 教师班级管理页面
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ClassGroup } from '../../interfaces';
import { classGroupService } from '../../services/api';

// 表单验证架构
const validationSchema = Yup.object({
  name: Yup.string().required('请输入班级名称'),
  description: Yup.string(),
});

// 教师班级管理页面
const ClassGroups: React.FC = () => {
  const navigate = useNavigate();
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [selectedClassGroup, setSelectedClassGroup] = useState<ClassGroup | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // 加载教师班级列表
  useEffect(() => {
    fetchClassGroups();
  }, []);

  // 获取班级列表
  const fetchClassGroups = async () => {
    setLoading(true);
    try {
      const response = await classGroupService.getTeacherClassGroups();
      setClassGroups(response.data);
    } catch (err: any) {
      console.error('Error fetching class groups:', err);
      setError(err.response?.data?.message || '获取班级列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理班级创建
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await classGroupService.createClassGroup(values.name, values.description);
        resetForm();
        setOpenDialog(false);
        fetchClassGroups();
        showSnackbar('创建班级成功', 'success');
      } catch (err: any) {
        console.error('Error creating class group:', err);
        showSnackbar(err.response?.data?.message || '创建班级失败', 'error');
      }
    },
  });

  // 处理班级删除
  const handleDeleteClassGroup = async () => {
    if (!selectedClassGroup) return;
    
    try {
      await classGroupService.deleteClassGroup(selectedClassGroup.id);
      setDeleteConfirmOpen(false);
      setSelectedClassGroup(null);
      fetchClassGroups();
      showSnackbar('删除班级成功', 'success');
    } catch (err: any) {
      console.error('Error deleting class group:', err);
      showSnackbar(err.response?.data?.message || '删除班级失败', 'error');
    }
  };

  // 显示提示信息
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // 导航到班级详情
  const handleViewClassGroup = (id: number) => {
    navigate(`/teacher/classgroups/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          班级管理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          创建班级
        </Button>
      </Box>

      {/* 错误信息显示 */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      {/* 班级列表 */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {classGroups.length > 0 ? (
            classGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <GroupIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="h2">
                        {group.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {group.description || '无描述'}
                    </Typography>
                    <Typography variant="body2">
                      学生数量: {group.students?.length || 0}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewClassGroup(group.id)}
                    >
                      查看详情
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => {
                        setSelectedClassGroup(group);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      删除
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" paragraph>
                  您还没有创建任何班级
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  创建第一个班级
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* 创建班级对话框 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建新班级</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              请填写班级信息创建一个新的班级。
            </DialogContentText>
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
            <Button onClick={() => setOpenDialog(false)}>取消</Button>
            <Button type="submit" color="primary" variant="contained">
              创建
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要删除班级 "{selectedClassGroup?.name}" 吗？此操作无法撤销，并且将删除所有相关的考勤记录。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={handleDeleteClassGroup} color="error" autoFocus>
            删除
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

export default ClassGroups; 