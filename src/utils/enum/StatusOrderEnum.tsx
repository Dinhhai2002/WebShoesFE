export enum StatusOrderEnum {
    PENDING = 1,     // Đơn hàng mới được tạo, đang chờ xác nhận
    CONFIRMED = 2,   // Đơn hàng đã được xác nhận bởi hệ thống hoặc người bán
    PROCESSING = 3,  // Đơn hàng đang được chuẩn bị (đóng gói, xuất kho, v.v.)
    SHIPPED = 4,     // Đơn hàng đã được gửi đi cho đơn vị vận chuyển
    DELIVERED = 5,   // Đơn hàng đã được giao thành công đến khách hàng
    CANCELLED = 6    // Đơn hàng bị hủy (do khách hàng hoặc người bán)
}

// Helper function to check if a status value is valid
export const isValidOrderStatus = (status: number): boolean => {
    return Object.values(StatusOrderEnum).includes(status);
}; 