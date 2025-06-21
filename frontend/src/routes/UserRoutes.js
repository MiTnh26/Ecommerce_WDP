import ProfilePage from "../pages/ProfilePage";
import Cart from "../pages/Customer/Cart";
const UserRoutes = [
  {
    path: "/Ecommerce/user",
    children: [
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "cart",
        element: <Cart />,
      }
    ],
  },
];

export default UserRoutes;
