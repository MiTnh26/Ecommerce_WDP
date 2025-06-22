import React from "react";
import { Route, Routes } from "react-router-dom";
import ShopInformation from "../components/seller/shop-information";
import HomeSeller from "../components/seller/home";
import ViewListOrder from "../components/seller/ViewListOrder";
import ViewOrderDetail from "../components/seller/ViewOrderDetail";

const RouterSeller = () => {

  

  return (
    <Routes>
      <Route path="/" element={<HomeSeller />}>
        <Route index element={<div>seller index</div>} />
        <Route path="/shop-profile" element={<ShopInformation />} />
        <Route path="/viewlistorder" element={<ViewListOrder />} />
        <Route path="/vieworderdetail" element={<ViewOrderDetail />} />
      </Route>
    </Routes>
  );
};

export default RouterSeller;
