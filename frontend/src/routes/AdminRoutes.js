import {
  AdminDashboard,
  UserManagement,
  ShopManagement,
  PaymentManagement,
  Analytics,
  Profile,
} from "../pages/admin/AdminIndex";

const AdminRoutes = [
  {
    path: "/Ecommerce/admin",
    children: [
      {
        path: "admin-dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "userManagement",
        element: <UserManagement />,
      },
      {
        path: "shopManagement",
        element: <ShopManagement />,
      },
      {
        path: "paymentManagement",
        element: <PaymentManagement />,
      },
      {
        path: "analytic",
        element: <Analytics />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
];

export default AdminRoutes;
