import React from "react";
import SellerLayout from "../../pages/product/SellerLayout";
import ViewOrderDetail from "./ViewOrderDetail"; 

export default function OrderDetailIndex() {
  return (
    <SellerLayout activeTab="orders">
      <ViewOrderDetail />
    </SellerLayout>
  );
}