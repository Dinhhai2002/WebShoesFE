import { StatusOrderEnum } from '../utils/enum/StatusOrderEnum';
import { PaymentStatusEnum } from '../utils/enum/PaymentStatusEnum';

type ChipColor = 'warning' | 'info' | 'primary' | 'secondary' | 'success' | 'error' | 'default';

interface StatusConfig {
  color: ChipColor;
  label: string;
}

export const orderStatusConfig: Record<StatusOrderEnum, StatusConfig> = {
  [StatusOrderEnum.PENDING]: { color: 'warning', label: 'Chờ xác nhận' },
  [StatusOrderEnum.CONFIRMED]: { color: 'info', label: 'Đã xác nhận' },
  [StatusOrderEnum.PROCESSING]: { color: 'primary', label: 'Đang chuẩn bị hàng' },
  [StatusOrderEnum.SHIPPED]: { color: 'secondary', label: 'Đang giao hàng' },
  [StatusOrderEnum.DELIVERED]: { color: 'success', label: 'Đã giao hàng' },
  [StatusOrderEnum.CANCELLED]: { color: 'error', label: 'Đã hủy' }
};

export const paymentStatusConfig: Record<PaymentStatusEnum, StatusConfig> = {
  [PaymentStatusEnum.PENDING]: { color: 'warning', label: 'Chưa thanh toán' },
  [PaymentStatusEnum.PROCESSING]: { color: 'info', label: 'Đang xử lý' },
  [PaymentStatusEnum.PAID]: { color: 'success', label: 'Đã thanh toán' },
  [PaymentStatusEnum.FAILED]: { color: 'error', label: 'Thanh toán thất bại' },
  [PaymentStatusEnum.CANCELLED]: { color: 'error', label: 'Đã hủy' }
}; 