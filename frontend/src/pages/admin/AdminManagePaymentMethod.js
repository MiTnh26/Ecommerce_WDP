import { useState } from "react";
import "../../style/PaymentManagement.css";
import AdminLayout from "../../components/admin/AdminLayout";

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: 1,
    name: "Ví MoMo",
    type: "e_wallet",
    provider: "MoMo",
    status: "active",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 2.5,
    minAmount: 10000,
    maxAmount: 50000000,
    currency: "VND",
    isDefault: false,
    totalTransactions: 15420,
    totalAmount: 2450000000,
    successRate: 98.5,
    createdDate: "2024-01-15",
    lastUsed: "2024-12-21",
    config: {
      apiKey: "momo_api_key_***",
      secretKey: "momo_secret_***",
      environment: "production",
    },
  },
  {
    id: 2,
    name: "ZaloPay",
    type: "e_wallet",
    provider: "ZaloPay",
    status: "active",
    description: "Thanh toán qua ví điện tử ZaloPay",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 2.0,
    minAmount: 10000,
    maxAmount: 20000000,
    currency: "VND",
    isDefault: false,
    totalTransactions: 8950,
    totalAmount: 1230000000,
    successRate: 97.8,
    createdDate: "2024-02-01",
    lastUsed: "2024-12-21",
    config: {
      apiKey: "zalo_api_key_***",
      secretKey: "zalo_secret_***",
      environment: "production",
    },
  },
  {
    id: 3,
    name: "Thẻ tín dụng/ghi nợ",
    type: "card",
    provider: "Visa/Mastercard",
    status: "active",
    description: "Thanh toán bằng thẻ tín dụng hoặc thẻ ghi nợ",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 3.0,
    minAmount: 50000,
    maxAmount: 100000000,
    currency: "VND",
    isDefault: true,
    totalTransactions: 25680,
    totalAmount: 5670000000,
    successRate: 96.2,
    createdDate: "2024-01-01",
    lastUsed: "2024-12-21",
    config: {
      merchantId: "merchant_***",
      publicKey: "public_key_***",
      environment: "production",
    },
  },
  {
    id: 4,
    name: "Chuyển khoản ngân hàng",
    type: "bank_transfer",
    provider: "Vietcombank",
    status: "active",
    description: "Chuyển khoản trực tiếp qua ngân hàng",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 0,
    minAmount: 100000,
    maxAmount: 500000000,
    currency: "VND",
    isDefault: false,
    totalTransactions: 3420,
    totalAmount: 1890000000,
    successRate: 99.1,
    createdDate: "2024-01-10",
    lastUsed: "2024-12-20",
    config: {
      bankCode: "VCB",
      accountNumber: "1234567890",
      accountName: "CONG TY ABC",
    },
  },
  {
    id: 5,
    name: "Thanh toán khi nhận hàng",
    type: "cod",
    provider: "COD",
    status: "active",
    description: "Thanh toán tiền mặt khi nhận hàng",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 1.5,
    minAmount: 0,
    maxAmount: 5000000,
    currency: "VND",
    isDefault: false,
    totalTransactions: 12340,
    totalAmount: 890000000,
    successRate: 94.5,
    createdDate: "2024-01-01",
    lastUsed: "2024-12-21",
    config: {
      maxDistance: 50,
      supportedAreas: ["TP.HCM", "Hà Nội", "Đà Nẵng"],
    },
  },
  {
    id: 6,
    name: "VNPay",
    type: "gateway",
    provider: "VNPay",
    status: "maintenance",
    description: "Cổng thanh toán VNPay",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 2.2,
    minAmount: 10000,
    maxAmount: 100000000,
    currency: "VND",
    isDefault: false,
    totalTransactions: 18750,
    totalAmount: 3450000000,
    successRate: 97.5,
    createdDate: "2024-01-20",
    lastUsed: "2024-12-19",
    config: {
      tmnCode: "vnpay_tmn_***",
      hashSecret: "vnpay_hash_***",
      environment: "production",
    },
  },
];

const paymentTypes = [
  "Tất cả",
  "e_wallet",
  "card",
  "bank_transfer",
  "cod",
  "gateway",
];
const paymentTypeLabels = {
  "Tất cả": "Tất cả",
  e_wallet: "Ví điện tử",
  card: "Thẻ tín dụng",
  bank_transfer: "Chuyển khoản",
  cod: "COD",
  gateway: "Cổng thanh toán",
};

function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  const filteredPayments = mockPaymentMethods.filter((payment) => {
    const matchesSearch =
      payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "Tất cả" || payment.type === selectedType;

    const matchesStatus =
      selectedStatus === "all" || payment.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
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
      e_wallet: { text: "Ví điện tử", class: "badge-primary" },
      card: { text: "Thẻ tín dụng", class: "badge-info" },
      bank_transfer: { text: "Chuyển khoản", class: "badge-success" },
      cod: { text: "COD", class: "badge-warning" },
      gateway: { text: "Cổng thanh toán", class: "badge-secondary" },
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

  const handleToggleStatus = (paymentId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "kích hoạt" : "tạm dừng";
    if (
      window.confirm(
        `Bạn có chắc chắn muốn ${action} phương thức thanh toán này?`
      )
    ) {
      console.log(`Toggling payment ${paymentId} to ${newStatus}`);
    }
  };

  const handleSetDefault = (paymentId) => {
    if (window.confirm("Bạn có chắc chắn muốn đặt làm phương thức mặc định?")) {
      console.log("Setting default payment:", paymentId);
    }
  };

  const handleDeletePayment = (paymentId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa phương thức thanh toán này? Hành động này không thể hoàn tác."
      )
    ) {
      console.log("Deleting payment:", paymentId);
    }
  };

  const totalTransactions = mockPaymentMethods.reduce(
    (sum, p) => sum + p.totalTransactions,
    0
  );
  const totalAmount = mockPaymentMethods.reduce(
    (sum, p) => sum + p.totalAmount,
    0
  );
  const averageSuccessRate =
    mockPaymentMethods.reduce((sum, p) => sum + p.successRate, 0) /
    mockPaymentMethods.length;

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
            <div className="stat-number">{mockPaymentMethods.length}</div>
            <div className="stat-change positive">
              {mockPaymentMethods.filter((p) => p.status === "active").length}{" "}
              đang hoạt động
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng giao dịch</span>
            <i className="ti ti-receipt stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {totalTransactions.toLocaleString()}
            </div>
            <div className="stat-change positive">+12% so với tháng trước</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng giá trị</span>
            <i className="ti ti-currency-dollar stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(totalAmount)}</div>
            <div className="stat-change positive">+18% so với tháng trước</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tỷ lệ thành công</span>
            <i className="ti ti-check stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{averageSuccessRate.toFixed(1)}%</div>
            <div className="stat-change positive">Trung bình tất cả</div>
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
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
              <option value="maintenance">Bảo trì</option>
              <option value="disabled">Vô hiệu hóa</option>
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
                <th>Phí (%)</th>
                <th>Giới hạn</th>
                <th>Giao dịch</th>
                <th>Tỷ lệ thành công</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <div className="payment-info">
                      <img
                        src={payment.icon || "/placeholder.svg"}
                        alt={payment.name}
                        className="payment-icon"
                      />
                      <div className="payment-details">
                        <div className="payment-name">
                          {payment.name}
                          {payment.isDefault && (
                            <span className="default-badge">Mặc định</span>
                          )}
                        </div>
                        <div className="payment-provider">
                          {payment.provider}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{getTypeBadge(payment.type)}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>
                    <span className="fee-amount">{payment.fee}%</span>
                  </td>
                  <td>
                    <div className="limit-info">
                      <div className="min-amount">
                        Min: {formatCurrency(payment.minAmount)}
                      </div>
                      <div className="max-amount">
                        Max: {formatCurrency(payment.maxAmount)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="transaction-info">
                      <div className="transaction-count">
                        {payment.totalTransactions.toLocaleString()}
                      </div>
                      <div className="transaction-amount">
                        {formatCurrency(payment.totalAmount)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="success-rate">
                      <span
                        className={`rate-value ${
                          payment.successRate >= 95
                            ? "high"
                            : payment.successRate >= 90
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {payment.successRate}%
                      </span>
                    </div>
                  </td>
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
                      <button
                        className={`btn-action ${
                          payment.status === "active" ? "btn-pause" : "btn-play"
                        }`}
                        onClick={() =>
                          handleToggleStatus(payment.id, payment.status)
                        }
                        title={
                          payment.status === "active" ? "Tạm dừng" : "Kích hoạt"
                        }
                      >
                        <i
                          className={`ti ${
                            payment.status === "active" ? "ti-pause" : "ti-play"
                          }`}
                        ></i>
                      </button>
                      {!payment.isDefault && (
                        <button
                          className="btn-action btn-star"
                          onClick={() => handleSetDefault(payment.id)}
                          title="Đặt làm mặc định"
                        >
                          <i className="ti ti-star"></i>
                        </button>
                      )}
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDeletePayment(payment.id)}
                        title="Xóa"
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
              <form>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên phương thức</label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={selectedPayment?.name || ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại</label>
                    <select
                      className="form-control"
                      defaultValue={selectedPayment?.type || ""}
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
                      className="form-control"
                      defaultValue={selectedPayment?.provider || ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phí giao dịch (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      defaultValue={selectedPayment?.fee || ""}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    defaultValue={selectedPayment?.description || ""}
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số tiền tối thiểu</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={selectedPayment?.minAmount || ""}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số tiền tối đa</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={selectedPayment?.maxAmount || ""}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      className="form-control"
                      defaultValue={selectedPayment?.status || "active"}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm dừng</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="disabled">Vô hiệu hóa</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        defaultChecked={selectedPayment?.isDefault || false}
                        style={{ marginRight: "0.5rem" }}
                      />
                      Đặt làm phương thức mặc định
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Hủy
              </button>
              <button className="btn btn-primary">
                {selectedPayment ? "Cập nhật" : "Thêm mới"}
              </button>
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
                  <img
                    src={selectedPayment.icon || "/placeholder.svg"}
                    alt={selectedPayment.name}
                    className="payment-icon-large"
                  />
                  <div className="payment-info-large">
                    <h4>
                      {selectedPayment.name}
                      {selectedPayment.isDefault && (
                        <span className="default-badge">Mặc định</span>
                      )}
                    </h4>
                    <p>{selectedPayment.provider}</p>
                    <div className="payment-type-large">
                      {getTypeBadge(selectedPayment.type)}
                    </div>
                  </div>
                  <div className="payment-status-large">
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>

                <div className="payment-stats">
                  <div className="stat-item">
                    <i className="ti ti-receipt"></i>
                    <div>
                      <span className="stat-value">
                        {selectedPayment.totalTransactions.toLocaleString()}
                      </span>
                      <span className="stat-label">Giao dịch</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="ti ti-currency-dollar"></i>
                    <div>
                      <span className="stat-value">
                        {formatCurrency(selectedPayment.totalAmount)}
                      </span>
                      <span className="stat-label">Tổng giá trị</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="ti ti-percentage"></i>
                    <div>
                      <span className="stat-value">
                        {selectedPayment.successRate}%
                      </span>
                      <span className="stat-label">Tỷ lệ thành công</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <i className="ti ti-coins"></i>
                    <div>
                      <span className="stat-value">{selectedPayment.fee}%</span>
                      <span className="stat-label">Phí giao dịch</span>
                    </div>
                  </div>
                </div>

                <div className="payment-config">
                  <h5>Thông tin cấu hình</h5>
                  <div className="config-item">
                    <i className="ti ti-info-circle"></i>
                    <span>{selectedPayment.description}</span>
                  </div>
                  <div className="config-item">
                    <i className="ti ti-currency-dollar"></i>
                    <span>
                      Giới hạn: {formatCurrency(selectedPayment.minAmount)} -{" "}
                      {formatCurrency(selectedPayment.maxAmount)}
                    </span>
                  </div>
                  <div className="config-item">
                    <i className="ti ti-calendar"></i>
                    <span>Tạo: {selectedPayment.createdDate}</span>
                  </div>
                  <div className="config-item">
                    <i className="ti ti-clock"></i>
                    <span>Sử dụng cuối: {selectedPayment.lastUsed}</span>
                  </div>
                </div>

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
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default PaymentManagement;
