import ProfilePage from "../pages/ProfilePage";
import Cart from "../pages/customer/Cart";
import CheckoutPage from "../pages/user/checkout";
import UserLayout from "../layouts/UserLayout"; // layout vừa tạo
const UserRoutes = [

  {
    path: "/Ecommerce/user",
    element: <UserLayout />,
    children: [
      {
        path: "profile",
        element: <ProfilePage />,
      },
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
];

export default UserRoutes;
