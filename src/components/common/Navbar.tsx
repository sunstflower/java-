// 导航栏组件
import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// 导航栏组件
const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // 菜单状态
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // 处理导航菜单打开
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  // 处理用户菜单打开
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // 处理导航菜单关闭
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // 处理用户菜单关闭
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // 处理导航链接点击
  const handleNavLinkClick = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  // 处理Logo点击
  const handleLogoClick = () => {
    if (!isAuthenticated || !user) {
      navigate('/');
    } else if (user.role.includes('ROLE_STUDENT')) {
      navigate('/student/dashboard');
    } else if (user.role.includes('ROLE_TEACHER')) {
      navigate('/teacher/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  // 根据用户角色获取页面链接
  const getPages = () => {
    if (!user || !isAuthenticated) {
      return [
        { title: '登录', path: '/login' },
        { title: '注册', path: '/register' },
      ];
    }

    if (user.role.includes('ROLE_STUDENT')) {
      return [
        { title: '我的主页', path: '/student/dashboard' },
        { title: '扫码功能', path: '/student/scanner' },
        { title: '我的二维码', path: '/student/qrcode' },
        { title: '出勤记录', path: '/student/attendance' },
      ];
    }

    if (user.role.includes('ROLE_TEACHER')) {
      return [
        { title: '教师主页', path: '/teacher/dashboard' },
        { title: '班级管理', path: '/teacher/classgroups' },
        { title: '考勤管理', path: '/teacher/attendance/management' },
        { title: '考勤报告', path: '/teacher/attendance/report' },
      ];
    }

    return [{ title: '主页', path: '/dashboard' }];
  };

  const pages = getPages();
  const settings = isAuthenticated
    ? [{ title: '个人资料', action: () => navigate('/profile') }, { title: '登出', action: handleLogout }]
    : [];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* 桌面端Logo显示 */}
          <Typography
            variant="h6"
            noWrap
            onClick={handleLogoClick}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            学生管理系统
          </Typography>

          {/* 移动端菜单按钮 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {/* 移动端菜单项 */}
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={() => handleNavLinkClick(page.path)}>
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* 移动端Logo显示 */}
          <Typography
            variant="h5"
            noWrap
            onClick={handleLogoClick}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            学生管理系统
          </Typography>

          {/* 桌面端菜单链接 */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                onClick={() => handleNavLinkClick(page.path)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* 用户菜单 */}
          {isAuthenticated && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="打开设置">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.username || ''} src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting.title} onClick={setting.action}>
                    <Typography textAlign="center">{setting.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 