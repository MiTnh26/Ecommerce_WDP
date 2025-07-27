import React from "react";
import SellerLayout from "../../pages/product/SellerLayout";
import Category from "./Category";

export default function CategoryIndex() {
  return (
    <SellerLayout activeTab="category">
      <Category />
    </SellerLayout>
  );
}