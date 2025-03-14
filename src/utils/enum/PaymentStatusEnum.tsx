export enum PaymentStatusEnum {
    PENDING = 1,     // Chưa thanh toán – Đơn hàng đã được tạo nhưng chưa thực hiện thanh toán
    PROCESSING = 2,  // Đang chờ thanh toán – Đã chọn phương thức thanh toán online nhưng chưa hoàn tất giao dịch
    PAID = 3,        // Đã thanh toán – Thanh toán đã được xác nhận thành công
    FAILED = 4       // Thanh toán thất bại – Thanh toán không thành công (có thể do lỗi hệ thống, thẻ bị từ chối, v.v.)
}

// Helper function to check if a payment status value is valid
export const isValidPaymentStatus = (status: number): boolean => {
    return Object.values(PaymentStatusEnum).includes(status);
}; 