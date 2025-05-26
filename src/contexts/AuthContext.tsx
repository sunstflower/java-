// 身份验证上下文
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContextType, User } from '../interfaces';
import { authService } from '../services/api';

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 身份验证提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // 初始化时检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // 登录函数
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const data = await authService.login(username, password);
      setUser(data);
      setIsAuthenticated(true);

      // 根据用户角色重定向到相应的仪表板
      if (data.role.includes('ROLE_STUDENT')) {
        navigate('/student/dashboard');
      } else if (data.role.includes('ROLE_TEACHER')) {
        navigate('/teacher/dashboard');
      } else {
        navigate('/dashboard');
      }

      toast.success('登录成功！');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登录失败，请检查您的凭据');
    } finally {
      setLoading(false);
    }
  };

  // 注册函数
  const register = async (
    username: string,
    email: string,
    password: string,
    role: string,
    userId: string
  ) => {
    try {
      setLoading(true);
      await authService.register(username, email, password, role, userId);
      toast.success('注册成功！请登录');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '注册失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
    toast.info('您已成功登出');
  };

  // 提供上下文值
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// 创建自定义钩子以便于使用上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 