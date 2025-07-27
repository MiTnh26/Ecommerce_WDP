"use client";

import { useState, useEffect } from "react";
import "./checkout.css";
import axios from "axios";

function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [checkOut, setCheckOut] = useState();
  const [orders, setOrders] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    receiverName: "",
    phoneNumber: "",
    province: "",
    district: "",
    ward: "",
    detail: "",
    status: "Inactive",
    type: "home",
  });
  const [showAddressListModal, setShowAddressListModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // States for location data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Thêm mapping cho tên loại phương thức thanh toán
  const paymentTypeNames = {
    e_wallet: "E Wallet",
    card: "Card",
    bank_transfer: "Bank Transfer",
    cod: "COD",
    gateway: "Gate Way",
  };

  // Thêm state cho dropbox mở/đóng từng loại
  const [openPaymentType, setOpenPaymentType] = useState(() => {
    // On mount, open the payment type that contains the default method
    return (() => {
      if (paymentMethods && paymentMethods.length > 0) {
        const defaultMethod = paymentMethods.find((m) => m.Default);
        if (defaultMethod) return defaultMethod.Type;
      }
      return null;
    })();
  });

  // Ensure openPaymentType updates if paymentMethods change (e.g. after fetch)
  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0) {
      const defaultMethod = paymentMethods.find((m) => m.Default);
      if (defaultMethod) setOpenPaymentType(defaultMethod.Type);
    }
  }, [paymentMethods]);

  // Load provinces on component mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  // useEffect to get checkout data and userId
  useEffect(() => {
    // Get checkout data from localStorage
    const storedCheckOut = localStorage.getItem("checkOut");
    if (storedCheckOut) {
      try {
        const checkOutData = JSON.parse(storedCheckOut);
        setCheckOut(checkOutData);
        console.log("CheckOut data:", checkOutData);

        // Get userId from checkOut data
        if (checkOutData.UserId) {
          setUserId(checkOutData.UserId);
          fetchAddresses(checkOutData.UserId);
        } else {
          setError("User information not found in checkout");
          setLoading(false);
        }

        // Transform checkout data to orders format
        if (checkOutData.Items && Array.isArray(checkOutData.Items)) {
          transformCheckoutToOrders(checkOutData.Items);
        }
      } catch (err) {
        console.error("Error parsing checkout data:", err);
        setError("Error reading checkout data");
        setLoading(false);
      }
    } else {
      setError("Checkout data not found");
      setLoading(false);
    }
  }, []);

  // Fetch payment methods from backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setPaymentLoading(true);
      setPaymentError(null);
      try {
        const res = await fetch(
          "http://localhost:5000/customer/getPaymentMethod"
        );
        if (!res.ok) throw new Error("Could not load payment methods");
        const data = await res.json();
        setPaymentMethods(data);
        // Set default payment method
        const defaultMethod = data.find((m) => m.Default) || data[0] || null;
        setSelectedPayment(defaultMethod ? defaultMethod._id : null);
      } catch (err) {
        setPaymentError(err.message);
        setPaymentMethods([]);
      } finally {
        setPaymentLoading(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Khi chọn tỉnh
  const handleProvinceChange = async (e) => {
    const name = e.target.value;
    const selected = provinces.find((p) => p.name === name);
    setNewAddress((prev) => ({
      ...prev,
      province: selected?.name || "",
      district: "",
      ward: "",
    }));

    if (!selected) return;

    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${selected.code}?depth=2`
      );
      const data = await res.json();
      setDistricts(data.districts || []);
      setWards([]);
    } catch (err) {
      console.error("Error loading districts:", err);
    }
  };

  // Khi chọn quận/huyện
  const handleDistrictChange = async (e) => {
    const name = e.target.value;
    const selected = districts.find((d) => d.name === name);
    setNewAddress((prev) => ({
      ...prev,
      district: selected?.name || "",
      ward: "",
    }));

    if (!selected) return;

    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${selected.code}?depth=2`
      );
      const data = await res.json();
      setWards(data.wards || []);
    } catch (err) {
      console.error("Error loading wards:", err);
    }
  };

  // Xử lý thay đổi các trường khác
  const handleAddressFieldChange = (e) => {
    const { name, value } = e.target;
    if (name === "ward") {
      const selected = wards.find((w) => w.name === value);
      setNewAddress((prev) => ({
        ...prev,
        ward: selected?.name || "",
      }));
    } else {
      setNewAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Function to format full address
  const formatFullAddress = (address) => {
    const parts = [];
    if (address.detail) parts.push(address.detail);
    if (address.ward) parts.push(address.ward);
    if (address.district) parts.push(address.district);
    if (address.province) parts.push(address.province);
    return parts.join(", ");
  };

  const transformCheckoutToOrders = async (items) => {
    setProductsLoading(true);
    try {
      // Group items by ShopId
      const groupedByShop = items.reduce((acc, item) => {
        const shopId = item.ShopId;
        if (!acc[shopId]) {
          acc[shopId] = [];
        }
        acc[shopId].push(item);
        return acc;
      }, {});

      // Transform each shop group
      const transformedOrders = await Promise.all(
        Object.entries(groupedByShop).map(async ([shopId, shopItems]) => {
          // Fetch product details for each item
          const itemsWithDetails = await Promise.all(
            shopItems.map(async (item) => {
              try {
                // Fetch product details with new API endpoint
                const productResponse = await fetch(
                  `http://localhost:5000/customer/getProduct/${item.Product_Id}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (productResponse.ok) {
                  const product = await productResponse.json();
                  console.log("Product data:", product);

                  // Fetch variant details with new API endpoint
                  let variant = null;
                  let variantPrice = item.Price;
                  let variantImage = product.ProductImage;
                  let variantName = "Default";

                  if (item.ProductVariant_id) {
                    try {
                      const variantResponse = await fetch(
                        `http://localhost:5000/customer/getProduct/${item.Product_Id}/variant/${item.ProductVariant_id}`,
                        {
                          method: "GET",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      if (variantResponse.ok) {
                        variant = await variantResponse.json();
                        console.log("Variant data:", variant);
                        variantPrice = variant.Price || item.Price;
                        variantImage = variant.Image || product.ProductImage;
                        // Prioritize getting name from variant object
                        if (variant.ProductVariantName) {
                          variantName = variant.ProductVariantName;
                        } else if (
                          product.ProductVariant &&
                          Array.isArray(product.ProductVariant)
                        ) {
                          // If not, find in the product's ProductVariant array
                          const found = product.ProductVariant.find(
                            (v) => v._id === item.ProductVariant_id
                          );
                          if (found && found.ProductVariantName) {
                            variantName = found.ProductVariantName;
                          }
                        }
                      } else if (
                        product.ProductVariant &&
                        Array.isArray(product.ProductVariant)
                      ) {
                        // If variant cannot be fetched separately, find in the product's ProductVariant array
                        const found = product.ProductVariant.find(
                          (v) => v._id === item.ProductVariant_id
                        );
                        if (found && found.ProductVariantName) {
                          variantName = found.ProductVariantName;
                        }
                      }
                    } catch (variantErr) {
                      console.error(
                        "Error fetching variant details:",
                        variantErr
                      );
                      // If error, try to find in the product's ProductVariant array
                      if (
                        product.ProductVariant &&
                        Array.isArray(product.ProductVariant)
                      ) {
                        const found = product.ProductVariant.find(
                          (v) => v._id === item.ProductVariant_id
                        );
                        if (found && found.ProductVariantName) {
                          variantName = found.ProductVariantName;
                        }
                      }
                    }
                  }

                  return {
                    id: item.Product_Id,
                    name: product.ProductName || "Product",
                    description: product.Description || "",
                    price: variantPrice,
                    quantity: item.Quantity,
                    image: variantImage || "/placeholder.svg",
                    color: variantName,
                    ProductVariantName: variantName, // Ensure this field is always present
                    productId: item.Product_Id,
                    variantId: item.ProductVariant_id,
                    sales: product.Sales || 0,
                    status: product.Status || "Active",
                    categoryId: product.CategoryId,
                    createdAt: product.CreatedAt,
                    stockQuantity: variant?.StockQuantity || 0,
                    variantStatus: variant?.Status || "Active",
                  };
                } else {
                  // Fallback if API fails
                  console.error(
                    "Failed to fetch product:",
                    productResponse.status
                  );
                  return {
                    id: item.Product_Id,
                    name: "Product",
                    description: "",
                    price: item.Price,
                    quantity: item.Quantity,
                    image: "/placeholder.svg",
                    color: "Default",
                    ProductVariantName: "Default", // fallback always has this field
                    productId: item.Product_Id,
                    variantId: item.ProductVariant_id,
                    sales: 0,
                    status: "Active",
                    stockQuantity: 0,
                    variantStatus: "Active",
                  };
                }
              } catch (err) {
                console.error("Error fetching product details:", err);
                return {
                  id: item.Product_Id,
                  name: "Product",
                  description: "",
                  price: item.Price,
                  quantity: item.Quantity,
                  image: "/placeholder.svg",
                  color: "Default",
                  ProductVariantName: "Default", // fallback always has this field
                  productId: item.Product_Id,
                  variantId: item.ProductVariant_id,
                  sales: 0,
                  status: "Active",
                  stockQuantity: 0,
                  variantStatus: "Active",
                };
              }
            })
          );

          // Fetch shop details with new API endpoint
          let shopName = `Shop ${shopId}`;
          let shopAvatar = "/placeholder.svg";
          let shopDescription = "";
          let shopAddress = "";
          let shopStatus = "Active";

          try {
            const shopResponse = await fetch(
              `http://localhost:5000/customer/getShop/${shopId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (shopResponse.ok) {
              const shopData = await shopResponse.json();
              console.log("Shop data:", shopData);

              shopName = shopData.name || shopName;
              shopAvatar = shopData.shopAvatar || shopAvatar;
              shopDescription = shopData.description || "";
              shopStatus = shopData.status || "Active";

              // Format shop address
              if (shopData.address) {
                const addressParts = [];
                if (shopData.address.ward)
                  addressParts.push(shopData.address.ward);
                if (shopData.address.district)
                  addressParts.push(shopData.address.district);
                if (shopData.address.province)
                  addressParts.push(shopData.address.province);
                shopAddress = addressParts.join(", ");
              }
            }
          } catch (err) {
            console.error("Error fetching shop details:", err);
          }

          return {
            shopId: shopId,
            shopName: shopName,
            shopAvatar: shopAvatar,
            shopDescription: shopDescription,
            shopAddress: shopAddress,
            shopStatus: shopStatus,
            isOnline: shopStatus === "Active",
            items: itemsWithDetails,
          };
        })
      );

      setOrders(transformedOrders);
    } catch (err) {
      console.error("Error transforming checkout data:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchAddresses = async (userIdParam) => {
    try {
      setLoading(true);
      setError(null);

      // Use GET request with userId in URL path
      const response = await fetch(
        `http://localhost:5000/customer/getAddress/${userIdParam || userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      console.log("Addresses data:", data);

      if (data.addresses && Array.isArray(data.addresses)) {
        // Transform API data to match component structure
        const transformedAddresses = data.addresses.map((addr, index) => ({
          id: addr._id,
          name: addr.receiverName,
          phone: addr.phoneNumber,
          isDefault: addr.status === "Default",
          type: "home", // Default type since API doesn't provide this
          detail: addr.detail,
          district: addr.district,
          province: addr.province,
          ward: addr.ward,
        }));

        setAddresses(transformedAddresses);

        // Set selected address to default one or first one
        const defaultIndex = transformedAddresses.findIndex(
          (addr) => addr.isDefault
        );
        setSelectedAddress(defaultIndex >= 0 ? defaultIndex : 0);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User information not found");
      return;
    }

    // Validate phone number must be 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newAddress.phoneNumber)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      // Call API to add new address with new endpoint
      const response = await fetch(
        `http://localhost:5000/customer/user/${userId}/address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: newAddress.phoneNumber,
            receiverName: newAddress.receiverName,
            status: newAddress.status,
            province: newAddress.province,
            district: newAddress.district,
            ward: newAddress.ward,
            detail: newAddress.detail,
          }),
        }
      );

      if (response.ok) {
        // Refresh addresses list
        await fetchAddresses();

        // Reset form
        setNewAddress({
          receiverName: "",
          phoneNumber: "",
          province: "",
          district: "",
          ward: "",
          detail: "",
          status: "Inactive",
          type: "home",
        });
        setDistricts([]);
        setWards([]);
        setShowAddressModal(false);
        alert("Address added successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add address");
      }
    } catch (err) {
      console.error("Error adding address:", err);
      alert("An error occurred while adding address: " + err.message);
    }
  };

  const calculateShopTotal = (shop) => {
    const itemsTotal = shop.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return itemsTotal;
  };

  const calculateGrandTotal = () => {
    const itemsTotal = orders.reduce(
      (sum, shop) => sum + calculateShopTotal(shop),
      0
    );
    return itemsTotal;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleCheckout = async () => {
    if (!userId || addresses.length === 0) {
      alert("Please add a shipping address");
      return;
    }

    if (!checkOut || !checkOut.Items || checkOut.Items.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      // Loop through each shop to create orderItem and order separately
      for (const shop of orders) {
        // 1. Prepare data for OrderItems of the shop
        const orderItemsPayload = {
          Product: shop.items.map((item) => ({
            _id: item.productId,
            ProductName: item.name,
            ProductImage: item.image,
            ProductVariant: [
              {
                _id: item.variantId || item.productId,
                Image: item.image,
                Price: item.price,
                ProductVariantName: item.ProductVariantName,
                Quantity: item.quantity,
              },
            ],
          })),
          Total: calculateShopTotal(shop),
          Status: "Pending",
        };

        // 2. Call API to create OrderItems for the shop
        const orderItemsRes = await fetch(
          "http://localhost:5000/customer/createOrderItems",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderItemsPayload),
          }
        );
        if (!orderItemsRes.ok) {
          const err = await orderItemsRes.json();
          throw new Error(err.message || "Failed to create OrderItems");
        }
        const orderItemsData = await orderItemsRes.json();
        const orderItemsId = orderItemsData.orderItem._id;

        // 3. Prepare data for Order of the shop
        const orderPayload = {
          PaymentId: selectedPayment,
          ShippingAddress: formatFullAddress(addresses[selectedAddress]),
          Status: "Pending",
          TotalAmount: calculateShopTotal(shop),
          BuyerId: userId,
          ShopId: shop.shopId,
          Items: orderItemsId,
          receiverName: addresses[selectedAddress]?.name, // pass receiver name
          phoneNumber: addresses[selectedAddress]?.phone, // pass phone number
        };

        // 4. Call API to create Order for the shop
        const orderRes = await fetch(
          "http://localhost:5000/customer/checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
          }
        );
        if (!orderRes.ok) {
          const err = await orderRes.json();
          throw new Error(err.message || "Failed to create Order");
        }
      }
      // Success
      // Remove each ordered product from the cart
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user._id && checkOut.Items) {
        for (const item of checkOut.Items) {
          // If there is a ProductVariant_id, delete by variant, otherwise delete by product
          await axios.delete(
            "http://localhost:5000/customer/remove-p-variant-cart",
            {
              data: {
                UserId: user._id,
                Product_id: item.Product_Id,
                ProductVariant: { _id: item.ProductVariant_id },
              },
              withCredentials: true,
            }
          );
        }
      }
      setShowSuccessModal(true);
      localStorage.removeItem("checkOut");
      setTimeout(() => {
        window.location.href = "http://localhost:3000/Ecommerce/home";
      }, 5000);
    } catch (err) {
      console.error("Error creating order:", err);
      alert("An error occurred while placing order: " + err.message);
    }
  };

  const handleSelectAddress = (index) => {
    setSelectedAddress(index);
    setShowAddressListModal(false);
  };

  const handleSetDefaultAddress = (isDefault) => {
    setNewAddress({
      ...newAddress,
      status: isDefault ? "Default" : "Inactive",
    });
  };

  // Create a list of payment methods available in the returned list
  const paymentTypes = Object.keys(paymentTypeNames).filter((type) =>
    paymentMethods.some((m) => m.Type === type)
  );

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-main">
          {/* Shipping Address */}
          <div className="section-card">
            <div className="section-header">
              <i className="ti ti-map-pin"></i>
              <span>Shipping Address</span>
            </div>
            <div className="address-content">
              {loading ? (
                <div className="address-loading">Loading addresses...</div>
              ) : error ? (
                <div className="address-error">
                  Error loading addresses: {error}
                  <button
                    onClick={() => fetchAddresses()}
                    className="btn-retry"
                  >
                    Retry
                  </button>
                </div>
              ) : addresses.length > 0 ? (
                <>
                  <div className="address-info">
                    <div className="address-main">
                      <span className="address-name">
                        {addresses[selectedAddress]?.name}
                      </span>
                      <span className="address-phone">
                        {addresses[selectedAddress]?.phone}
                      </span>
                      {addresses[selectedAddress]?.isDefault && (
                        <span className="address-default">Default</span>
                      )}
                    </div>
                    <div className="address-detail">
                      {formatFullAddress(addresses[selectedAddress])}
                    </div>
                  </div>
                  <button
                    className="btn-change"
                    onClick={() => setShowAddressListModal(true)}
                  >
                    Change
                  </button>
                </>
              ) : (
                <div className="no-address">
                  <p>No shipping address added</p>
                  <button
                    className="btn-add-address"
                    onClick={() => setShowAddressModal(true)}
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Products by shop */}
          {productsLoading ? (
            <div className="section-card">
              <div className="products-loading">
                <div className="loading-spinner"></div>
                <span>Loading products...</span>
              </div>
            </div>
          ) : orders.length > 0 ? (
            orders.map((shop) => (
              <div key={shop.shopId} className="section-card shop-section">
                {/* Shop header */}
                <div className="shop-header">
                  <div className="shop-info">
                    <div className="shop-avatar">
                      <img
                        src={shop.shopAvatar || "/placeholder.svg"}
                        alt={shop.shopName}
                        className="shop-avatar-img"
                        onError={(e) => {
                          if (!e.target.src.includes("/placeholder.svg")) {
                            e.target.src = "/placeholder.svg";
                          }
                        }}
                      />
                    </div>
                    <div className="shop-details">
                      <div className="shop-name-row">
                        <span className="shop-name">{shop.shopName}</span>
                      </div>

                      {shop.shopAddress && (
                        <div className="shop-address">{shop.shopAddress}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="products-list">
                  {shop.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="product-item"
                    >
                      <div className="product-image-container">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="product-image"
                          onError={(e) => {
                            if (!e.target.src.includes("/placeholder.svg")) {
                              e.target.src = "/placeholder.svg";
                            }
                          }}
                        />
                      </div>
                      <div className="product-info">
                        <div className="product-name" title={item.name}>
                          {item.name}
                        </div>
                        <div className="product-variant">
                          Type:{" "}
                          {item.color || item.ProductVariantName || "Default"}
                        </div>
                      </div>
                      <div className="product-price">
                        {formatCurrency(item.price)}
                      </div>
                      <div className="product-quantity">x{item.quantity}</div>
                      <div className="product-total">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop total */}
                <div className="shop-total">
                  <span>Total amount ({shop.items.length} products): </span>
                  <span className="total-amount">
                    {formatCurrency(calculateShopTotal(shop))}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="section-card">
              <div className="empty-cart">
                <i className="ti ti-shopping-cart-off"></i>
                <p>Cart is empty</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="section-card">
            <div className="section-header">
              <img
                src="/logo-ecommerce.jpg"
                alt="Logo"
                className="checkout-logo"
              />
              <span>Payment</span>
            </div>
            <div
              className="payment-options"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {paymentLoading ? (
                <div className="payment-loading">
                  Loading payment methods...
                </div>
              ) : paymentError ? (
                <div className="payment-error">
                  Error: {paymentError}
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-retry"
                  >
                    Retry
                  </button>
                </div>
              ) : paymentTypes.length === 0 ? (
                <div className="payment-empty">
                  No payment methods available
                </div>
              ) : (
                paymentTypes.map((type) => {
                  // Filter and sort payment methods by type, default first
                  const methods = paymentMethods
                    .filter((m) => m.Type === type)
                    .sort((a, b) => (b.Default ? 1 : 0) - (a.Default ? 1 : 0));
                  return (
                    <div key={type} className="payment-dropbox">
                      <button
                        type="button"
                        className="payment-dropbox-btn"
                        onClick={() =>
                          setOpenPaymentType(
                            openPaymentType === type ? null : type
                          )
                        }
                      >
                        <span>{paymentTypeNames[type]}</span>
                        <span
                          style={{ marginLeft: 8, fontSize: 12, color: "#888" }}
                        >
                          {methods.length} methods
                        </span>
                        <span style={{ marginLeft: "auto" }}>
                          <i
                            className={`ti ti-chevron-${
                              openPaymentType === type ? "up" : "down"
                            }`}
                          ></i>
                        </span>
                      </button>
                      {openPaymentType === type && (
                        <div className="payment-dropbox-list">
                          {methods.map((method) => (
                            <label
                              key={method._id}
                              className="payment-option"
                              style={{ marginBottom: 0 }}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value={method._id}
                                checked={selectedPayment === method._id}
                                onChange={() => setSelectedPayment(method._id)}
                              />
                              {method.Image && (
                                <img
                                  src={method.Image}
                                  alt={method.Name}
                                  className="payment-method-img"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    objectFit: "contain",
                                    marginRight: 8,
                                  }}
                                  onError={(e) =>
                                    (e.target.style.display = "none")
                                  }
                                />
                              )}
                              <span>{method.Name}</span>
                              <span
                                style={{
                                  marginLeft: 8,
                                  color: "#888",
                                  fontSize: 12,
                                }}
                              >
                                {method.Provider}
                              </span>
                              {method.Default && (
                                <span className="payment-default">Default</span>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar for payment */}
        <div className="checkout-sidebar">
          <div className="payment-summary">
            <h3>Order</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>
                {formatCurrency(
                  orders.reduce(
                    (sum, shop) => sum + calculateShopTotal(shop),
                    0
                  )
                )}
              </span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>{formatCurrency(calculateGrandTotal())}</span>
            </div>

            <button
              className="btn-checkout"
              disabled={addresses.length === 0 || orders.length === 0}
              onClick={handleCheckout}
            >
              {addresses.length === 0
                ? "Please add an address"
                : orders.length === 0
                ? "Cart is empty"
                : "Place Order"}
            </button>

            <div className="checkout-note">
              Clicking "Place Order" means you agree to EZShop's terms.
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="modal-content address-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>New Address</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddressSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Receiver Name"
                      name="receiverName"
                      value={newAddress.receiverName}
                      onChange={handleAddressFieldChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      name="phoneNumber"
                      value={newAddress.phoneNumber}
                      onChange={handleAddressFieldChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <select
                      value={newAddress.province}
                      onChange={handleProvinceChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Province/City</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <select
                      value={newAddress.district}
                      onChange={handleDistrictChange}
                      className="form-control"
                      required
                      disabled={!newAddress.province}
                    >
                      <option value="">Select District/County</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <select
                    name="ward"
                    value={newAddress.ward}
                    onChange={handleAddressFieldChange}
                    className="form-control"
                    required
                    disabled={!newAddress.district}
                  >
                    <option value="">Select Ward/Commune</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Specific Address (House number, street name...)"
                    name="detail"
                    value={newAddress.detail}
                    onChange={handleAddressFieldChange}
                    className="form-control address-textarea"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newAddress.status === "Default"}
                      onChange={(e) =>
                        handleSetDefaultAddress(e.target.checked)
                      }
                    />
                    <span>Set as default address</span>
                  </label>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Complete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Address List Modal */}
      {showAddressListModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddressListModal(false)}
        >
          <div
            className="modal-content address-list-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Select Shipping Address</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddressListModal(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="address-list">
                {addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className={`address-item ${
                      selectedAddress === index ? "selected" : ""
                    }`}
                    onClick={() => handleSelectAddress(index)}
                  >
                    <div className="address-radio">
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddress === index}
                        onChange={() => handleSelectAddress(index)}
                      />
                    </div>
                    <div className="address-details">
                      <div className="address-header">
                        <span className="address-name">{address.name}</span>
                        <span className="address-phone">{address.phone}</span>
                        {address.isDefault && (
                          <span className="address-default">Default</span>
                        )}
                      </div>
                      <div className="address-full">
                        {formatFullAddress(address)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddressListModal(false);
                    setShowAddressModal(true);
                  }}
                >
                  <i className="ti ti-plus"></i>
                  Add New Address
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddressListModal(false)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="success-modal">
            <div className="success-icon">
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="28" cy="28" r="28" fill="#eafaf1" />
                <path
                  d="M18 29.5L25 36.5L39 22.5"
                  stroke="#27ae60"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>Order placed successfully!</h2>
            <p>You will be redirected to the home page in 5 seconds...</p>
            <button
              className="btn btn-primary"
              onClick={() =>
                (window.location.href = "http://localhost:3000/Ecommerce/home")
              }
            >
              Go to Home Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
