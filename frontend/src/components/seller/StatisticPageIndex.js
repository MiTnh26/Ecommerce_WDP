import React from "react";
import SellerLayout from "../../pages/product/SellerLayout";
import StatisticPage from "./StatisticPage";

export default function ViewStatistic() {
    const shopId = JSON.parse(localStorage.getItem("shopInfo"))?._id;
  return (
    
    <SellerLayout activeTab="orders">
      <StatisticPage shopId="6835ee2eb151877fb3fa4a0a" />
    </SellerLayout>
  );
}