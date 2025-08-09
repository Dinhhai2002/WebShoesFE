import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
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
  Container,
  useTheme,
  alpha,
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
import { CartContext } from "../../context/CartContext";
import { 
  LockOutlined as LockOutlinedIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

const Login = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const cartContext = useContext(CartContext);
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
    setLoading(true);
    try {
      const dataLogin = await authenticationApiService.Login(
        values.name,
        values.password
      );
      if (dataLogin) {
        userApiService.setToken(dataLogin.data.token);
        const dataUserDetail = await userApiService.getUser();
        localStorage.setItem("user", JSON.stringify(dataUserDetail.data));
        if (dataUserDetail.data.cart_id) {
          localStorage.setItem("cartId", dataUserDetail.data.cart_id.toString());
        }
        login(dataLogin.data.token); 

        // Chuyển đổi giỏ hàng từ localStorage sang server
        // if (cartContext) {
        //   await cartContext.migrateLocalCartToServer();
        // }

        setLoading(false);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
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
    <Container component="main" maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <CssBaseline />
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        {/* Left side - Brand/Welcome */}
        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back!
            </Typography>
            <Box
              component="img"
              src="https://firebasestorage.googleapis.com/v0/b/uploadimage-aa334.appspot.com/o/logo1.jpg?alt=media"
              alt="Login"
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 'auto',
              }}
            />
            <Typography variant="h6" color="text.secondary" align="center">
              Đăng nhập để khám phá những sản phẩm tuyệt vời của chúng tôi
            </Typography>
          </Box>
        </Grid>

        {/* Right side - Login Form */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Button
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  <ArrowBackIcon color="primary" />
                </Button>
              </Link>
              <Typography variant="h4" fontWeight={600}>
                Đăng Nhập
              </Typography>
            </Box>

            {message && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '2rem'
                  }
                }}
              >
                {message}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmitHandler)}>
              <Box sx={{ mb: 3 }}>
                <InputText
                  errors={errors}
                  register={register}
                  autoFocus
                  name="name"
                  label="Tên người dùng"
                  startIcon={<PersonIcon />}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <InputPassword
                  errors={errors}
                  name="password"
                  label="Mật khẩu"
                  register={register}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }
                  }}
                />
              </Box>

              <LoadingButton
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                Đăng Nhập
              </LoadingButton>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link 
                  to={routes.ForgotPassword}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography 
                    color="primary"
                    sx={{ 
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Quên mật khẩu?
                  </Typography>
                </Link>
                <Link 
                  to={routes.Register}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography 
                    color="primary"
                    sx={{ 
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Chưa có tài khoản? Đăng ký
                  </Typography>
                </Link>
              </Box>

              {/* <Divider sx={{ my: 4 }}>
                <Typography color="text.secondary" variant="body2">
                  hoặc đăng nhập với
                </Typography>
              </Divider>

              <GoogleOAuthProvider clientId={process.env.REACT_APP_KEY_LOGIN_GOOGLE || ""}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={(response) => {
                      setLoading(true);
                      loginGoogleSuccess(response);
                    }}
                    onError={(error) => {
                      setLoading(true);
                      loginGoogleError(error);
                    }}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    width="300px"
                  />
                </Box>
              </GoogleOAuthProvider> */}
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
