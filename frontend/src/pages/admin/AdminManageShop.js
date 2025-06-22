import { useState, useEffect } from "react";
import "../../style/ShopManagement.css";
import AdminLayout from "../../components/admin/AdminLayout";

function ShopManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedShop, setSelectedShop] = useState(null);
  const [showShopDetails, setShowShopDetails] = useState(false);
  const [shopList, setShopList] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/admin/getShop`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Data fetch thành công:", data);
        setShopList(data);
      })
      .catch((err) => console.error("❌ Lỗi khi lấy thông tin shop:", err));
  }, []); // ✅ Chạy một lần duy nhất

  const filteredShops = shopList.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.owner?.Username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.owner?.Email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || shop.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Active: { text: "Active", class: "badge-success" },
      Pending: { text: "Pending", class: "badge-warning" },
      Banned: { text: "Banned", class: "badge-danger" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      class: "badge-secondary",
    };
    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
    );
  };

  // const getRatingStars = (rating) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 !== 0;

  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(<i key={i} className="ti ti-star-filled star-filled"></i>);
  //   }

  //   if (hasHalfStar) {
  //     stars.push(
  //       <i key="half" className="ti ti-star-half-filled star-half"></i>
  //     );
  //   }

  //   const emptyStars = 5 - Math.ceil(rating);
  //   for (let i = 0; i < emptyStars; i++) {
  //     stars.push(<i key={`empty-${i}`} className="ti ti-star star-empty"></i>);
  //   }

  //   return stars;
  // };

  const handleViewShop = (shop) => {
    setSelectedShop(shop);
    setShowShopDetails(true);
  };

  const handleApproveShop = (shopId) => {
    if (window.confirm("Bạn có chắc chắn muốn duyệt gian hàng này?")) {
      console.log("Approving shop:", shopId);
    }
  };

  const handleSuspendShop = async (shopId) => {
    const confirmAction = window.confirm(
      "Are You Sure To Update This Shop Status ?"
    );
    if (confirmAction) {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/banShop/${shopId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Cập nhật trạng thái thất bại");
        }

        const result = await response.json();
        console.log("✅ Cập nhật thành công:", result);

        // Làm mới danh sách shop
        fetch(`http://localhost:5000/admin/getShop`)
          .then((res) => res.json())
          .then((data) => setShopList(data));
      } catch (error) {
        console.error("❌ Lỗi cập nhật trạng thái shop:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái shop.");
      }
    }
  };

  // const handleDeleteShop = (shopId) => {
  //   if (
  //     window.confirm(
  //       "Bạn có chắc chắn muốn xóa gian hàng này? Hành động này không thể hoàn tác."
  //     )
  //   ) {
  //     console.log("Deleting shop:", shopId);
  //   }
  // };

  return (
    <AdminLayout currentPage="shops" pageTitle="Manage Shops">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Shops</span>
            <i className="ti ti-building-store stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{shopList.length}</div>
            {/* <div className="stat-change positive">+3 gian hàng mới</div> */}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Active Shop</span>
            <i className="ti ti-check stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {shopList.filter((s) => s.status === "Active").length}
            </div>
            {/* <div className="stat-change positive">80% tổng số</div> */}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Shop</span>
            <i className="ti ti-clock stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {shopList.filter((s) => s.status === "Pending").length}
            </div>
            {/* <div className="stat-change neutral">Cần xem xét</div> */}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Banned Shop</span>
            <i className="ti ti-ban stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {shopList.filter((s) => s.status === "Banned").length}
            </div>
            {/* <div className="stat-change negative">Cần xử lý</div> */}
          </div>
        </div>
      </div>

      {/* Shop Management Table */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">
            <h3>Shops List</h3>
            <p>Manage All Shops In System</p>
          </div>
        </div>

        {/* Filters */}
        <div className="table-controls">
          <div className="filters-row">
            <div className="search-box">
              <i className="ti ti-search"></i>
              <input
                type="text"
                placeholder="Searching Shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {shopCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select> */}

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Banned">Banned</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="shop-table">
            <thead>
              <tr>
                <th>Shops</th>
                <th>Owner</th>
                {/* <th>Danh mục</th> */}
                <th>Status</th>
                <th>Total Products</th>
                {/* <th>Đánh giá</th>
                <th>Doanh thu</th> */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr key={shop._id}>
                  <td>
                    <div className="shop-info">
                      <img
                        src={shop.shopAvatar || "/placeholder.svg"}
                        alt={shop.name}
                        className="shop-logo"
                      />
                      <div className="shop-details">
                        <div className="shop-name">{shop.name}</div>
                        <div className="shop-email">{shop.owner?.Email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="owner-info">
                      <div className="owner-name">{shop.owner?.Username}</div>
                      <div className="owner-phone">
                        {shop.owner?.PhoneNumber}
                      </div>
                    </div>
                  </td>

                  <td>{getStatusBadge(shop.status)}</td>
                  <td>
                    <span className="product-count">
                      {shop.totalProducts || 0}
                    </span>
                  </td>
                  {/* <td>
                    <div className="rating-info">
                      <div className="stars">{getRatingStars(shop.rating)}</div>
                      <span className="rating-number">{shop.rating}</span>
                    </div>
                  </td>
                  <td>
                    <span className="revenue-amount">
                      {formatCurrency(shop.revenue)}
                    </span>
                  </td> */}
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewShop(shop)}
                        title="Xem chi tiết"
                      >
                        <i className="ti ti-eye"></i>
                      </button>

                      {shop.status === "Pending" && (
                        <button
                          className="btn-action btn-approve"
                          onClick={() => handleApproveShop(shop._id)}
                          title="Duyệt"
                        >
                          <i className="ti ti-check"></i>
                        </button>
                      )}
                      {shop.status === "Banned" && (
                        <button
                          className=" btn-action ti ti-lock-open text-blue-500 text-xl"
                          onClick={() => handleSuspendShop(shop._id)}
                          title="Unban"
                        >
                          <i className="ti ti-check"></i>
                        </button>
                      )}
                      {shop.status === "Active" && (
                        <button
                          className="btn-action btn-suspend"
                          onClick={() => handleSuspendShop(shop._id)}
                          title="Tạm khóa"
                        >
                          <i className="ti ti-ban"></i>
                        </button>
                      )}
                      {/* <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteShop(shop.id)}
                        title="Xóa"
                      >
                        <i className="ti ti-trash"></i>
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shop Details Modal */}
      {showShopDetails && selectedShop && (
        <div
          className="modal-overlay"
          onClick={() => setShowShopDetails(false)}
        >
          <div
            className="modal-content shop-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Shop Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowShopDetails(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="shop-details-content">
                <div className="shop-header">
                  <img
                    src={selectedShop.shopAvatar || "/placeholder.svg"}
                    alt={selectedShop.name}
                    className="shop-logo-large"
                  />
                  <div className="shop-info-large">
                    <h4>{selectedShop.name}</h4>
                    {/* <p>{selectedShop.category}</p> */}
                    {/* <div className="rating-large">
                      {getRatingStars(selectedShop.rating)}
                      <span>({selectedShop.rating})</span>
                    </div> */}
                  </div>
                  <div className="shop-status-large">
                    {getStatusBadge(selectedShop.status)}
                  </div>
                </div>

                <div className="shop-stats">
                  <div className="stat-item">
                    <i className="ti ti-package"></i>
                    <div>
                      <span className="stat-label">Total Products</span>
                      <span className="stat-value">
                        {selectedShop.totalProducts || 0}
                      </span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="ti ti-shopping-cart"></i>
                    <div>
                      <span className="stat-label">Orders</span>
                      <span className="stat-value">
                        {selectedShop.totalOrders || 0}
                      </span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="ti ti-currency-dollar"></i>
                    <div>
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">
                        {formatCurrency(selectedShop.revenue) || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shop-contact">
                  <h5>Contact Information</h5>
                  <div className="contact-item">
                    <i className="ti ti-user"></i>
                    <span>
                      Full Name: {selectedShop.owner?.FirstName}{" "}
                      {selectedShop.owner?.LastName}
                    </span>
                  </div>
                  <div className="contact-item">
                    <i className="ti ti-mail"></i>
                    <span>Email: {selectedShop.owner?.Email}</span>
                  </div>
                  <div className="contact-item">
                    <i className="ti ti-phone"></i>
                    <span>
                      Phone Number:{" "}
                      {selectedShop.owner?.PhoneNumber || "Not Updated"}
                    </span>
                  </div>
                  {/* <div className="contact-item">
                    <i className="ti ti-map-pin"></i>
                    <span>{selectedShop.address}</span>
                  </div> */}
                  <div className="contact-item">
                    <i className="ti ti-calendar"></i>
                    <span>
                      Joined Date:{" "}
                      {new Date(
                        selectedShop.owner?.createdAt
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ShopManagement;
