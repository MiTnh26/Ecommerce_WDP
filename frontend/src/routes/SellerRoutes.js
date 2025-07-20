import { SellerRegistrationWizard } from "../pages/sellerRegister/SellerIndex";
import ShopInformation from "../components/seller/shop-information";
import HomeSeller from "../components/seller/home";
import ViewListOrder from "../components/seller/ViewListOrder";
import ViewOrderDetail from "../components/seller/ViewOrderDetail";
import GetShopInfo from "../components/seller/GetShopInfo";

const SellerRoutes = [
  {
    path: "/Ecommerce/seller/seller-register",
    element: <SellerRegistrationWizard />,
  },
  {
    path: "/Ecommerce/seller/debug",
    element: <GetShopInfo />,
  },
  {
    path: "/Ecommerce/seller",
    element: <HomeSeller />,
    children: [
      {
        path: "shop-profile",
        element: <ShopInformation />,
      },
      {
        path: "viewlistorder",
        element: <ViewListOrder />,
      },
      {
        path: "vieworderdetail/:orderId",
        element: <ViewOrderDetail />,
      },
      {
        path: "debug",
        element: <GetShopInfo />,
      },
    ],
  },
];

export default SellerRoutes;
