import SellerLayout from "./SellerLayout";
import Category from "../../components/seller/Category";

export default function CategoryPage() {
  return (
    <SellerLayout activeTab="category">
      <Category />
    </SellerLayout>
  );
} 