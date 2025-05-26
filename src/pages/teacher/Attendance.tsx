// 教师考勤页面
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import QRCodeScanner from '../../components/teacher/QRCodeScanner';

// 教师考勤页面
const Attendance: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          扫描考勤
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          使用二维码扫描记录学生出勤情况
        </Typography>
      </Box>
      
      <QRCodeScanner />
    </Container>
  );
};

export default Attendance; 