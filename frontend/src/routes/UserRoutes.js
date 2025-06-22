import ProfilePage from "../pages/ProfilePage";
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
];

export default UserRoutes;
