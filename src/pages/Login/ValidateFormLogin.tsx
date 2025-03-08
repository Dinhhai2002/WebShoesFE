import { object, string, TypeOf } from "zod";

export const validateSchema = object({
  name: string().trim()
    .nonempty("Tên người dùng không được trống")
    .max(32, "Tên người dùng tối đa là 32 kí tự"),
  password: string().trim()
    .nonempty("Mật khẩu là bắt buộc")
    // .min(6, "Mật khẩu tối thiểu là 8 kí tự")
    // .max(20, "Mật khẩu tối đa là 20 kí tự"),
});

export type ValidateInput = TypeOf<typeof validateSchema>;
