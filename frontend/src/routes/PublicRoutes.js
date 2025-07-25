import MainLayout from "../layouts/MainLayout";
import {
  HomePage,
  NotFound404,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ProductDetail,
  ProductList,
} from "../pages/public/index";
import { Navigate } from "react-router-dom";

const PublicRoutes = [
  // 🔁 Redirect "/" => "/Ecommerce/home"
  {
    path: "/",
    element: <Navigate to="/Ecommerce/home" replace />,
  },

  {
    path: "/Ecommerce",
    element: <MainLayout />, // dùng Outlet bên trong layout
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "product-detail/:id",
        element: <ProductDetail />,
      },
      {
        path: "/Ecommerce/search",
        element: <ProductList />,
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
