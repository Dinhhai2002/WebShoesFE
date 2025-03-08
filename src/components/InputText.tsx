import { TextField } from "@mui/material";

function InputText({
  errors,
  register,
  name,
  label,
  autoFocus = false,
  type = "text",
}: any) {
  return (
    <TextField
      type={type}
      margin="normal"
      required
      fullWidth
      id={name}
      label={label}
      autoFocus={autoFocus}
      error={!!errors[name]}
      helperText={errors[name] ? errors[name].message : ""}
      {...register(name)}
    />
  );
}

export default InputText;
