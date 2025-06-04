import { AdminDashboard } from "../pages/admin/AdminIndex";
const AdminRoutes = [
  {
    path: "/Ecommerce/admin",
    children: [
      {
        path: "admin-dashboard",
        element: <AdminDashboard />,
      },
    ],
  },

];

export default AdminRoutes;
