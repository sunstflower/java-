// 公共路由组件 - 只允许未认证用户访问（如登录、注册页面）
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface PublicRouteProps {
  children: React.ReactNode;
}

// 公共路由组件 - 防止已登录用户访问登录/注册页面
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 如果正在加载，显示加载指示器
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 如果已认证，重定向到适当的仪表板
  if (isAuthenticated && user) {
    if (user.role.includes('ROLE_STUDENT')) {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role.includes('ROLE_TEACHER')) {
      return <Navigate to="/teacher/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 如果未认证，允许访问公共页面
  return <>{children}</>;
};

export default PublicRoute; 