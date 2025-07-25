// SellerRegister.js

import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { ArrowRight } from "lucide-react";
import styles from "./SellerRegister.module.scss";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

function SellerRegistrationWizard() {
  const navigate = useNavigate();
  const step = 2;

  // form state
  const [formData, setFormData] = useState({
    shopName: "",
    shopAvatar: null,
    shopDescription: "",
    province: "",
    district: "",
    ward: "",
  });

  const [nameTouched, setNameTouched] = useState(false);
  const [descTouched, setDescTouched] = useState(false);

  // validation errors
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // address dropdown data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // pull ownerId from localStorage
  const [ownerId, setOwnerId] = useState("");

  const plainDesc = formData.shopDescription.replace(/<[^>]+>/g, "").trim();
  const truncatedDesc =
    plainDesc.length > 30 ? plainDesc.slice(0, 30) + "…" : plainDesc;

  useEffect(() => {
    const raw = window.localStorage.getItem("user");
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user._id) setOwnerId(user._id);
      } catch {}
    }
  }, []);

  // fetch provinces once
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .catch(console.error);
  }, []);

  // validate shopName
  useEffect(() => {
    const trimmed = formData.shopName.trim();
    if (trimmed.length === 0 && submitAttempted) {
      setNameError("Shop name is required.");
    } else if (trimmed.length > 0 && trimmed.length < 10) {
      setNameError("Shop name must be at least 10 characters.");
    } else {
      setNameError("");
    }
  }, [formData.shopName, submitAttempted]);

  // validate shopDescription
  useEffect(() => {
    const text = formData.shopDescription.replace(/<[^>]+>/g, "").trim();
    if (text.length === 0 && submitAttempted) {
      setDescError("Description is required.");
    } else if (text.length > 0 && text.length < 50) {
      setDescError("Description must be at least 50 characters.");
    } else {
      setDescError("");
    }
  }, [formData.shopDescription, submitAttempted]);

  // avatar required
  useEffect(() => {
    if (submitAttempted) {
      if (!formData.shopAvatar) {
        setAvatarError("Shop avatar is required.");
      } else {
        setAvatarError("");
      }
    }
  }, [formData.shopAvatar, submitAttempted]);

  // address required
  useEffect(() => {
    if (submitAttempted) {
      if (!formData.province || !formData.district || !formData.ward) {
        setAddressError("Please select province, district & ward.");
      } else {
        setAddressError("");
      }
    }
  }, [formData.province, formData.district, formData.ward, submitAttempted]);

  // handle generic input changes
  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, shopDescription: value }));
  };

  // when user selects a province
  const handleProvinceChange = async (e) => {
    const name = e.target.value;
    const selected = provinces.find((p) => p.name === name);
    setFormData((prev) => ({
      ...prev,
      province: selected?.name || "",
      district: "",
      ward: "",
    }));

    if (!selected) {
      setDistricts([]);
      setWards([]);
      return;
    }

    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${selected.code}?depth=2`
      );
      const data = await res.json();
      setDistricts(data.districts || []);
      setWards([]);
    } catch (err) {
      console.error(err);
      setDistricts([]);
      setWards([]);
    }
  };

  // when user selects a district
  const handleDistrictChange = async (e) => {
    const name = e.target.value;
    const selected = districts.find((d) => d.name === name);
    setFormData((prev) => ({
      ...prev,
      district: selected?.name || "",
      ward: "",
    }));

    if (!selected) {
      setWards([]);
      return;
    }

    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${selected.code}?depth=2`
      );
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error(err);
      setWards([]);
    }
  };

  const handleSave = async () => {
    if (!ownerId) {
      alert("You must be logged in to register a shop.");
      return;
    }

    setSubmitAttempted(true);

    if (
      !formData.shopName.trim() ||
      !formData.shopDescription.replace(/<[^>]+>/g, "").trim() ||
      nameError ||
      descError
    ) {
      return;
    }

    try {
      const data = new FormData();
      data.append("shopName", formData.shopName);
      data.append("shopDescription", formData.shopDescription);
      data.append("owner", ownerId);
      data.append("province", formData.province);
      data.append("district", formData.district);
      data.append("ward", formData.ward);
      if (formData.shopAvatar) data.append("shopAvatar", formData.shopAvatar);

      const response = await fetch(
        "http://localhost:5000/seller/registerShop",
        { method: "POST", body: data }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to register shop.");
      }

      const newShop = await response.json();

      alert("Shop registered successfully!");
      // Lưu shopId vào localStorage
      localStorage.setItem("shopId", newShop._id);
      // Optionally, clear form or navigate:
      setFormData({
        shopName: "",
        shopAvatar: null,
        shopDescription: "",
        province: "",
        district: "",
        ward: "",
      });

      // navigate("/Ecommerce/product/product-page");
      navigate("/Ecommerce/home");
    } catch (err) {
      console.error(err);
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
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="shopName">
                Shop Name
              </label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                className={styles.input}
                value={formData.shopName}
                onChange={(e) => {
                  handleChange(e);
                  if (!nameTouched) setNameTouched(true);
                }}
                onBlur={() => setNameTouched(true)}
              />
              {(nameTouched || submitAttempted) && nameError && (
                <p className={styles.errorText}>{nameError}</p>
              )}
            </div>

            {/* Shop Avatar */}
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
                {avatarError && (
                  <p className={styles.errorText}>{avatarError}</p>
                )}
              </div>
            </div>

            {/* Shop Description */}
            <div style={{ marginTop: "1rem" }}>
              <label className={styles.label}>Shop Description</label>
              <ReactQuill
                theme="snow"
                value={formData.shopDescription}
                onChange={(value) => {
                  handleDescriptionChange(value);
                  if (!descTouched) setDescTouched(true);
                }}
                onBlur={() => setDescTouched(true)}
              />
              {(descTouched || submitAttempted) && descError && (
                <p className={styles.errorText}>{descError}</p>
              )}
            </div>

            {/* Address Dropdowns */}
            <div className={styles.addressSection}>
              <div className={styles.addressLabel}>Address</div>
              <div className={styles.addressInputs}>
                <div className={styles.addressField}>
                  <label className={styles.label} htmlFor="province">
                    Province
                  </label>
                  <select
                    id="province"
                    name="province"
                    className={styles.input}
                    value={formData.province}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Select province</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.addressField}>
                  <label className={styles.label} htmlFor="district">
                    District
                  </label>
                  <select
                    id="district"
                    name="district"
                    className={styles.input}
                    value={formData.district}
                    onChange={handleDistrictChange}
                  >
                    <option value="">Select district</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.addressField}>
                  <label className={styles.label} htmlFor="ward">
                    Ward
                  </label>
                  <select
                    id="ward"
                    name="ward"
                    className={styles.input}
                    value={formData.ward}
                    onChange={handleChange}
                  >
                    <option value="">Select ward</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {addressError && (
                <p className={styles.errorText}>{addressError}</p>
              )}
            </div>

            {/* Preview */}
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
                <div className={styles.previewDesc}>
                  {truncatedDesc || "Your shop description preview…"}
                </div>
                <div className={styles.previewAddress}>
                  {(formData.province ||
                    formData.district ||
                    formData.ward) && (
                    <p>
                      {[
                        formData.detail,
                        formData.ward,
                        formData.district,
                        formData.province,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
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
