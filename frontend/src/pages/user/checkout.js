"use client";

import { useState, useEffect } from "react";
import "./checkout.css";
import axios from "axios";

function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("fast");
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
  const [openPaymentType, setOpenPaymentType] = useState(null);

  // Load provinces on component mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  // useEffect để lấy dữ liệu checkout và userId
  useEffect(() => {
    // Lấy dữ liệu checkout từ localStorage
    const storedCheckOut = localStorage.getItem("checkOut");
    if (storedCheckOut) {
      try {
        const checkOutData = JSON.parse(storedCheckOut);
        setCheckOut(checkOutData);
        console.log("CheckOut data:", checkOutData);

        // Lấy userId từ checkOut data
        if (checkOutData.UserId) {
          setUserId(checkOutData.UserId);
          fetchAddresses(checkOutData.UserId);
        } else {
          setError("Không tìm thấy thông tin người dùng trong checkout");
          setLoading(false);
        }

        // Transform checkout data thành orders format
        if (checkOutData.Items && Array.isArray(checkOutData.Items)) {
          transformCheckoutToOrders(checkOutData.Items);
        }
      } catch (err) {
        console.error("Error parsing checkout data:", err);
        setError("Lỗi đọc dữ liệu checkout");
        setLoading(false);
      }
    } else {
      setError("Không tìm thấy dữ liệu checkout");
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
        if (!res.ok) throw new Error("Không thể tải phương thức thanh toán");
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
                // Fetch product details với API endpoint mới
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

                  // Fetch variant details với API endpoint mới
                  let variant = null;
                  let variantPrice = item.Price;
                  let variantImage = product.ProductImage;
                  let variantName = "Mặc định";

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
                        // Ưu tiên lấy tên từ variant object
                        if (variant.ProductVariantName) {
                          variantName = variant.ProductVariantName;
                        } else if (
                          product.ProductVariant &&
                          Array.isArray(product.ProductVariant)
                        ) {
                          // Nếu không, tìm trong mảng ProductVariant của product
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
                        // Nếu không fetch được variant riêng, tìm trong mảng ProductVariant của product
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
                      // Nếu lỗi, thử tìm trong mảng ProductVariant của product
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
                    name: product.ProductName || "Sản phẩm",
                    description: product.Description || "",
                    price: variantPrice,
                    quantity: item.Quantity,
                    image: variantImage || "/placeholder.svg",
                    color: variantName,
                    ProductVariantName: variantName, // Đảm bảo luôn có trường này
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
                    name: "Sản phẩm",
                    description: "",
                    price: item.Price,
                    quantity: item.Quantity,
                    image: "/placeholder.svg",
                    color: "Mặc định",
                    ProductVariantName: "Mặc định", // fallback luôn có trường này
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
                  name: "Sản phẩm",
                  description: "",
                  price: item.Price,
                  quantity: item.Quantity,
                  image: "/placeholder.svg",
                  color: "Mặc định",
                  ProductVariantName: "Mặc định", // fallback luôn có trường này
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

          // Fetch shop details với API endpoint mới
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

      // Sử dụng GET request với userId trong URL path
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
      alert("Không tìm thấy thông tin người dùng");
      return;
    }

    // Validate số điện thoại phải đúng 10 chữ số
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newAddress.phoneNumber)) {
      alert("Số điện thoại phải có đúng 10 chữ số");
      return;
    }

    try {
      // Call API to add new address với endpoint mới
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
        alert("Thêm địa chỉ thành công!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add address");
      }
    } catch (err) {
      console.error("Error adding address:", err);
      alert("Có lỗi xảy ra khi thêm địa chỉ: " + err.message);
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
      alert("Vui lòng thêm địa chỉ giao hàng");
      return;
    }

    if (!checkOut || !checkOut.Items || checkOut.Items.length === 0) {
      alert("Giỏ hàng trống");
      return;
    }

    try {
      // Lặp qua từng shop để tạo orderItem và order riêng
      for (const shop of orders) {
        // 1. Chuẩn bị dữ liệu cho OrderItems của shop
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

        // 2. Gọi API tạo OrderItems cho shop
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
          throw new Error(err.message || "Tạo OrderItems thất bại");
        }
        const orderItemsData = await orderItemsRes.json();
        const orderItemsId = orderItemsData.orderItem._id;

        // 3. Chuẩn bị dữ liệu cho Order của shop
        const orderPayload = {
          PaymentId: selectedPayment,
          ShippingAddress: formatFullAddress(addresses[selectedAddress]),
          Status: "Pending",
          TotalAmount: calculateShopTotal(shop),
          BuyerId: userId,
          ShopId: shop.shopId,
          Items: orderItemsId,
          receiverName: addresses[selectedAddress]?.name, // truyền tên người nhận
          phoneNumber: addresses[selectedAddress]?.phone,   // truyền số điện thoại
        };

        // 4. Gọi API tạo Order cho shop
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
          throw new Error(err.message || "Tạo Order thất bại");
        }
      }
      // Thành công
      // Xóa từng sản phẩm đã đặt khỏi giỏ hàng
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user._id && checkOut.Items) {
        for (const item of checkOut.Items) {
          // Nếu có ProductVariant_id thì xóa theo biến thể, nếu không thì xóa theo sản phẩm
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
      alert("Có lỗi xảy ra khi đặt hàng: " + err.message);
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

  // Tạo danh sách các loại phương thức có trong danh sách trả về
  const paymentTypes = Object.keys(paymentTypeNames).filter((type) =>
    paymentMethods.some((m) => m.Type === type)
  );

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-main">
          {/* Địa chỉ giao hàng */}
          <div className="section-card">
            <div className="section-header">
              <i className="ti ti-map-pin"></i>
              <span>Địa chỉ nhận hàng</span>
            </div>
            <div className="address-content">
              {loading ? (
                <div className="address-loading">Đang tải địa chỉ...</div>
              ) : error ? (
                <div className="address-error">
                  Lỗi tải địa chỉ: {error}
                  <button
                    onClick={() => fetchAddresses()}
                    className="btn-retry"
                  >
                    Thử lại
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
                        <span className="address-default">Mặc định</span>
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
                    Thay đổi
                  </button>
                </>
              ) : (
                <div className="no-address">
                  <p>Chưa có địa chỉ giao hàng</p>
                  <button
                    className="btn-add-address"
                    onClick={() => setShowAddressModal(true)}
                  >
                    Thêm địa chỉ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sản phẩm theo shop */}
          {productsLoading ? (
            <div className="section-card">
              <div className="products-loading">
                <div className="loading-spinner"></div>
                <span>Đang tải sản phẩm...</span>
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
                      {shop.shopDescription && (
                        <div className="shop-description">
                          {shop.shopDescription}
                        </div>
                      )}
                      {shop.shopAddress && (
                        <div className="shop-address">{shop.shopAddress}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sản phẩm */}
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
                          Loại:{" "}
                          {item.color || item.ProductVariantName || "Mặc định"}
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

                {/* Tổng tiền shop */}
                <div className="shop-total">
                  <span>Tổng số tiền ({shop.items.length} sản phẩm): </span>
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
                <p>Giỏ hàng trống</p>
              </div>
            </div>
          )}

          {/* Phương thức thanh toán */}
          <div className="section-card">
            <div className="section-header">
              <img
                src="/logo-ecommerce.jpg"
                alt="Logo"
                className="checkout-logo"
              />
              <span>Thanh Toán</span>
            </div>
            <div
              className="payment-options"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {paymentLoading ? (
                <div className="payment-loading">
                  Đang tải phương thức thanh toán...
                </div>
              ) : paymentError ? (
                <div className="payment-error">
                  Lỗi: {paymentError}
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-retry"
                  >
                    Thử lại
                  </button>
                </div>
              ) : paymentTypes.length === 0 ? (
                <div className="payment-empty">
                  Không có phương thức thanh toán khả dụng
                </div>
              ) : (
                paymentTypes.map((type) => {
                  // Lọc và sắp xếp phương thức theo loại, mặc định lên đầu
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
                          {methods.length} phương thức
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
                                <span className="payment-default">
                                  Mặc định
                                </span>
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

        {/* Sidebar thanh toán */}
        <div className="checkout-sidebar">
          <div className="payment-summary">
            <h3>Đơn hàng</h3>

            <div className="summary-row">
              <span>Tạm tính</span>
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
              <span>Tổng cộng</span>
              <span>{formatCurrency(calculateGrandTotal())}</span>
            </div>

            <button
              className="btn-checkout"
              disabled={addresses.length === 0 || orders.length === 0}
              onClick={handleCheckout}
            >
              {addresses.length === 0
                ? "Vui lòng thêm địa chỉ"
                : orders.length === 0
                ? "Giỏ hàng trống"
                : "Đặt hàng"}
            </button>

            <div className="checkout-note">
              Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo điều
              khoản của EZShop
            </div>
          </div>
        </div>
      </div>

      {/* Modal thêm địa chỉ */}
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
              <h3>Địa chỉ mới</h3>
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
                      placeholder="Họ và tên"
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
                      placeholder="Số điện thoại"
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
                      <option value="">Chọn Tỉnh/Thành phố</option>
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
                      <option value="">Chọn Quận/Huyện</option>
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
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Địa chỉ cụ thể (số nhà, tên đường...)"
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
                    <span>Thiết lập làm địa chỉ mặc định</span>
                  </label>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddressModal(false)}
                  >
                    Trở Lại
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Hoàn thành
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal danh sách địa chỉ */}
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
              <h3>Chọn địa chỉ giao hàng</h3>
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
                          <span className="address-default">Mặc định</span>
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
                  Thêm địa chỉ mới
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddressListModal(false)}
                >
                  Xác nhận
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
            <h2>Đặt hàng thành công!</h2>
            <p>Bạn sẽ được chuyển về trang chủ sau 5 giây...</p>
            <button
              className="btn btn-primary"
              onClick={() =>
                (window.location.href = "http://localhost:3000/Ecommerce/home")
              }
            >
              Về trang chủ ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
