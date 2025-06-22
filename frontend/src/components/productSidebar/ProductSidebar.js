import React, { useState } from "react";
import styles from "../../style/product/ProductSidebar.module.scss";

export default function ProductSidebar({ active, onSelect }) {
  const [isProductOpen, setIsProductOpen] = useState(false);

  return (
    <nav className={styles.sidebar}>
      <h2 className={styles.logo}>
        <img src="/logo-ecommerce.jpg" alt="" />
      </h2>

      <div className={styles.section}>
        <div
          className={styles.sectionTitle}
          onClick={() => setIsProductOpen(!isProductOpen)}
        >
          Manager Products
          <span className={styles.arrow}>{isProductOpen ? "▾" : "▸"}</span>
        </div>

        {isProductOpen && (
          <div className={styles.dropdownContent}>
            <div
              className={`${styles.sidebarButton} ${
                active === "list" ? styles.active : ""
              }`}
              onClick={() => onSelect("list")}
            >
              View list product
            </div>
            <div
              className={`${styles.sidebarButton} ${
                active === "add" ? styles.active : ""
              }`}
              onClick={() => onSelect("add")}
            >
              Add new product
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
