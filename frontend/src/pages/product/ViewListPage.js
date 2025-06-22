import React, { useEffect, useState } from "react";
import styles from "../../style/product/ViewListPage.module.scss";

export default function ViewListPage({ onAddProduct }) {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  // Mock data fallback
  const mockData = [
    {
      _id: "6835ef44b151877fb3fa4a18",
      CategoryId: { CategoryName: "Mock Category" },
      CreatedAt: "2000-01-01T00:00:00.000Z",
      Description: "test",
      ProductName: "product1",
      ShopId: "6835ef92b151877fb3fa4a19",
      ProductVariant: [
        {
          _id: "6835efb1b151877fb3fa4a1b",
          Image: "image.png",
          Price: 100.2,
          ProductVariantName: "variant1",
          StockQuantity: 100,
          Status: "Active",
        },
        {
          _id: "6835efb1b151877fb3fa4a1c",
          Image: "image.png",
          Price: 100.2,
          ProductVariantName: "variant1",
          StockQuantity: 100,
          Status: "Inactive",
        },
      ],
      Status: "Active",
      ProductImage: "https://via.placeholder.com/50",
    },
  ];

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("http://localhost:5000/product");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(data || []);
      } catch (error) {
        console.error("Fetch error:", error.message);
        setProducts(mockData); // Fallback to mock data
      }
    }

    loadProducts();
  }, []);

  const filtered = products.filter((p) => {
    try {
      if (filter !== "All" && p.Status !== filter) return false;
      if (query && !p.ProductName?.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    } catch (e) {
      console.warn("Filtering error:", e.message);
      return false;
    }
  });

  return (
    <>
      <h1 className={styles.title}>View list product</h1>

      <div className={styles.headerActions}>
        {/* Row 1: Filter + Add Button */}
        <div className={styles.row}>
          <div className={styles.filterGroup}>
            {["All", "Active", "Inactive"].map((f) => (
              <button
                key={f}
                className={filter === f ? styles.btnActive : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            className={styles.addBtn}
            onClick={onAddProduct}
          >
            Add new product
          </button>
        </div>

        {/* Row 2: Search + Sort */}
        <div className={styles.row}>
          <div className={styles.search}>
            <input
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button>Search</button>
          </div>

          <div className={styles.sortBtns}>
            <button className={styles.sortNew}>⬆ Date add new – old</button>
            <button>⬇ Date add old–new</button>
          </div>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>No</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Change Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>
                {p.ProductImage ? (
                  <img src={p.ProductImage} className={styles.thumb} alt="" />
                ) : (
                  "—"
                )}
              </td>
              <td>{p.ProductName || "—"}</td>
              <td>{p.CategoryId?.CategoryName || "—"}</td>
              <td>
                <button className={styles.changeStatusBtn}>
                  {p.Status || "—"}
                </button>
              </td>
              <td>
                <div className={styles.actionButtons}>
                  <button className={styles.editBtn} title="Edit">
                    ✎
                  </button>
                  <button className={styles.deleteBtn} title="Delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
