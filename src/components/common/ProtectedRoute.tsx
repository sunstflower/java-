// 受保护路由组件 - 只允许已认证用户访问
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // 可选：允许的角色列表
}

// 受保护路由组件
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 如果正在加载，显示加载指示器
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 如果指定了允许的角色，检查用户角色
  if (allowedRoles && user) {
    const hasAllowedRole = allowedRoles.some(role => user.role.includes(role));
    
    if (!hasAllowedRole) {
      // 如果用户没有所需角色，重定向到适当的页面
      if (user.role.includes('ROLE_STUDENT')) {
        return <Navigate to="/student/dashboard" replace />;
      } else if (user.role.includes('ROLE_TEACHER')) {
        return <Navigate to="/teacher/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // 如果认证且有所需角色（或未指定角色），渲染子路由
  return <Outlet />;
};

export default ProtectedRoute; 