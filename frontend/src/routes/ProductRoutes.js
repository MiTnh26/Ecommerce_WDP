import { ProductPage } from "../pages/product/ProductIndex";
const ProductRoutes = [
  {
    path: "/Ecommerce/product",
    children: [
      {
        path: "product-page",
        element: <ProductPage />,
      },
    ],
  },

];

export default ProductRoutes;
