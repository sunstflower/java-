// 学生二维码生成器组件
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { format } from 'date-fns';
import { QRCodeResponse } from '../../interfaces';
import { qrCodeService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// 二维码生成器组件
const QRCodeGenerator: React.FC = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 格式化过期时间
  const formatExpiryTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateTimeString;
    }
  };

  // 生成二维码
  const generateQRCode = async () => {
    if (!user) {
      setError('用户未登录');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await qrCodeService.generateQRCode(user.id);
      setQrCode(response.data);
    } catch (error: any) {
      console.error('QR code generation error:', error);
      setError(error.response?.data?.message || '生成二维码时出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, px: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          考勤二维码
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
          生成一个用于课堂考勤的二维码。教师可以使用此二维码记录您的出勤情况。
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mt: 2, mb: 2 }} align="center">
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: qrCode ? 4 : 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateQRCode}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '生成二维码'}
          </Button>
        </Box>

        {qrCode && (
          <Card sx={{ maxWidth: 400, mx: 'auto', mt: 3 }}>
            <CardMedia
              component="img"
              image={`data:image/png;base64,${qrCode.qrCodeImage}`}
              alt="考勤二维码"
              sx={{ maxHeight: 300, objectFit: 'contain', bgcolor: 'white', p: 1 }}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                二维码ID: {qrCode.qrCodeId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                过期时间: {formatExpiryTime(qrCode.expiryTime)}
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                此二维码将于10分钟后过期，请尽快使用
              </Typography>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );
};

export default QRCodeGenerator; 