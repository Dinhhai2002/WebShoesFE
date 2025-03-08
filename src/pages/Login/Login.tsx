import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Avatar,
  Box,
  CssBaseline,
  Grid,
  Paper,
  Typography,
  Alert,
  Divider,
  Button,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gapi } from "gapi-script";
import { ValidateInput, validateSchema } from "./ValidateFormLogin";
import { styled } from "@mui/material/styles";
import InputText from "../../components/InputText";
import InputPassword from "../../components/InputPassword";
import { routes } from "../../routes/routes";
import authenticationApiService from "../../services/API/AuthenticationApiService";
import userApiService from "../../services/API/UserApiService";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loginGoogleError, loginGoogleSuccess } from "../../utils/LoginGoogle";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ValidateInput>({
    resolver: zodResolver(validateSchema),
  });

  const onSubmitHandler: SubmitHandler<ValidateInput> = async (values) => {
    console.log(123);
    
    setLoading(true);
    const dataLogin = await authenticationApiService.Login(
      values.name,
      values.password
    );
    if (dataLogin) {
      login(dataLogin.data.token); 
      userApiService.setToken(dataLogin.data.token);
      const dataUserDetail = await userApiService.getUser();
      localStorage.setItem("user", JSON.stringify(dataUserDetail.data));

      setLoading(false);
      window.location.href = "/";
    }
    setLoading(false);
  };

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: process.env.REACT_APP_KEY_LOGIN_GOOGLE,
        scope: "email",
      });
    }
    gapi.load("client:auth2", start);
  }, []);

  return (
    <StyledGrid container>
      <CssBaseline />
      {/* <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      /> */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <StyledPaper>
          <Link to={"/"}>
            <StyledAvatar>
              <LockOutlinedIcon />
            </StyledAvatar>
          </Link>
          {message && <Alert severity="info">{message}</Alert>}
          <Typography component="h3" variant="h5">
            Đăng Nhập
          </Typography>
          <StyledForm onSubmit={handleSubmit(onSubmitHandler)}>
            <InputText
              errors={errors}
              register={register}
              autoFocus
              name="name"
              label="Tên người dùng"
            />
            <InputPassword
              errors={errors}
              name="password"
              label="Mật khẩu"
              register={register}
            />
            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={{ mt: 4, mb: 4, padding: 1 }}
            >
              {" "}
              Đăng Nhập
            </Button>
            <Grid container>
              <Grid item xs>
                <StyledLink to={routes.ForgotPassword}>
                  Quên mật khẩu?
                </StyledLink>
              </Grid>
              <Grid item>
                <StyledLink to={routes.Register}>
                  Chưa có tài khoản? Đăng ký
                </StyledLink>
              </Grid>
            </Grid>
            <Divider sx={{ my: 4 }}>hoặc</Divider>
            <GoogleOAuthProvider
              clientId={process.env.REACT_APP_KEY_LOGIN_GOOGLE || ""}
            >
              <GoogleLogin
                onSuccess={(response) => {
                  setLoading(true);
                  loginGoogleSuccess(response);
                }}
                onError={(error) => {
                  setLoading(true);
                  loginGoogleError(error);
                }}
              />
            </GoogleOAuthProvider>
          </StyledForm>
        </StyledPaper>
      </Grid>
    </StyledGrid>
  );
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: 800,
  width: "100%",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(1),
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
}));

// const GoogleButton = styled(GoogleLogin)(({ theme }) => ({
//   width: "100%",
//   justifyContent: "center",
//   marginTop: theme.spacing(2),
// }));

export default Login;
