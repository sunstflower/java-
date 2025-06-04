import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 导入上下文提供者
import { AuthProvider } from './contexts/AuthContext';

// 导入公共组件
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// 导入身份验证相关页面
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// 导入学生相关页面
import StudentDashboard from './pages/student/Dashboard';
import StudentQRCode from './pages/student/QRCode';
import StudentAttendance from './pages/student/Attendance';
import QRScanner from './pages/student/QRScanner';

// 导入教师相关页面
import TeacherDashboard from './pages/teacher/Dashboard';
import ClassGroups from './pages/teacher/ClassGroups';
import ClassGroupDetail from './pages/teacher/ClassGroupDetail';
import TeacherAttendance from './pages/teacher/Attendance';
import AttendanceReport from './pages/teacher/AttendanceReport';

// 导入二维码表单页面
import JoinForm from './pages/student/JoinForm';

// 导入测试页面
import QRTest from './pages/test/QRTest';

// 主题配置
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// 主应用组件
const App: React.FC = () => {
  return (
    <BrowserRouter future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Navbar />
          <ToastContainer position="top-right" autoClose={5000} />
          
          {/* 路由配置 */}
          <Routes>
            {/* 公共路由 - 只允许未登录用户访问 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* 二维码表单页面 - 公共访问 */}
            <Route path="/join-form" element={<JoinForm />} />
            
            {/* 测试页面 - 公共访问 */}
            <Route path="/qr-test" element={<QRTest />} />
            
            {/* 学生受保护路由 */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/qrcode" element={<StudentQRCode />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/scanner" element={<QRScanner />} />
            </Route>
            
            {/* 教师受保护路由 */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_TEACHER']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/classgroups" element={<ClassGroups />} />
              <Route path="/teacher/classgroups/:id" element={<ClassGroupDetail />} />
              <Route path="/teacher/attendance" element={<TeacherAttendance />} />
              <Route path="/teacher/attendance/report" element={<AttendanceReport />} />
            </Route>
            
            {/* 404路由 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
