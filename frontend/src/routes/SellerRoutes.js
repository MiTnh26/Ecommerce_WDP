import { SellerRegistrationWizard } from "../pages/sellerRegister/SellerIndex";
import HomeSeller from "../components/seller/home";
import ViewListOrder from "../components/seller/ViewListOrder";
import ViewOrderDetail from "../components/seller/ViewOrderDetail";
import ViewOrderIndex from "../components/seller/ListOrderIndex";
import ShopInformationIndex from "../components/seller/ShopInformationIndex";
import OrderDetailIndex from "../components/seller/OrderDetailIndex";
import CategoryList from "../components/seller/Category";

const SellerRoutes = [
  {
    path: "/Ecommerce/seller/seller-register",
    element: <SellerRegistrationWizard />,
  },
  {
    path: "/Ecommerce/seller",
    element: <HomeSeller />,
    children: [
      {
        path: "viewlistorder",
        element: <ViewOrderIndex />,
      },
     {
        path: "vieworderdetail/:orderId",
        element: <ViewOrderDetail />,
      },
      {
        path: "category",
        element: <CategoryList />,
      },
      {
        path: "shopinformation",
        element: <ShopInformationIndex />,
      },
    ],
  },
];

export default SellerRoutes;
