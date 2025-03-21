import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import addressBookApi, { AddressBook, AddressBookRequest } from '../services/API/AddressBookApi';
import authenticationApiService from '../services/API/AuthenticationApiService';

interface AddressManagementProps {
  userId: number;
}

const AddressManagement: React.FC<AddressManagementProps> = ({ userId }) => {
  const [addresses, setAddresses] = useState<AddressBook[]>([]);
  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressBook | null>(null);
  const [formData, setFormData] = useState<AddressBookRequest>({
    full_name: '',
    phone: '',
    ward_id: 0,
    ward_name: '',
    district_id: 0,
    district_name: '',
    city_id: 0,
    city_name: '',
    full_address: '',
    is_default: 0
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    fetchAddresses();
    fetchCities();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await addressBookApi.findAll({
        keySearch: '',
        status: 1,
        page: 1,
        limit: 10
      });
      setAddresses(response.data.list);
    } catch (error) {
      toast.error('Không thể tải danh sách địa chỉ');
    }
  };

  const fetchCities = async () => {
    try {
      const response = await authenticationApiService.getAllCity();
      setCities(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const fetchDistricts = async (cityId: number) => {
    try {
      const response = await authenticationApiService.findDistrictByCityId(cityId);
      setDistricts(response.data);
      setWards([]);
    } catch (error) {
      toast.error('Không thể tải danh sách quận/huyện');
    }
  };

  const fetchWards = async (districtId: number) => {
    try {
      const response = await authenticationApiService.findWardByDistrictId(districtId);
      setWards(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách phường/xã');
    }
  };

  const handleOpen = (address?: AddressBook) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        full_name: address.full_name,
        phone: address.phone,
        ward_id: address.ward_id,
        ward_name: address.ward_name,
        district_id: address.district_id,
        district_name: address.district_name,
        city_id: address.city_id,
        city_name: address.city_name,
        full_address: address.full_address,
        is_default: address.is_default
      });
      fetchDistricts(address.city_id);
      fetchWards(address.district_id);
    } else {
      setEditingAddress(null);
      setFormData({
        full_name: '',
        phone: '',
        ward_id: 0,
        ward_name: '',
        district_id: 0,
        district_name: '',
        city_id: 0,
        city_name: '',
        full_address: '',
        is_default: 0
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAddress(null);
    setFormData({
      full_name: '',
      phone: '',
      ward_id: 0,
      ward_name: '',
      district_id: 0,
      district_name: '',
      city_id: 0,
      city_name: '',
      full_address: '',
      is_default: 0
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name === 'city_id' && value) {
      const selectedCity = cities.find(city => city.id === value);
      setFormData(prev => ({
        ...prev,
        city_id: Number(value),
        city_name: selectedCity?.name || '',
        district_id: 0,
        district_name: '',
        ward_id: 0,
        ward_name: ''
      }));
      fetchDistricts(Number(value));
    } else if (name === 'district_id' && value) {
      const selectedDistrict = districts.find(district => district.id === value);
      setFormData(prev => ({
        ...prev,
        district_id: Number(value),
        district_name: selectedDistrict?.name || '',
        ward_id: 0,
        ward_name: ''
      }));
      fetchWards(Number(value));
    } else if (name === 'ward_id' && value) {
      const selectedWard = wards.find(ward => ward.id === value);
      setFormData(prev => ({
        ...prev,
        ward_id: Number(value),
        ward_name: selectedWard?.name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name as string]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.full_name) newErrors.full_name = 'Vui lòng nhập họ tên';
    if (!formData.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!formData.ward_id) newErrors.ward_id = 'Vui lòng chọn phường/xã';
    if (!formData.district_id) newErrors.district_id = 'Vui lòng chọn quận/huyện';
    if (!formData.city_id) newErrors.city_id = 'Vui lòng chọn tỉnh/thành phố';
    if (!formData.full_address) newErrors.full_address = 'Vui lòng nhập địa chỉ chi tiết';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingAddress) {
        await addressBookApi.update(editingAddress.id, formData);
        toast.success('Cập nhật địa chỉ thành công');
      } else {
        await addressBookApi.create(formData);
        toast.success('Thêm địa chỉ thành công');
      }
      handleClose();
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await addressBookApi.changeStatus(id);
        toast.success('Xóa địa chỉ thành công');
        fetchAddresses();
      } catch (error) {
        toast.error('Không thể xóa địa chỉ');
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressBookApi.setDefault(id);
      toast.success('Đã đặt làm địa chỉ mặc định');
      fetchAddresses();
    } catch (error) {
      toast.error('Không thể đặt làm địa chỉ mặc định');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Địa chỉ giao hàng</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm địa chỉ mới
        </Button>
      </Box>

      <List>
        {addresses.map((address) => (
          <React.Fragment key={address.id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {address.full_name}
                    {address.is_default === 1 && (
                      <Chip label="Mặc định" size="small" color="primary" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {address.phone}
                    </Typography>
                    <Typography variant="body2">
                      {address.full_address}
                      {address.ward_name && `, ${address.ward_name}`}
                      {address.district_name && `, ${address.district_name}`}
                      {address.city_name && `, ${address.city_name}`}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpen(address)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDelete(address.id)}
                  sx={{ mr: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
                {address.is_default !== 1 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Đặt làm mặc định
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth error={!!errors.city_id} sx={{ mb: 2 }}>
              <InputLabel>Tỉnh/Thành phố</InputLabel>
              <Select
                name="city_id"
                value={formData.city_id}
                onChange={handleChange}
                label="Tỉnh/Thành phố"
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.city_id}</FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!errors.district_id} sx={{ mb: 2 }}>
              <InputLabel>Quận/Huyện</InputLabel>
              <Select
                name="district_id"
                value={formData.district_id}
                onChange={handleChange}
                label="Quận/Huyện"
              >
                {districts.map((district) => (
                  <MenuItem key={district.id} value={district.id}>
                    {district.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.district_id}</FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!errors.ward_id} sx={{ mb: 2 }}>
              <InputLabel>Phường/Xã</InputLabel>
              <Select
                name="ward_id"
                value={formData.ward_id}
                onChange={handleChange}
                label="Phường/Xã"
              >
                {wards.map((ward) => (
                  <MenuItem key={ward.id} value={ward.id}>
                    {ward.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.ward_id}</FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              label="Địa chỉ chi tiết"
              name="full_address"
              value={formData.full_address}
              onChange={handleChange}
              error={!!errors.full_address}
              helperText={errors.full_address}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAddress ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressManagement; 