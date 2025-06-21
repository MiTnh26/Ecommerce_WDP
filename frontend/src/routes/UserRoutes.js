import ProfilePage from "../pages/ProfilePage";
import OrderDetail from "../components/OrderDetail";
const UserRoutes = [

  {
    path: "/Ecommerce/user",
    children: [
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: "/orderdetail/:orderId",
    element: <OrderDetail  />,
  },
];

export default UserRoutes;
