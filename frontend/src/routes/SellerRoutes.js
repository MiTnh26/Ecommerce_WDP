import { SellerRegistrationWizard } from "../pages/sellerRegister/SellerIndex";
const SellerRoutes = [
  {
    path: "/Ecommerce/seller",
    children: [
      {
        path: "seller-register",
        element: <SellerRegistrationWizard />,
      },
    ],
  },

];

export default SellerRoutes;
