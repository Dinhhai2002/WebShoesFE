// Return Request Types
export enum ReturnType {
  // Hoàn trả hàng
  RETURN_FULL = 'RETURN_FULL',
  RETURN_PARTIAL = 'RETURN_PARTIAL',
  
  // Đổi hàng
  EXCHANGE_FULL = 'EXCHANGE_FULL',
  EXCHANGE_PARTIAL = 'EXCHANGE_PARTIAL',
  
  // Legacy support (deprecated)
  REFUND = 'REFUND',
  EXCHANGE = 'EXCHANGE',
  PARTIAL_REFUND = 'PARTIAL_REFUND'
}

export const RETURN_TYPE_LABELS: Record<ReturnType, string> = {
  [ReturnType.RETURN_FULL]: 'Hoàn trả 100% đơn hàng',
  [ReturnType.RETURN_PARTIAL]: 'Hoàn trả một phần đơn hàng',
  [ReturnType.EXCHANGE_FULL]: 'Đổi 100% đơn hàng',
  [ReturnType.EXCHANGE_PARTIAL]: 'Đổi một phần đơn hàng',
  [ReturnType.REFUND]: 'Hoàn tiền',
  [ReturnType.EXCHANGE]: 'Đổi hàng',
  [ReturnType.PARTIAL_REFUND]: 'Hoàn tiền một phần'
};

// Return Request Status
export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  [ReturnStatus.PENDING]: 'Chờ duyệt',
  [ReturnStatus.APPROVED]: 'Đã duyệt',
  [ReturnStatus.REJECTED]: 'Từ chối',
  [ReturnStatus.PROCESSING]: 'Đang xử lý',
  [ReturnStatus.COMPLETED]: 'Hoàn thành',
  [ReturnStatus.CANCELLED]: 'Đã hủy'
};

// Exchange Request Status
export enum ExchangeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export const EXCHANGE_STATUS_LABELS: Record<ExchangeStatus, string> = {
  [ExchangeStatus.PENDING]: 'Chờ xử lý',
  [ExchangeStatus.APPROVED]: 'Đã duyệt',
  [ExchangeStatus.REJECTED]: 'Đã từ chối',
  [ExchangeStatus.PROCESSING]: 'Đang xử lý',
  [ExchangeStatus.COMPLETED]: 'Hoàn thành',
  [ExchangeStatus.CANCELLED]: 'Đã hủy'
};

// Status colors for UI
export const RETURN_STATUS_COLORS: Record<ReturnStatus, string> = {
  [ReturnStatus.PENDING]: '#FFA500', // Orange
  [ReturnStatus.APPROVED]: '#4CAF50', // Green
  [ReturnStatus.REJECTED]: '#F44336', // Red
  [ReturnStatus.PROCESSING]: '#2196F3', // Blue
  [ReturnStatus.COMPLETED]: '#4CAF50', // Green
  [ReturnStatus.CANCELLED]: '#9E9E9E' // Grey
};

export const EXCHANGE_STATUS_COLORS: Record<ExchangeStatus, string> = {
  [ExchangeStatus.PENDING]: '#FFA500', // Orange
  [ExchangeStatus.APPROVED]: '#4CAF50', // Green
  [ExchangeStatus.REJECTED]: '#F44336', // Red
  [ExchangeStatus.PROCESSING]: '#2196F3', // Blue
  [ExchangeStatus.COMPLETED]: '#4CAF50', // Green
  [ExchangeStatus.CANCELLED]: '#9E9E9E' // Grey
};

export const getReturnTypeLabel = (type: string): string => {
  return RETURN_TYPE_LABELS[type as ReturnType] || type;
};

export const getReturnStatusLabel = (status: string): string => {
  return RETURN_STATUS_LABELS[status as ReturnStatus] || status;
};

export const getReturnStatusColor = (status: string): string => {
  return RETURN_STATUS_COLORS[status as ReturnStatus] || '#000000';
};

export const getExchangeStatusLabel = (status: string): string => {
  return EXCHANGE_STATUS_LABELS[status as ExchangeStatus] || status;
};

export const getExchangeStatusColor = (status: string): string => {
  return EXCHANGE_STATUS_COLORS[status as ExchangeStatus] || '#000000';
};

// Check if status is actionable
export const isStatusActionable = (status: string): boolean => {
  return status === ReturnStatus.PENDING || status === ReturnStatus.APPROVED;
};

// Check if user can cancel
export const canUserCancel = (status: string): boolean => {
  return status === ReturnStatus.PENDING;
};

// Check if admin can approve/reject
export const canAdminApproveReject = (status: string): boolean => {
  return status === ReturnStatus.PENDING;
};

// Check if admin can process
export const canAdminProcess = (status: string): boolean => {
  return status === ReturnStatus.APPROVED;
};

// Check if admin can complete
export const canAdminComplete = (status: string): boolean => {
  return status === ReturnStatus.PROCESSING;
};

// Helper functions for return types
export const isReturnType = (type: string): boolean => {
  return type === ReturnType.RETURN_FULL || 
         type === ReturnType.RETURN_PARTIAL || 
         type === ReturnType.REFUND || 
         type === ReturnType.PARTIAL_REFUND;
};

export const isExchangeType = (type: string): boolean => {
  return type === ReturnType.EXCHANGE_FULL || 
         type === ReturnType.EXCHANGE_PARTIAL || 
         type === ReturnType.EXCHANGE;
};

export const isFullType = (type: string): boolean => {
  return type === ReturnType.RETURN_FULL || type === ReturnType.EXCHANGE_FULL;
};

export const isPartialType = (type: string): boolean => {
  return type === ReturnType.RETURN_PARTIAL || 
         type === ReturnType.EXCHANGE_PARTIAL || 
         type === ReturnType.PARTIAL_REFUND;
}; 