import MainLayout from "../layouts/MainLayout";
import {
  HomePage,
  NotFound404,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ProductDetail, ProductList
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
      {
        path: "product-detail/:id",
        element: <ProductDetail />,
      },
      {
        path: "/Ecommerce/search",
        element: <ProductList />,
      }
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
