import React from "react";
import SellerLayout from "../../pages/product/SellerLayout";
import ViewListOrder from "./ViewListOrder";

export default function ViewOrderIndex() {
  return (
    <SellerLayout activeTab="orders">
      <ViewListOrder />
    </SellerLayout>
  );
}