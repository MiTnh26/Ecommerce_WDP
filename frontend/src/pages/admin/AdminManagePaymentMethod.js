"use client";

import { useState, useEffect } from "react";
import "../../style/PaymentManagement.css";
import AdminLayout from "../../components/admin/AdminLayout";

const paymentTypes = [
  "All Method",
  "e_wallet",
  "card",
  "bank_transfer",
  "cod",
  "gateway",
];
const paymentTypeLabels = {
  "All Method": "All Method",
  e_wallet: "E Wallet",
  card: "Card",
  bank_transfer: "Bank Transfer",
  cod: "COD",
  gateway: "Gate Way",
};

function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Method");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch payment methods from API
  useEffect(() => {
    fetchPaymentMethods();
    fetchOrder();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/admin/getPaymentMethod"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Payment methods fetched successfully:", data);
      setPaymentMethods(data);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching payment methods:", err);
      setError("Không thể tải danh sách phương thức thanh toán");
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/admin/getOrder");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Order fetched successfully:", data);
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching payment methods:", err);
      setError("Không thể tải danh sách phương thức thanh toán");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = paymentMethods.filter((payment) => {
    const matchesSearch =
      payment.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.Type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "All Method" || payment.Type === selectedType;

    const matchesStatus =
      selectedStatus === "All" || payment.Status === selectedStatus;

    // return matchesSearch && matchesType && matchesStatus;
    console.log(matchesSearch);

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: "Hoạt động", class: "badge-success" },
      inactive: { text: "Tạm dừng", class: "badge-secondary" },
      maintenance: { text: "Bảo trì", class: "badge-warning" },
      disabled: { text: "Vô hiệu hóa", class: "badge-danger" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      class: "badge-secondary",
    };
    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
    );
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      e_wallet: { text: "E Wallet", class: "badge-primary" },
      card: { text: "Card", class: "badge-info" },
      bank_transfer: { text: "Bank Transfer", class: "badge-success" },
      cod: { text: "COD", class: "badge-warning" },
      gateway: { text: "Gate Way", class: "badge-secondary" },
    };
    const typeInfo = typeMap[type] || { text: type, class: "badge-light" };
    return <span className={`badge ${typeInfo.class}`}>{typeInfo.text}</span>;
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleSetDefault = async (paymentId) => {
    if (window.confirm("Bạn có chắc chắn muốn đặt làm phương thức mặc định?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/setDefaultPaymentMethod/${paymentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Cập nhật phương thức mặc định thất bại");
        }

        // Refresh data after successful update
        await fetchPaymentMethods();
        console.log(`✅ Payment method ${paymentId} set as default`);
      } catch (err) {
        console.error("❌ Error setting default payment:", err);
        alert("Có lỗi xảy ra khi đặt phương thức mặc định");
      }
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa phương thức thanh toán này? Hành động này không thể hoàn tác."
      )
    ) {
      try {
        const response = await fetch(
          `http://localhost:5000/admin/deletePaymentMethod/${paymentId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Xóa phương thức thanh toán thất bại");
        }

        // Refresh data after successful deletion
        await fetchPaymentMethods();
        console.log(`✅ Payment method ${paymentId} deleted`);
      } catch (err) {
        console.error("❌ Error deleting payment method:", err);
        alert("Có lỗi xảy ra khi xóa phương thức thanh toán");
      }
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      const url = selectedPayment
        ? `http://localhost:5000/admin/updatePaymentMethod/${selectedPayment._id}`
        : "http://localhost:5000/admin/addPaymentMethod";

      const method = selectedPayment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error("Lưu phương thức thanh toán thất bại");
      }

      // Refresh data after successful save
      await fetchPaymentMethods();
      setShowPaymentModal(false);
      setSelectedPayment(null);
      console.log(
        `✅ Payment method ${
          selectedPayment ? "updated" : "created"
        } successfully`
      );
    } catch (err) {
      console.error("❌ Error saving payment method:", err);
      alert("Có lỗi xảy ra khi lưu phương thức thanh toán");
    }
  };

  if (loading) {
    return (
      <AdminLayout
        currentPage="payments"
        pageTitle="Quản lý phương thức thanh toán"
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        currentPage="payments"
        pageTitle="Quản lý phương thức thanh toán"
      >
        <div className="error-container">
          <div className="error-message">
            <i className="ti ti-alert-circle"></i>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchPaymentMethods}>
              Thử lại
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentPage="payments"
      pageTitle="Quản lý phương thức thanh toán"
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng phương thức</span>
            <i className="ti ti-credit-card stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{paymentMethods.length}</div>
            <div className="stat-change positive">
              {paymentMethods.filter((p) => p.Status === "Active").length} đang
              hoạt động
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng giao dịch</span>
            <i className="ti ti-receipt stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{orders.totalTransactions}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng giá trị</span>
            <i className="ti ti-currency-dollar stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {formatCurrency(orders.totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Table */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">
            <h3>Danh sách phương thức thanh toán</h3>
            <p>Quản lý tất cả phương thức thanh toán trong hệ thống</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowPaymentModal(true)}
          >
            <i className="ti ti-plus"></i>
            Thêm phương thức
          </button>
        </div>

        {/* Filters */}
        <div className="table-controls">
          <div className="filters-row">
            <div className="search-box">
              <i className="ti ti-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm phương thức thanh toán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {paymentTypes.map((type) => (
                <option key={type} value={type}>
                  {paymentTypeLabels[type]}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Tạm dừng</option>
              <option value="Maintenance">Bảo trì</option>
              <option value="Disabled">Vô hiệu hóa</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Phương thức</th>
                <th>Loại</th>
                <th>Trạng thái</th>

                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="empty-state">
                      <i className="ti ti-credit-card-off"></i>
                      <p>Không tìm thấy phương thức thanh toán nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id || payment._id}>
                    <td>
                      <div className="payment-info">
                        <div className="payment-details">
                          <div className="payment-name">{payment.Name}</div>
                          <div className="payment-provider">
                            {payment.Provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getTypeBadge(payment.Type)}{" "}
                      {payment.Default && (
                        <span className="default-badge">Mặc định</span>
                      )}
                    </td>

                    <td>{getStatusBadge(payment.Status)}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewPayment(payment)}
                          title="Xem chi tiết"
                        >
                          <i className="ti ti-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditPayment(payment)}
                          title="Chỉnh sửa"
                        >
                          <i className="ti ti-edit"></i>
                        </button>

                        {!payment.isDefault && (
                          <button
                            className="btn-action btn-star"
                            onClick={() =>
                              handleSetDefault(payment.id || payment._id)
                            }
                            title="Đặt làm mặc định"
                          >
                            <i className="ti ti-star"></i>
                          </button>
                        )}
                        <button
                          className="btn-action btn-delete"
                          onClick={() =>
                            handleDeletePayment(payment.id || payment._id)
                          }
                          title="Xóa"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {selectedPayment
                  ? "Chỉnh sửa phương thức thanh toán"
                  : "Thêm phương thức thanh toán"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const paymentData = {
                    name: formData.get("name"),
                    type: formData.get("type"),
                    provider: formData.get("provider"),

                    status: formData.get("status"),
                    default: formData.get("isDefault") === "on",
                  };
                  console.log(formData);
                  handleSavePayment(paymentData);
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên phương thức</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      defaultValue={selectedPayment?.Name || ""}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại</label>
                    <select
                      name="type"
                      className="form-control"
                      defaultValue={selectedPayment?.Type || ""}
                      required
                    >
                      <option value="">Chọn loại</option>
                      <option value="e_wallet">Ví điện tử</option>
                      <option value="card">Thẻ tín dụng</option>
                      <option value="bank_transfer">Chuyển khoản</option>
                      <option value="cod">COD</option>
                      <option value="gateway">Cổng thanh toán</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nhà cung cấp</label>
                    <input
                      type="text"
                      name="provider"
                      className="form-control"
                      defaultValue={selectedPayment?.Provider || ""}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      name="status"
                      className="form-control"
                      defaultValue={selectedPayment?.Status || "active"}
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Tạm dừng</option>
                      <option value="Maintenance">Bảo trì</option>
                      <option value="Disabled">Vô hiệu hóa</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isDefault"
                        defaultChecked={selectedPayment?.isDefault || false}
                        style={{ marginRight: "0.5rem" }}
                      />
                      Đặt làm phương thức mặc định
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedPayment ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPaymentDetails && selectedPayment && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentDetails(false)}
        >
          <div
            className="modal-content payment-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chi tiết phương thức thanh toán</h3>
              <button
                className="modal-close"
                onClick={() => setShowPaymentDetails(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-details-content">
                <div className="payment-header">
                  <div className="payment-info-large">
                    <h4>
                      {selectedPayment.Name}
                      {selectedPayment.Default && (
                        <span className="default-badge">Mặc định</span>
                      )}
                    </h4>
                    <p>{selectedPayment.Provider}</p>
                    <div className="payment-type-large">
                      {getTypeBadge(selectedPayment.Type)}
                    </div>
                  </div>
                  <div className="payment-status-large">
                    {getStatusBadge(selectedPayment.Status)}
                  </div>
                </div>

                <div className="payment-stats">
                  <div className="stat-item">
                    <i className="ti ti-receipt"></i>
                    <div>
                      <span className="stat-label">Giao dịch</span>
                      <span className="stat-value">
                        {(
                          selectedPayment.totalTransactions || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="ti ti-currency-dollar"></i>
                    <div>
                      <span className="stat-label">Tổng giá trị</span>
                      <span className="stat-value">
                        {formatCurrency(selectedPayment.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="payment-config">
                  <h5>Thông tin cấu hình</h5>

                  <div className="config-item">
                    <i className="ti ti-calendar"></i>
                    <span>
                      Create At:{" "}
                      {selectedPayment.createdAt
                        ? new Date(
                            selectedPayment.createdAt
                          ).toLocaleDateString("vi-VN")
                        : "No Information..."}
                    </span>
                  </div>
                  <div className="config-item">
                    <i className="ti ti-clock"></i>
                    <span>
                      Last Update:{" "}
                      {selectedPayment.updatedAt
                        ? new Date(
                            selectedPayment.updatedAt
                          ).toLocaleDateString("vi-VN")
                        : "No update yet..."}
                    </span>
                  </div>
                </div>

                {selectedPayment.config && (
                  <div className="payment-technical">
                    <h5>Thông tin kỹ thuật</h5>
                    <div className="technical-info">
                      {Object.entries(selectedPayment.config).map(
                        ([key, value]) => (
                          <div key={key} className="tech-item">
                            <span className="tech-key">{key}:</span>
                            <span className="tech-value">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default PaymentManagement;
