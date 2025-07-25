import React from "react";
import styles from "../../style/product/ProductHeader.module.scss";

const ProfileHeader = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Mock shop data - replace with your actual data fetching
  const shopInfo = {
    shopAvatar: "/placeholder.svg?height=40&width=40",
    shopName: "My Shop"
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left side - Shop info and navigation */}
        <div className={styles.leftSection}>
          <div className={styles.shopInfo}>
            <img
              src={shopInfo?.shopAvatar || "/placeholder.svg?height=40&width=40"}
              alt="Shop Avatar"
              className={styles.shopAvatar}
            />
          </div>

          <nav className={styles.navigation}>
            <a href="/Ecommerce/home" className={styles.navLink}>Home</a>
            <a href="#" className={styles.navLink}>Order</a>
            
            <div className={styles.dropdown}>
              <button className={styles.dropdownToggle}>
                Product <span className={styles.dropdownArrow}>▼</span>
              </button>
              <div className={styles.dropdownMenu}>
                <a href="#" className={styles.dropdownItem}>View Products</a>
                <a href="#" className={styles.dropdownItem}>Add Product</a>
              </div>
            </div>
            
            <a href="#" className={styles.navLink}>Shop</a>
          </nav>
        </div>

        {/* Right side - User info */}
        <div className={styles.rightSection}>
          <a href="#" className={styles.backLink}>Back to shopping page</a>
          <img
            src={user?.Image || "/placeholder.svg?height=35&width=35"}
            alt="User Avatar"
            className={styles.userAvatar}
          />
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;