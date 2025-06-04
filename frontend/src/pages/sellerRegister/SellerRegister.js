// SellerRegister.js

import React, { useState } from "react";
import ReactQuill from "react-quill";
import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./SellerRegister.module.scss";
import "react-quill/dist/quill.snow.css";

export default function SellerRegistrationWizard() {
  const step = 2;

  const [formData, setFormData] = useState({
    shopName: "",
    shopLogo: null,

    shopDescription: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, shopDescription: value }));
  };


// // fetch shop info (later use)
//   useEffect(() => {
//   const fetchShops = async () => {
//     try {
//       const res = await fetch(
//         `http://localhost:5000/seller/getShopInformation?userId=${userId}`
//       );
//       if (!res.ok) throw new Error("Failed to fetch shops");
//       const shops = await res.json();
//       console.log("My shops:", shops);
//     } catch (err) {
//       console.error(err);
//     }
//   };
//   fetchShops();
// }, [userId]);

  const handleSave = async () => {
    try {
      // 1) Create a FormData object
      const data = new FormData();
      data.append("shopName", formData.shopName);
      data.append("shopDescription", formData.shopDescription || "");
      data.append("taxnumber", formData.taxnumber || "0");
      data.append("owner", localStorage.getItem("user")._id);
      // replace with the actual logged‐in user’s _id
      if (formData.shopLogo) {
        data.append("shopLogo", formData.shopLogo);
      }

      // 2) POST to /seller/registerShop
      const response = await fetch(
        "http://localhost:5000/seller/registerShop",
        {
          method: "POST",
          body: data,
          // NOTE: Do not add a Content-Type header!
          // The browser will set multipart/form-data boundary automatically.
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register shop.");
      }

      const newShop = await response.json();
      console.log("Shop registered:", newShop);
      alert("Shop registered successfully!");
      // Optionally, redirect or clear the form…
    } catch (err) {
      console.error("Error registering shop:", err);
      alert("Error: " + err.message);
    }
  };

  const handleSaveForLater = () => {
    console.log("Progress saved:", formData);
    alert("Progress saved for later!");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Seller Registration – Shop Setup</h2>

      <form>
        {step === 2 && (
          <div className={styles.fieldset}>
            <div>
              <label className={styles.label} htmlFor="shopName">
                Shop Name
              </label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                required
                className={styles.input}
                value={formData.shopName}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="shopLogo">
                  Shop Logo
                </label>
                <input
                  id="shopLogo"
                  name="shopLogo"
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className={styles.label}>Shop Description</label>
              <ReactQuill
                theme="snow"
                value={formData.shopDescription}
                onChange={handleDescriptionChange}
              />
            </div>

            <div>
              <label className={styles.label}>Preview</label>
              <div className={styles.previewBox}>
                <div className={styles.previewHeader}>
                  {formData.shopLogo && (
                    <img
                      src={URL.createObjectURL(formData.shopLogo)}
                      alt="Logo"
                      className={styles.previewLogo}
                    />
                  )}
                  <h3>{formData.shopName || "Your Shop Name"}</h3>
                </div>
                <div
                  className={styles.previewDesc}
                  dangerouslySetInnerHTML={{ __html: formData.shopDescription }}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.navRow}>
          <button
            type="button"
            onClick={handleSave}
            className={styles.saveBtn}
            style={{ height: "2.5rem" }}
          >
            <span>Save</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
