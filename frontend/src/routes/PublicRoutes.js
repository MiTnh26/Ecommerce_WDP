import MainLayout from "../layouts/MainLayout";
import {
  HomePage,
  NotFound404,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
} from "../pages/Public/index";
const PublicRoutes = [
  {
    path: "/Ecommerce",
    element: <MainLayout />, // dùng Outlet bên trong layout
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/Ecommerce/login",
    element: <LoginPage />,
  },
  {
    path: "/Ecommerce/register",
    element: <RegisterPage />,
  },
  {
    path: "/Ecommerce/forgot-password",
    element: <ForgotPasswordPage />,
  },
  { path: "*", element: <NotFound404 /> },

  
];

export default PublicRoutes;
