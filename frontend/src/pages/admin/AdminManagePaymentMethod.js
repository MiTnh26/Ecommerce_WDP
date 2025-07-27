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
  const [orderData, setOrderData] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");

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
      setError("Could not load payment method list");
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
      setOrderData(data);
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching payment methods:", err);
      setError("Could not load payment method list");
      setOrderData({});
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = paymentMethods.filter((payment) => {
    const normalize = (str) => (str || "").toLowerCase().replace(/\s+/g, "");
    const search = normalize(searchTerm);
    const name = normalize(payment.Name);
    const type = normalize(payment.Type);

    const matchesSearch =
      name.includes(search) || type.includes(search);

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
      active: { text: "Active", class: "badge-success" },
      inactive: { text: "Inactive", class: "badge-secondary" },
      maintenance: { text: "Maintenance", class: "badge-warning" },
      disabled: { text: "Disabled", class: "badge-danger" },
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
    if (window.confirm("Are you sure you want to set this as the default payment method?")) {
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
          throw new Error("Failed to update default payment method");
        }

        // Refresh data after successful update
        await fetchPaymentMethods();
        // Ensure only one default in UI
        setPaymentMethods((prev) =>
          prev.map((pm) => ({
            ...pm,
            Default: (pm._id || pm.id) === paymentId,
            isDefault: (pm._id || pm.id) === paymentId,
          }))
        );
        console.log(`✅ Payment method ${paymentId} set as default`);
      } catch (err) {
        console.error("❌ Error setting default payment:", err);
        alert("An error occurred while setting default payment method");
      }
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this payment method? This action cannot be undone."
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
          throw new Error("Failed to delete payment method");
        }

        // Refresh data after successful deletion
        await fetchPaymentMethods();
        console.log(`✅ Payment method ${paymentId} deleted`);
      } catch (err) {
        console.error("❌ Error deleting payment method:", err);
        alert("An error occurred while deleting payment method");
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
        throw new Error("Failed to save payment method");
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
      alert("An error occurred while saving payment method");
    }
  };

  // Trước khi mở modal, nếu là thêm mới (selectedPayment == null), reset form về giá trị mặc định
  const handleOpenPaymentModal = (payment = null) => {
    setSelectedPayment(payment);
    setFormError(""); // Reset error when opening modal
    setTimeout(() => {
      if (!payment) {
        const form = document.querySelector('.modal-content form');
        if (form) {
          form.reset();
        }
      }
    }, 0);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <AdminLayout
        currentPage="payments"
        pageTitle="Manage Payment Methods"
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        currentPage="payments"
        pageTitle="Manage Payment Methods"
      >
        <div className="error-container">
          <div className="error-message">
            <i className="ti ti-alert-circle"></i>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchPaymentMethods}>
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      currentPage="payments"
      pageTitle="Manage Payment Methods"
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Payment Methods</span>
            <i className="ti ti-credit-card stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{paymentMethods.length}</div>
            <div className="stat-change positive">
              {paymentMethods.filter((p) => p.Status === "Active").length} active
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Transactions</span>
            <i className="ti ti-receipt stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{orderData.totalTransactions}</div>
            <div className="stat-sub">Total: {orderData.totalTransactions}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Value</span>
            <i className="ti ti-currency-dollar stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {formatCurrency(orderData.totalAmount || 0)}
            </div>
            <div className="stat-sub">Total: {formatCurrency(orderData.totalAmount || 0)}</div>
          </div>
        </div>
      </div>

      {/* Payment Methods Table */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">
            <h3>Payment Method List</h3>
            <p>Manage all payment methods in the system</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleOpenPaymentModal()}
          >
            <i className="ti ti-plus"></i>
            Add Payment Method
          </button>
        </div>

        {/* Filters */}
        <div className="table-controls">
          <div className="filters-row">
            <div className="search-box">
              <i className="ti ti-search"></i>
              <input
                type="text"
                placeholder="Search payment methods..."
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
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Type</th>
                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="empty-state">
                      <i className="ti ti-credit-card-off"></i>
                      <p>No payment methods found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => {
                  // Tìm thống kê cho payment method này
                  const stat = (orderData.paymentStats || []).find(
                    s => s.paymentId === (payment._id || payment.id)
                  );
                  return (
                    <tr key={payment.id || payment._id}>
                      <td>
                        <div className="payment-info">
                          <div className="payment-details">
                            <div className="payment-name">{payment.Name}</div>
                            <div className="payment-provider">{payment.Provider}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {getTypeBadge(payment.Type)}{" "}
                        {payment.Default && (
                          <span className="default-badge">Default</span>
                        )}
                      </td>

                      <td>{getStatusBadge(payment.Status)}</td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => handleViewPayment(payment)}
                            title="View Details"
                          >
                            <i className="ti ti-eye"></i>
                          </button>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEditPayment(payment)}
                            title="Edit"
                          >
                            <i className="ti ti-edit"></i>
                          </button>

                          {!payment.Default && !payment.isDefault && (
                            <button
                              className="btn-action btn-star"
                              onClick={() =>
                                handleSetDefault(payment.id || payment._id)
                              }
                              title="Set as Default"
                            >
                              <i className="ti ti-star"></i>
                            </button>
                          )}
                          <button
                            className="btn-action btn-delete"
                            onClick={() =>
                              handleDeletePayment(payment.id || payment._id)
                            }
                            title="Delete"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                  ? "Edit Payment Method"
                  : "Add Payment Method"}
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
                  // Validate trùng tên hoặc provider khi tạo mới (chỉ check trong cùng loại type)
                  if (!selectedPayment) {
                    const nameExists = paymentMethods.some(
                      (pm) =>
                        pm.Type === paymentData.type &&
                        pm.Name?.trim().toLowerCase() === paymentData.name.trim().toLowerCase()
                    );
                    const providerExists = paymentMethods.some(
                      (pm) =>
                        pm.Type === paymentData.type &&
                        pm.Provider?.trim().toLowerCase() === paymentData.provider.trim().toLowerCase()
                    );
                    if (nameExists) {
                      setFormError("Payment method name already exists in this type!");
                      return;
                    }
                    if (providerExists) {
                      setFormError("Provider already exists in this type!");
                      return;
                    }
                  }
                  setFormError("");
                  handleSavePayment(paymentData);
                }}
              >
                {/* Hiển thị lỗi nếu có */}
                {formError && (
                  <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Method Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      defaultValue={selectedPayment?.Name || ""}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      name="type"
                      className="form-control"
                      defaultValue={selectedPayment?.Type || ""}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="e_wallet">E Wallet</option>
                      <option value="card">Credit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cod">COD</option>
                      <option value="gateway">Gateway</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Provider</label>
                    <input
                      type="text"
                      name="provider"
                      className="form-control"
                      defaultValue={selectedPayment?.Provider || ""}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      className="form-control"
                      defaultValue={selectedPayment?.Status || "active"}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={
                          selectedPayment
                            ? !!selectedPayment.Default || !!selectedPayment.isDefault
                            : paymentMethods.every((pm) => !pm.Default && !pm.isDefault)
                        }
                        onChange={() => {}}
                        style={{ marginRight: "0.5rem" }}
                        disabled
                      />
                      Set as Default Payment Method
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedPayment ? "Update" : "Add New"}
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
              <h3>Payment Method Details</h3>
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
                        <span className="default-badge">Default</span>
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

                {/* Thống kê giao dịch và giá trị cho payment method này */}
                {(() => {
                  const stat = (orderData.paymentStats || []).find(
                    s => s.paymentId === (selectedPayment._id || selectedPayment.id)
                  );
                  return (
                    <div className="payment-stats">
                      <div className="stat-item">
                        <i className="ti ti-receipt"></i>
                        <div>
                          <span className="stat-label">Transactions</span>
                          <span className="stat-value">
                            {stat ? stat.totalTransactions.toLocaleString() : 0}
                          </span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <i className="ti ti-currency-dollar"></i>
                        <div>
                          <span className="stat-label">Total Value</span>
                          <span className="stat-value">
                            {stat ? formatCurrency(stat.totalAmount) : formatCurrency(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="payment-config">
                  <h5>Configuration Details</h5>

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
                    <h5>Technical Details</h5>
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
