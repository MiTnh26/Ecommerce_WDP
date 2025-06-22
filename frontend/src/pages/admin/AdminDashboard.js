import "../../style/AdminDashBoard.css";
import AdminLayout from "../../components/admin/AdminLayout";

// Mock data for dashboard
const dashboardStats = {
  overview: {
    totalUsers: 1234,
    totalOrders: 856,
    totalRevenue: 125000000,
    totalProducts: 342,
    userGrowth: 12,
    orderGrowth: 8,
    revenueGrowth: 15,
    productGrowth: 5,
  },
  monthlyRevenue: [
    { month: "T1", revenue: 8500000, orders: 120 },
    { month: "T2", revenue: 9200000, orders: 135 },
    { month: "T3", revenue: 10100000, orders: 148 },
    { month: "T4", revenue: 11500000, orders: 162 },
    { month: "T5", revenue: 12800000, orders: 178 },
    { month: "T6", revenue: 13200000, orders: 185 },
    { month: "T7", revenue: 14100000, orders: 195 },
    { month: "T8", revenue: 13800000, orders: 188 },
    { month: "T9", revenue: 15200000, orders: 210 },
    { month: "T10", revenue: 16100000, orders: 225 },
    { month: "T11", revenue: 17500000, orders: 240 },
    { month: "T12", revenue: 18200000, orders: 255 },
  ],
  topProducts: [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      category: "Điện thoại",
      sold: 245,
      revenue: 61250000,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      category: "Điện thoại",
      sold: 198,
      revenue: 49500000,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 3,
      name: "MacBook Pro M3",
      category: "Laptop",
      sold: 156,
      revenue: 78000000,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 4,
      name: "AirPods Pro 2",
      category: "Phụ kiện",
      sold: 324,
      revenue: 16200000,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: 5,
      name: "iPad Air M2",
      category: "Tablet",
      sold: 187,
      revenue: 28050000,
      image: "/placeholder.svg?height=50&width=50",
    },
  ],
};

function AdminDashboard() {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const maxRevenue = Math.max(
    ...dashboardStats.monthlyRevenue.map((item) => item.revenue)
  );

  return (
    <AdminLayout currentPage="dashboard" pageTitle="Dashboard">
      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng người dùng</span>
            <i className="ti ti-users stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {dashboardStats.overview.totalUsers.toLocaleString()}
            </div>
            <div className="stat-change positive">
              +{dashboardStats.overview.userGrowth}% so với tháng trước
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng đơn hàng</span>
            <i className="ti ti-shopping-cart stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {dashboardStats.overview.totalOrders.toLocaleString()}
            </div>
            <div className="stat-change positive">
              +{dashboardStats.overview.orderGrowth}% so với tháng trước
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng doanh thu</span>
            <i className="ti ti-currency-dollar stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {formatCurrency(dashboardStats.overview.totalRevenue)}
            </div>
            <div className="stat-change positive">
              +{dashboardStats.overview.revenueGrowth}% so với tháng trước
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Tổng sản phẩm</span>
            <i className="ti ti-package stat-icon"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {dashboardStats.overview.totalProducts.toLocaleString()}
            </div>
            <div className="stat-change positive">
              +{dashboardStats.overview.productGrowth}% so với tháng trước
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="dashboard-row">
        {/* Monthly Revenue Chart */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Doanh thu theo tháng</h3>
            <p>Biểu đồ doanh thu 12 tháng gần nhất</p>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {dashboardStats.monthlyRevenue.map((item, index) => (
                <div key={index} className="chart-bar-group">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(item.revenue / maxRevenue) * 200}px`,
                    }}
                    title={`${item.month}: ${formatCurrency(item.revenue)}`}
                  ></div>
                  <span className="chart-label">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color"></span>
                <span>Doanh thu (VNĐ)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="table-card">
          <div className="card-header">
            <h3>Sản phẩm bán chạy</h3>
            <p>Top 5 sản phẩm có doanh thu cao nhất</p>
          </div>
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {dashboardStats.topProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-info">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="product-image"
                        />
                        <div className="product-details">
                          <div className="product-name">{product.name}</div>
                          <div className="product-category">
                            {product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="sold-count">{product.sold}</span>
                    </td>
                    <td>
                      <span className="revenue-amount">
                        {formatCurrency(product.revenue)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
