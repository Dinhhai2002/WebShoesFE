
export const routes = {
  Home: "/",
  Login: "/authentication/login",
  Register: "/authentication/register",
  ForgotPassword: "/authentication/forgot-password",
  OTP: "/authentication/otp",
  ResetPassword: "/authentication/reset-password",
  Cart: "/cart",
  OrderHistory: "/order-history",
  Checkout: "/checkout",
  ProductDetail: "/product-detail/:id",
  ProductList: "/products",
};

// export const publicRoutes = [
//   { path: routes.Home, component: Home },
//   { path: routes.Login, component: Login }
//   // { path: routes.Register, component: Register },
//   // { path: routes.ForgotPassword, component: ForgotPassword },
//   // { path: routes.OTP, component: OTP },
//   // { path: routes.ResetPassword, component: ResetPassword },
//   // { path: routes.Profile, component: Profile },
// ];