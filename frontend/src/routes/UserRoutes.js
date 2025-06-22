import ProfilePage from "../pages/ProfilePage";
import CheckoutPage from "../pages/user/checkout";
const UserRoutes = [
  {
    path: "/Ecommerce/user",
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
