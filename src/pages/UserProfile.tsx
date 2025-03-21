import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Grid,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import { PhotoCamera, Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import userApiService from '../services/API/UserApiService';
import { UserResponse } from '../services/API/UserApiService';
import AddressManagement from '../components/AddressManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    full_address: '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await userApiService.getUser();
      setUser(response.data);
      setFormData({
        full_name: response.data.full_name,
        email: response.data.email,
        phone: response.data.phone,
        full_address: response.data.full_address,
      });
      setAvatarPreview(response.data.avatar_url);
      
      // Lưu thông tin user vào localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error: any) {
      toast.error('Không thể tải thông tin người dùng');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateProfileForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.full_name) newErrors.full_name = 'Vui lòng nhập họ tên';
    
    if (!formData.email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
    
    if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại phải là 10 chữ số';
    
    if (!formData.full_address) newErrors.full_address = 'Vui lòng nhập địa chỉ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!passwordData.old_password) newErrors.old_password = 'Vui lòng nhập mật khẩu hiện tại';
    
    if (!passwordData.new_password) newErrors.new_password = 'Vui lòng nhập mật khẩu mới';
    else if (passwordData.new_password.length < 8 || passwordData.new_password.length > 20) {
      newErrors.new_password = 'Mật khẩu phải từ 8-20 ký tự';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(passwordData.new_password)) {
      newErrors.new_password = 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt';
    }
    
    if (!passwordData.confirm_password) newErrors.confirm_password = 'Vui lòng xác nhận mật khẩu';
    else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    setLoading(true);
    try {
      let updatedUserData = { ...user };
      
      // Upload avatar if changed
      if (avatarFile) {
        const avatarResponse = await userApiService.uploadAvatar(avatarFile);
        updatedUserData = {
          ...updatedUserData,
          avatar_id: avatarResponse.data.id,
          avatar_url: avatarResponse.data.url
        };
      }

      // Update user profile
      const response = await userApiService.update(formData);
      updatedUserData = {
        ...updatedUserData,
        ...response.data
      };

      // Cập nhật state và localStorage
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      toast.success('Cập nhật thông tin thành công');
      fetchUserData();
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      await userApiService.changePassword(passwordData);
      toast.success('Đổi mật khẩu thành công');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Thông Tin Cá Nhân" />
            <Tab label="Đổi Mật Khẩu" />
            <Tab label="Địa Chỉ Giao Hàng" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleProfileSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={avatarPreview}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton color="primary" component="span">
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            <TextField
              fullWidth
              label="Họ tên"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              error={!!errors.full_name}
              helperText={errors.full_name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              name="full_address"
              value={formData.full_address}
              onChange={handleChange}
              error={!!errors.full_address}
              helperText={errors.full_address}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Cập Nhật Thông Tin'}
            </Button>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handlePasswordSubmit}>
            <TextField
              fullWidth
              label="Mật khẩu hiện tại"
              name="old_password"
              type={showPasswords.old_password ? 'text' : 'password'}
              value={passwordData.old_password}
              onChange={handlePasswordChange}
              error={!!passwordErrors.old_password}
              helperText={passwordErrors.old_password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('old_password')}
                      edge="end"
                    >
                      {showPasswords.old_password ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mật khẩu mới"
              name="new_password"
              type={showPasswords.new_password ? 'text' : 'password'}
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              error={!!passwordErrors.new_password}
              helperText={passwordErrors.new_password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new_password')}
                      edge="end"
                    >
                      {showPasswords.new_password ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              name="confirm_password"
              type={showPasswords.confirm_password ? 'text' : 'password'}
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              error={!!passwordErrors.confirm_password}
              helperText={passwordErrors.confirm_password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm_password')}
                      edge="end"
                    >
                      {showPasswords.confirm_password ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đổi Mật Khẩu'}
            </Button>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {user && <AddressManagement userId={user.id} />}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default UserProfile; 