// 定义应用中使用的TypeScript接口

// 用户相关接口
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  userId: string;
}

// 班级相关接口
export interface ClassGroup {
  id: number;
  name: string;
  description: string;
  teacher: Teacher;
  students: Student[];
}

export interface ClassGroupCreateRequest {
  name: string;
  description: string;
}

// 学生相关接口
export interface Student extends User {
  studentId: string;
  classGroups: ClassGroup[];
}

// 教师相关接口
export interface Teacher extends User {
  teacherId: string;
  classGroups: ClassGroup[];
}

// 班级加入码相关接口
export interface ClassJoinCode {
  id: number;
  classGroup: ClassGroup;
  joinCode: string;
  generatedTime: string;
  expiryTime: string;
  active: boolean;
}

export interface ClassJoinRequest {
  joinCode: string;
  studentName: string;
  studentId: string;
}

export interface ClassJoinResponse {
  success: boolean;
  message: string;
  className: string;
  teacherName: string;
}

// 考勤码相关接口
export interface AttendanceCode {
  id: number;
  classGroup: ClassGroup;
  teacher: Teacher;
  attendanceCode: string;
  description: string;
  generatedTime: string;
  expiryTime: string;
  active: boolean;
  attendedStudents: Student[];
}

export interface AttendanceCodeCreateRequest {
  classGroupId: number;
  description: string;
  validMinutes: number;
}

export interface AttendanceCodeResponse {
  attendanceCodeId: number;
  attendanceCode: string;
  qrImage: string;
  description: string;
  expiryTime: string;
  classGroup: string;
  totalStudents: number;
}

export interface AttendanceCheckinRequest {
  attendanceCode: string;
}

export interface AttendanceCheckinResponse {
  success: boolean;
  message: string;
  className: string;
  description: string;
  checkinTime: string;
}

// 考勤相关接口
export interface Attendance {
  id: number;
  student: Student;
  classGroup: ClassGroup;
  checkInTime: string;
  present: boolean;
  remarks: string;
}

export interface AttendanceCreateRequest {
  studentId: number;
  classGroupId: number;
  present: boolean;
  remarks: string;
}

// QR码相关接口
export interface QRCode {
  id: number;
  student: Student;
  code: string;
  generatedTime: string;
  expiryTime: string;
  used: boolean;
}

export interface QRCodeResponse {
  qrCodeId: number;
  qrCodeImage: string;
  expiryTime: string;
}

export interface QRCodeVerifyResponse {
  success: boolean;
  studentId: number;
  studentName: string;
}

// API响应通用接口
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// 路由路径枚举
export enum RoutePath {
  HOME = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  DASHBOARD = '/dashboard',
  STUDENT_DASHBOARD = '/student/dashboard',
  TEACHER_DASHBOARD = '/teacher/dashboard',
  CLASS_GROUPS = '/teacher/classgroups',
  CLASS_GROUP_DETAIL = '/teacher/classgroups/:id',
  ATTENDANCE = '/teacher/attendance',
  ATTENDANCE_REPORT = '/teacher/attendance/report',
  ATTENDANCE_MANAGEMENT = '/teacher/attendance/management',
  STUDENT_QR_CODE = '/student/qrcode',
  STUDENT_ATTENDANCE = '/student/attendance',
  STUDENT_SCANNER = '/student/scanner',
  PROFILE = '/profile',
}

// 上下文相关接口
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string,
    role: string,
    userId: string
  ) => Promise<void>;
} 