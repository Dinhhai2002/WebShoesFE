import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

// Danh sách mã giảm giá khả dụng
const availableVouchers = [
  { code: "DISCOUNT10", discount: 100000, description: "Giảm 100.000đ cho đơn từ 500.000đ" },
  { code: "FREESHIP", discount: 50000, description: "Giảm 50.000đ phí vận chuyển" },
  { code: "SALE20", discount: 200000, description: "Giảm 200.000đ cho đơn từ 1.000.000đ" },
];

const VoucherBlock = ({ onApply }: { onApply: (code: string, discount: number) => void }) => {
  const [voucher, setVoucher] = useState("");
  const [discount, setDiscount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  const handleApplyVoucher = () => {
    const foundVoucher = availableVouchers.find((v) => v.code === voucher);
    if (foundVoucher) {
      setDiscount(foundVoucher.discount);
      onApply(foundVoucher.code, foundVoucher.discount);
      alert(`Mã ${foundVoucher.code} đã được áp dụng!`);
    } else {
      setDiscount(0);
      alert("Mã giảm giá không hợp lệ!");
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">🎟 Mã giảm giá</Typography>

      {/* Input nhập mã giảm giá */}
      <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
        <LocalOfferIcon color="primary" />
        <TextField
          label="Nhập mã giảm giá"
          variant="outlined"
          size="small"
          value={voucher}
          onChange={(e) => setVoucher(e.target.value)}
        />
        <Button variant="contained" color="secondary" onClick={handleApplyVoucher}>
          Áp dụng
        </Button>
		<Button variant="outlined" color="secondary" onClick={() => setOpenDialog(true)}>
		Xem mã giảm giá
        </Button>
      </Box>

      {/* Dialog hiển thị danh sách voucher */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Mã giảm giá khả dụng</DialogTitle>
        <DialogContent>
          <List>
            {availableVouchers.map((v) => (
              <ListItem key={v.code} onClick={() => {
                setVoucher(v.code);
                setDiscount(v.discount);
                onApply(v.code, v.discount);
                setOpenDialog(false);
              }}>
                <ListItemText primary={v.code} secondary={v.description} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoucherBlock;
