// SellerRegister.js

import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { ArrowRight } from "lucide-react";
import styles from "./SellerRegister.module.scss";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

function SellerRegistrationWizard() {
  const navigate = useNavigate();

  // We’re on step 2 (Shop Setup) in your wizard
  const step = 2;

  // 1) All possible fields in the updated Shop schema:
  const [formData, setFormData] = useState({
    shopName: "",
    shopAvatar: null, // file input
    shopDescription: "",
    province: "",
    district: "",
    ward: "",
    // status is not set manually; defaults to "Pending"
  });

  // 2) Logged-in owner's ObjectId (read from localStorage)
  const [ownerId, setOwnerId] = useState("");
  useEffect(() => {
    const raw = window.localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user && user._id) {
          setOwnerId(user._id);
        }
      } catch {
        console.warn("Could not parse stored user");
      }
    }
  }, []);

  // 3) handleChange for text + file inputs
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 4) handleDescriptionChange for ReactQuill
  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, shopDescription: value }));
  };

  // 5) handleSave → build FormData and POST to /seller/registerShop
  const handleSave = async () => {
    try {
      if (!ownerId) {
        alert("Error: You must be logged in to register a shop.");
        return;
      }

      // Build FormData
      const data = new FormData();
      data.append("shopName", formData.shopName);
      data.append("shopDescription", formData.shopDescription);
      data.append("owner", ownerId);
      data.append("province", formData.province);
      data.append("district", formData.district);
      data.append("ward", formData.ward);
      // Append the file under the field name "shopAvatar" to match Multer config
      if (formData.shopAvatar) {
        data.append("shopAvatar", formData.shopAvatar);
      }

      // POST to back end
      const response = await fetch(
        "http://localhost:5000/seller/registerShop",
        {
          method: "POST",
          body: data,
          // Do NOT set Content-Type; browser will set multipart/form-data boundary
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register shop.");
      }

      const newShop = await response.json();
      console.log("Shop registered:", newShop);
      alert("Shop registered successfully!");
      // Optionally, clear form or navigate:
      setFormData({
        shopName: "",
        shopAvatar: null,
        shopDescription: "",
        province: "",
        district: "",
        ward: "",
      });

      navigate("/Ecommerce/product/product-page");
    } catch (err) {
      console.error("Error registering shop:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Seller Registration – Shop Setup</h2>

      <form>
        {step === 2 && (
          <div className={styles.fieldset}>
            {/* Shop Name */}
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

            {/* Shop Avatar (file upload) */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="shopAvatar">
                  Shop Avatar
                </label>
                <input
                  id="shopAvatar"
                  name="shopAvatar"
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Shop Description (Rich‐text) */}
            <div style={{ marginTop: "1rem" }}>
              <label className={styles.label}>Shop Description</label>
              <ReactQuill
                theme="snow"
                value={formData.shopDescription}
                onChange={handleDescriptionChange}
              />
            </div>

            <div className={styles.addressSection}>
              <div className={styles.addressLabel}>Address</div>
              <div className={styles.addressInputs}>
                <div className={styles.addressField}>
                  <label className={styles.label} htmlFor="province">
                    Province
                  </label>
                  <input
                    id="province"
                    name="province"
                    type="text"
                    className={styles.input}
                    value={formData.province}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.addressField}>
                  <label className={styles.label} htmlFor="district">
                    District
                  </label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    className={styles.input}
                    value={formData.district}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.addressField}>
                  <label className={styles.label} htmlFor="ward">
                    Ward
                  </label>
                  <input
                    id="ward"
                    name="ward"
                    type="text"
                    className={styles.input}
                    value={formData.ward}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div style={{ marginTop: "1rem" }}>
              <label className={styles.label}>Preview</label>
              <div className={styles.previewBox}>
                <div className={styles.previewHeader}>
                  {formData.shopAvatar && (
                    <img
                      src={URL.createObjectURL(formData.shopAvatar)}
                      alt="Avatar Preview"
                      className={styles.previewLogo}
                    />
                  )}
                  <h3>{formData.shopName || "Your Shop Name"}</h3>
                </div>
                <div
                  className={styles.previewDesc}
                  dangerouslySetInnerHTML={{
                    __html: formData.shopDescription,
                  }}
                />
                <div className={styles.previewAddress}>
                  {formData.province || formData.district || formData.ward ? (
                    <p>
                      {formData.province}, {formData.district}, {formData.ward}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation / Save Button */}
        <div className={styles.navRow} style={{ marginTop: "1.5rem" }}>
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

export default SellerRegistrationWizard;
