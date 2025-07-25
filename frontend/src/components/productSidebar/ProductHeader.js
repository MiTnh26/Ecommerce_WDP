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
          <nav className={styles.navigation}>
            <a href="/Ecommerce/home" className={styles.navLink}>Back to shopping page</a>
          </nav>
        </div>

        {/* Right side - User info */}
        <div className={styles.rightSection}>
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