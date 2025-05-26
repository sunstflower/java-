// 学生二维码页面
import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import QRCodeGenerator from '../../components/student/QRCodeGenerator';

// 学生二维码页面
const QRCode: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          考勤二维码
        </Typography>
        <Typography variant="body1" align="center" paragraph>
          生成您的考勤二维码，供老师扫描记录您的出勤情况。
        </Typography>
      </Box>
      
      <QRCodeGenerator />
      
      <Paper elevation={2} sx={{ p: 3, mt: 4, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          使用说明
        </Typography>
        <Typography variant="body2">
          1. 点击"生成二维码"按钮创建您的考勤二维码。<br />
          2. 二维码有效期为10分钟，过期后需要重新生成。<br />
          3. 向您的老师出示此二维码，让老师通过扫描记录您的出勤。<br />
          4. 每个二维码只能使用一次，使用后将自动失效。
        </Typography>
      </Paper>
    </Container>
  );
};

export default QRCode; 