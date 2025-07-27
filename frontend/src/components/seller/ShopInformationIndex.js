import React from "react";
import SellerLayout from "../../pages/product/SellerLayout";
import ShopInformation from "./shop-information"; 

export default function ShopInformationIndex() {
  return (
    <SellerLayout activeTab="orders">
      <ShopInformation />
    </SellerLayout>
  );
}