import React from "react";
import styles from "../../style/product/ProductSidebar.module.scss";

export default function ProductSidebar({ active, onSelect }) {
  return (
    <nav className={styles.sidebar}>
      <h2 className={styles.logo}><img src="/logo-ecommerce.jpg" alt=""></img></h2>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Manager Products</div>
        <button
          className={active === "list" ? styles.active : ""}
          onClick={() => onSelect("list")}
        >
          View list product
        </button>
        <button
          className={active === "add" ? styles.active : ""}
          onClick={() => onSelect("add")}
        >
          Add new product
        </button>
      </div>

      {/* You can add more sections (Orders, Shop, etc.) below */}
    </nav>
  );
}