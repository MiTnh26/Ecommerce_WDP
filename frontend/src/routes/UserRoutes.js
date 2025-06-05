import  ProfilePage  from "../pages/ProfilePage";
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

];

export default UserRoutes;