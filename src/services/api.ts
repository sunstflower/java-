// API服务封装
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// 创建Axios实例
const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，处理Authorization头
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器，处理错误和JWT过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 对401错误（未授权），可能是token过期
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 跳转到登录页面
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 封装API调用方法
const authService = {
  // 用户登录
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  // 用户注册
  register: async (username: string, email: string, password: string, role: string, userId: string) => {
    return await api.post('/auth/register', { username, email, password, role, userId });
  },

  // 用户登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // 检查用户是否已登录及token是否有效
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      // 检查token是否过期
      return (decoded as any).exp * 1000 > Date.now();   // 过期时间戳
    } catch (e) {
      return false;
    }
  },
};

// 班级加入服务
const classJoinService = {
  // 生成班级加入码
  generateJoinCode: async (classGroupId: number) => {
    return await api.post(`/class-join/generate/${classGroupId}`);
  },

  // 获取班级加入码信息
  getJoinCodeInfo: async (classGroupId: number) => {
    return await api.get(`/class-join/info/${classGroupId}`);
  },

  // 学生加入班级
  joinClass: async (data: { joinCode: string; studentName: string; studentId: string; password?: string }) => {
    return await api.post('/class-join/join', data);
  },
};

// 考勤码服务
const attendanceCodeService = {
  // 教师生成考勤码
  generateAttendanceCode: async (classGroupId: number, description: string, validMinutes: number = 10) => {
    return await api.post('/attendance/generate', { classGroupId, description, validMinutes });
  },

  // 学生签到
  checkIn: async (attendanceCode: string) => {
    return await api.post('/attendance/checkin', { attendanceCode });
  },

  // 无需认证的考勤码验证（用于表单页面）
  verifyAttendanceCode: async (attendanceCode: string, username: string) => {
    return await api.post('/attendance/verify', { attendanceCode, username });
  },

  // 带用户信息的考勤签到（用于表单页面）
  checkInWithUserInfo: async (attendanceCode: string, username: string, password: string) => {
    return await api.post('/attendance/checkin-with-user', { attendanceCode, username, password });
  },

  // 获取考勤状态
  getAttendanceStatus: async (attendanceCodeId: number) => {
    return await api.get(`/attendance/status/${attendanceCodeId}`);
  },

  // 获取考勤历史
  getAttendanceHistory: async (classGroupId: number) => {
    return await api.get(`/attendance/history/${classGroupId}`);
  },

  // 结束考勤
  endAttendance: async (attendanceCodeId: number) => {
    return await api.post(`/attendance/end/${attendanceCodeId}`);
  },
};

const qrCodeService = {
  // 生成二维码
  generateQRCode: async (studentId: number) => {
    return await api.post(`/qrcode/generate/${studentId}`);
  },

  // 验证二维码
  verifyQRCode: async (code: string) => {
    return await api.post(`/qrcode/verify/${code}`);
  },
};

const classGroupService = {
  // 获取所有班级
  getAllClassGroups: async () => {
    return await api.get('/classgroups');
  },

  // 获取单个班级详情
  getClassGroupById: async (id: number) => {
    return await api.get(`/classgroups/${id}`);
  },

  // 获取教师的班级
  getTeacherClassGroups: async () => {
    return await api.get('/classgroups/teacher');
  },

  // 创建班级
  createClassGroup: async (name: string, description: string) => {
    return await api.post('/classgroups', { name, description });
  },

  // 更新班级
  updateClassGroup: async (id: number, name: string, description: string) => {
    return await api.put(`/classgroups/${id}`, { name, description });
  },

  // 删除班级
  deleteClassGroup: async (id: number) => {
    return await api.delete(`/classgroups/${id}`);
  },

  // 添加学生到班级
  addStudentToClassGroup: async (classGroupId: number, studentId: number) => {
    return await api.post(`/classgroups/${classGroupId}/students/${studentId}`);
  },

  // 从班级移除学生
  removeStudentFromClassGroup: async (classGroupId: number, studentId: number) => {
    return await api.delete(`/classgroups/${classGroupId}/students/${studentId}`);
  },
};

const attendanceService = {
  // 记录出勤
  recordAttendance: async (studentId: number, classGroupId: number, present: boolean, remarks: string) => {
    return await api.post('/attendance', { studentId, classGroupId, present, remarks });
  },

  // 获取学生出勤记录
  getStudentAttendance: async (studentId: number) => {
    return await api.get(`/attendance/student/${studentId}`);
  },

  // 获取班级出勤记录
  getClassAttendance: async (classGroupId: number) => {
    return await api.get(`/attendance/class/${classGroupId}`);
  },

  // 按日期获取班级出勤记录
  getClassAttendanceByDate: async (classGroupId: number, date: string) => {
    return await api.get(`/attendance/class/${classGroupId}/date/${date}`);
  },

  // 获取学生在特定日期范围内的出勤记录
  getStudentAttendanceByDateRange: async (studentId: number, startDate: string, endDate: string) => {
    return await api.get(`/attendance/student/${studentId}/daterange`, {
      params: { startDate, endDate },
    });
  },

  // 获取班级考勤报告
  getClassAttendanceReport: async (classGroupId: number) => {
    return await api.get(`/attendance/report/class/${classGroupId}`);
  },

  // 获取学生考勤报告
  getStudentAttendanceReport: async (studentId: number) => {
    return await api.get(`/attendance/report/student/${studentId}`);
  }
};

export { 
  api, 
  authService, 
  classJoinService, 
  attendanceCodeService, 
  qrCodeService, 
  classGroupService, 
  attendanceService 
}; 