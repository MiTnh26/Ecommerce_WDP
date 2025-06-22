import { useState } from "react";
import "./checkout.css";

// Mock data for user addresses
const mockAddresses = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Phường Bến Nghé",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    fullAddress: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    isDefault: true,
    type: "home",
  },
  {
    id: 2,
    name: "Nguyễn Văn An",
    phone: "0901234567",
    address: "456 Lê Lợi, Phường 8",
    ward: "Phường 8",
    district: "Quận 3",
    city: "TP. Hồ Chí Minh",
    fullAddress: "456 Lê Lợi, Phường 8, Quận 3, TP. Hồ Chí Minh",
    isDefault: false,
    type: "office",
  },
  {
    id: 3,
    name: "Trần Thị Bình",
    phone: "0912345678",
    address: "789 Trần Hưng Đạo, Phường 1",
    ward: "Phường 1",
    district: "Quận 5",
    city: "TP. Hồ Chí Minh",
    fullAddress: "789 Trần Hưng Đạo, Phường 1, Quận 5, TP. Hồ Chí Minh",
    isDefault: false,
    type: "other",
  },
];

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: 1,
    name: "Ví MoMo",
    type: "e_wallet",
    provider: "MoMo",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 0,
    description: "Thanh toán nhanh chóng qua ví MoMo",
    isAvailable: true,
  },
  {
    id: 2,
    name: "ZaloPay",
    type: "e_wallet",
    provider: "ZaloPay",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 0,
    description: "Thanh toán tiện lợi qua ZaloPay",
    isAvailable: true,
  },
  {
    id: 3,
    name: "Thẻ tín dụng/ghi nợ",
    type: "card",
    provider: "Visa/Mastercard",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 0,
    description: "Thanh toán bằng thẻ tín dụng hoặc thẻ ghi nợ",
    isAvailable: true,
  },
  {
    id: 4,
    name: "Chuyển khoản ngân hàng",
    type: "bank_transfer",
    provider: "Banking",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 0,
    description: "Chuyển khoản qua ngân hàng",
    isAvailable: true,
  },
  {
    id: 5,
    name: "Thanh toán khi nhận hàng (COD)",
    type: "cod",
    provider: "COD",
    icon: "/placeholder.svg?height=40&width=40",
    fee: 15000,
    description: "Thanh toán bằng tiền mặt khi nhận hàng",
    isAvailable: true,
  },
];

// Mock data for cart items
const mockCartItems = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB",
    image: "/placeholder.svg?height=80&width=80",
    price: 29990000,
    quantity: 1,
    shop: "Tech Store VN",
    variant: "Titan Tự Nhiên",
  },
  {
    id: 2,
    name: "AirPods Pro 2nd Generation",
    image: "/placeholder.svg?height=80&width=80",
    price: 6490000,
    quantity: 2,
    shop: "Tech Store VN",
    variant: "Trắng",
  },
  {
    id: 3,
    name: "MacBook Air M2 13 inch",
    image: "/placeholder.svg?height=80&width=80",
    price: 27990000,
    quantity: 1,
    shop: "Apple Store Official",
    variant: "Midnight - 256GB",
  },
];

// Mock data for shipping options
const shippingOptions = [
  {
    id: 1,
    name: "Giao hàng tiêu chuẩn",
    description: "3-5 ngày làm việc",
    price: 30000,
    estimatedDays: "3-5",
  },
  {
    id: 2,
    name: "Giao hàng nhanh",
    description: "1-2 ngày làm việc",
    price: 50000,
    estimatedDays: "1-2",
  },
  {
    id: 3,
    name: "Giao hàng hỏa tốc",
    description: "Trong ngày (nội thành)",
    price: 80000,
    estimatedDays: "Trong ngày",
  },
];

function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(
    mockAddresses.find((addr) => addr.isDefault) || mockAddresses[0]
  );
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home":
        return "ti ti-home";
      case "office":
        return "ti ti-building";
      default:
        return "ti ti-map-pin";
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (type) {
      case "home":
        return "Nhà riêng";
      case "office":
        return "Văn phòng";
      default:
        return "Khác";
    }
  };

  // Calculate totals
  const subtotal = mockCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = selectedShipping.price;
  const paymentFee = selectedPayment?.fee || 0;
  const total = subtotal + shippingFee + paymentFee;

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      alert("Vui lòng chọn địa chỉ giao hàng và phương thức thanh toán");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
      setIsProcessing(false);
      // Redirect to order success page or order history
    }, 2000);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Thanh toán</h1>
        <div className="checkout-steps">
          <div className="step completed">
            <span className="step-number">1</span>
            <span className="step-label">Giỏ hàng</span>
          </div>
          <div className="step active">
            <span className="step-number">2</span>
            <span className="step-label">Thanh toán</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span className="step-label">Hoàn thành</span>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Delivery Address Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h3>
                <i className="ti ti-map-pin"></i>
                Địa chỉ giao hàng
              </h3>
              <button
                className="btn-change"
                onClick={() => setShowAddressModal(true)}
              >
                Thay đổi
              </button>
            </div>
            <div className="section-content">
              {selectedAddress ? (
                <div className="selected-address">
                  <div className="address-info">
                    <div className="address-header">
                      <span className="address-name">
                        {selectedAddress.name}
                      </span>
                      <span className="address-phone">
                        {selectedAddress.phone}
                      </span>
                      <span className={`address-type ${selectedAddress.type}`}>
                        <i
                          className={getAddressTypeIcon(selectedAddress.type)}
                        ></i>
                        {getAddressTypeLabel(selectedAddress.type)}
                      </span>
                      {selectedAddress.isDefault && (
                        <span className="default-badge">Mặc định</span>
                      )}
                    </div>
                    <div className="address-detail">
                      {selectedAddress.fullAddress}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-address">
                  <p>Chưa chọn địa chỉ giao hàng</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddressModal(true)}
                  >
                    Chọn địa chỉ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h3>
                <i className="ti ti-package"></i>
                Sản phẩm đã chọn
              </h3>
            </div>
            <div className="section-content">
              <div className="order-items">
                {mockCartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-info">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-variant">{item.variant}</p>
                      <p className="item-shop">Bán bởi: {item.shop}</p>
                    </div>
                    <div className="item-quantity">x{item.quantity}</div>
                    <div className="item-price">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Options Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h3>
                <i className="ti ti-truck"></i>
                Phương thức vận chuyển
              </h3>
            </div>
            <div className="section-content">
              <div className="shipping-options">
                {shippingOptions.map((option) => (
                  <label key={option.id} className="shipping-option">
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShipping.id === option.id}
                      onChange={() => setSelectedShipping(option)}
                    />
                    <div className="option-content">
                      <div className="option-info">
                        <span className="option-name">{option.name}</span>
                        <span className="option-description">
                          {option.description}
                        </span>
                      </div>
                      <div className="option-price">
                        {formatCurrency(option.price)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h3>
                <i className="ti ti-credit-card"></i>
                Phương thức thanh toán
              </h3>
              <button
                className="btn-change"
                onClick={() => setShowPaymentModal(true)}
              >
                Chọn
              </button>
            </div>
            <div className="section-content">
              {selectedPayment ? (
                <div className="selected-payment">
                  <img
                    src={selectedPayment.icon || "/placeholder.svg"}
                    alt={selectedPayment.name}
                    className="payment-icon"
                  />
                  <div className="payment-info">
                    <span className="payment-name">{selectedPayment.name}</span>
                    <span className="payment-description">
                      {selectedPayment.description}
                    </span>
                    {selectedPayment.fee > 0 && (
                      <span className="payment-fee">
                        Phí: {formatCurrency(selectedPayment.fee)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-payment">
                  <p>Chưa chọn phương thức thanh toán</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Chọn phương thức
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Note Section */}
          <div className="checkout-section">
            <div className="section-header">
              <h3>
                <i className="ti ti-note"></i>
                Ghi chú đơn hàng
              </h3>
            </div>
            <div className="section-content">
              <textarea
                className="order-note"
                placeholder="Ghi chú cho người bán (tùy chọn)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>Tóm tắt đơn hàng</h3>

            <div className="summary-row">
              <span>Tạm tính ({mockCartItems.length} sản phẩm)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>

            {paymentFee > 0 && (
              <div className="summary-row">
                <span>Phí thanh toán</span>
                <span>{formatCurrency(paymentFee)}</span>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <button
              className="btn-place-order"
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || !selectedPayment || isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="ti ti-loader spinning"></i>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="ti ti-check"></i>
                  Đặt hàng
                </>
              )}
            </button>

            <div className="security-info">
              <i className="ti ti-shield-check"></i>
              <span>Thông tin của bạn được bảo mật</span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
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
              <h3>Chọn địa chỉ giao hàng</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="address-list">
                {mockAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`address-item ${
                      selectedAddress?.id === address.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className="address-radio">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?.id === address.id}
                        readOnly
                      />
                    </div>
                    <div className="address-content">
                      <div className="address-header">
                        <span className="address-name">{address.name}</span>
                        <span className="address-phone">{address.phone}</span>
                        <span className={`address-type ${address.type}`}>
                          <i className={getAddressTypeIcon(address.type)}></i>
                          {getAddressTypeLabel(address.type)}
                        </span>
                        {address.isDefault && (
                          <span className="default-badge">Mặc định</span>
                        )}
                      </div>
                      <div className="address-detail">
                        {address.fullAddress}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline add-address-btn">
                <i className="ti ti-plus"></i>
                Thêm địa chỉ mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      {showPaymentModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="modal-content payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Chọn phương thức thanh toán</h3>
              <button
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-list">
                {mockPaymentMethods.map((payment) => (
                  <div
                    key={payment.id}
                    className={`payment-item ${
                      selectedPayment?.id === payment.id ? "selected" : ""
                    } ${!payment.isAvailable ? "disabled" : ""}`}
                    onClick={() =>
                      payment.isAvailable && handleSelectPayment(payment)
                    }
                  >
                    <div className="payment-radio">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment?.id === payment.id}
                        disabled={!payment.isAvailable}
                        readOnly
                      />
                    </div>
                    <img
                      src={payment.icon || "/placeholder.svg"}
                      alt={payment.name}
                      className="payment-icon"
                    />
                    <div className="payment-content">
                      <div className="payment-name">{payment.name}</div>
                      <div className="payment-description">
                        {payment.description}
                      </div>
                      {payment.fee > 0 && (
                        <div className="payment-fee">
                          Phí: {formatCurrency(payment.fee)}
                        </div>
                      )}
                    </div>
                    {!payment.isAvailable && (
                      <div className="payment-unavailable">Không khả dụng</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
