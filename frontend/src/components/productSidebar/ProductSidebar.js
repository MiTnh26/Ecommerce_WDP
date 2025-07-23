import React, { useEffect, useState } from "react";
import styles from "../../style/product/ProductSidebar.module.scss";
import { useNavigate } from "react-router-dom";

export default function ProductSidebar({ active, onSelect }) {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isStatisticOpen, setIsStatisticOpen] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
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
              className={`${styles.sidebarButton} ${active === "list" ? styles.active : ""
                }`}
              onClick={() => {
                navigate("/Ecommerce/product/product-page", {
                  state: { tab: "list" },
                });
              }}
            >
              View list product
            </div>
            <div
              className={`${styles.sidebarButton} ${active === "add" ? styles.active : ""
                }`}
              onClick={() => {
                navigate("/Ecommerce/product/product-page", {
                  state: { tab: "add" },
                });
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

      {/* Statistic Section */}
      <div className={styles.section}>
        <div
          className={styles.sectionTitle}
          onClick={() => setIsStatisticOpen(!isStatisticOpen)}
        >
          Statistic
          <span className={styles.arrow}>{isStatisticOpen ? "▾" : "▸"}</span>
        </div>

        {isStatisticOpen && (
          <div className={styles.dropdownContent}>
            <div
              className={styles.sidebarButton}
              onClick={() => navigate("/Ecommerce/seller/statistic")}
            >
              View Statistic
            </div>
          </div>
        )}
      </div>
      {/* Manager Category Section */}
      <div className={styles.section}>
        <div
          className={styles.sectionTitle}
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
        >
          Manager Category
          <span className={styles.arrow}>{isCategoryOpen ? "▾" : "▸"}</span>
        </div>

        {isCategoryOpen && (
          <div className={styles.dropdownContent}>
            <div
              className={styles.sidebarButton}
              onClick={() => navigate("/Ecommerce/seller/category")}
            >
              Manage Category
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
