import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { useState } from "react";

function InputPassword({
  errors,
  name,
  label,
  register,
}: any) {
  const [showPassword, setShowPassword] = useState(false);
   // ẩn hiện password
   const handleClickShowPassword = () => setShowPassword((show) => !show);

   const handleMouseDownPassword = (
     event: React.MouseEvent<HTMLButtonElement>
   ) => {
     event.preventDefault();
   };
  return (
    <FormControl
      sx={{ marginTop: 2, marginBottom: 2 }}
      fullWidth
      variant="outlined"
    >
      <InputLabel required htmlFor="outlined-adornment-password">
        {label}
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        error={!!errors[name]}
        {...register(name)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
      {
        <FormHelperText error={!!errors[name]} id="name-accountId-error">
          {errors[name] ? errors[name].message : ""}
        </FormHelperText>
      }
    </FormControl>
  );
}

export default InputPassword;
