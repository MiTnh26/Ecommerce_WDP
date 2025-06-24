import  ProductIndex  from "../pages/product/ProductIndex";
const ProductRoutes = [
  {
    path: "/Ecommerce/product",
    children: [
      {
        path: "product-page",
        element: <ProductIndex />,
      },
    ],
  },

];

export default ProductRoutes;
