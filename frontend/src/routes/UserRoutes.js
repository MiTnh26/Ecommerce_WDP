import ProfilePage from "../pages/ProfilePage";
import Cart from "../pages/customer/Cart";
import CheckoutPage from "../pages/user/checkout";
import UserLayout from "../layouts/UserLayout";
import OrderDetail from "../components/OrderDetail"; // layout vừa tạo
import PurchaseOrders from "../components/PurchaseOrders";

const UserRoutes = [
  {
    path: "/Ecommerce/user",
    element: <UserLayout />,
    children: [
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
    ],
  },
  {
    path: "/Ecommerce/user/cart",
    element: <Cart />,
  },
  {
    path: "/Ecommerce/user/profile",
    element: <ProfilePage />,
  },

  {
    path: "/Ecommerce/user/profile",
    element: <ProfilePage />,
  },
  // {
  //   path: "/orderdetail/:orderId",
  //   element: <OrderDetail />,
  // },
  {
    path: "/Ecommerce/user/profile/puchaseorder",
    element: <PurchaseOrders />,
  },
];

export default UserRoutes;
