import React, { useEffect, useState } from "react";
import styles from "../../style/product/ProductSidebar.module.scss";
import { useNavigate } from "react-router-dom";

export default function ProductSidebar({ active, onSelect }) {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className={styles.sidebar}>
      <h2 className={styles.logo}>
        <img src="/logo-ecommerce.jpg" alt="" />
      </h2>

      {/* Manager Products Section */}
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
              onClick={() => {
                if (active !== "list") {
                  navigate("/Ecommerce/product/product-page");
                  onSelect("list");
                }
              }}
            >
              View list product
            </div>
            <div
              className={`${styles.sidebarButton} ${
                active === "add" ? styles.active : ""
              }`}
              onClick={() => {
                if (active !== "add") {
                  navigate("/Ecommerce/product/product-page");
                  onSelect("add");
                }
              }}
            >
              Add new product
            </div>
          </div>
        )}
      </div>

      {/* Manager Orders Section */}
      <div className={styles.section}>
        <div
          className={styles.sectionTitle}
          onClick={() => setIsOrderOpen(!isOrderOpen)}
        >
          Manager Orders
          <span className={styles.arrow}>{isOrderOpen ? "▾" : "▸"}</span>
        </div>

        {isOrderOpen && (
          <div className={styles.dropdownContent}>
            <div
              className={styles.sidebarButton}
              onClick={() => navigate("/Ecommerce/seller/viewlistorder")}
            >
              View Orders
            </div>
          </div>
        )}
      </div>

      {/* Manager Shop Section */}
      <div className={styles.section}>
        <div
          className={styles.sectionTitle}
          onClick={() => setIsShopOpen(!isShopOpen)}
        >
          Manager Shop
          <span className={styles.arrow}>{isShopOpen ? "▾" : "▸"}</span>
        </div>

        {isShopOpen && (
          <div className={styles.dropdownContent}>
            <div
              className={styles.sidebarButton}
              onClick={() => navigate("/Ecommerce/seller/shopinformation")}
            >
              View Shop
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
