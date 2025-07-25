import { useState } from "react";
import "../../style/Analytics.css";
import AdminLayout from "../../components/admin/AdminLayout";

// Mock data for analytics
const analyticsData = {
  overview: {
    totalRevenue: 2450000000,
    totalOrders: 15420,
    totalUsers: 8950,
    totalProducts: 1250,
    revenueGrowth: 15.2,
    ordersGrowth: 8.7,
    usersGrowth: 12.3,
    productsGrowth: 5.1,
  },
  revenueByMonth: [
    { month: "T1", revenue: 180000000, orders: 1200, users: 450 },
    { month: "T2", revenue: 195000000, orders: 1350, users: 520 },
    { month: "T3", revenue: 210000000, orders: 1480, users: 580 },
    { month: "T4", revenue: 225000000, orders: 1620, users: 640 },
    { month: "T5", revenue: 240000000, orders: 1780, users: 720 },
    { month: "T6", revenue: 255000000, orders: 1850, users: 780 },
    { month: "T7", revenue: 270000000, orders: 1950, users: 850 },
    { month: "T8", revenue: 285000000, orders: 2100, users: 920 },
    { month: "T9", revenue: 300000000, orders: 2250, users: 980 },
    { month: "T10", revenue: 315000000, orders: 2400, users: 1050 },
    { month: "T11", revenue: 330000000, orders: 2550, users: 1120 },
    { month: "T12", revenue: 345000000, orders: 2700, users: 1200 },
  ],
  topCategories: [
    { name: "Điện tử", revenue: 850000000, orders: 4200, percentage: 34.7 },
    { name: "Thời trang", revenue: 620000000, orders: 3800, percentage: 25.3 },
    { name: "Gia dụng", revenue: 480000000, orders: 2900, percentage: 19.6 },
    { name: "Sách", revenue: 320000000, orders: 2100, percentage: 13.1 },
    { name: "Thể thao", revenue: 180000000, orders: 1200, percentage: 7.3 },
  ],
  userActivity: [
    { day: "CN", active: 1200, new: 45, returning: 890 },
    { day: "T2", active: 1850, new: 78, returning: 1320 },
    { day: "T3", active: 1950, new: 82, returning: 1420 },
    { day: "T4", active: 2100, new: 95, returning: 1580 },
    { day: "T5", active: 2250, new: 105, returning: 1680 },
    { day: "T6", active: 2400, new: 120, returning: 1780 },
    { day: "T7", active: 1650, new: 68, returning: 1150 },
  ],
  topProducts: [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      category: "Điện tử",
      revenue: 125000000,
      sold: 500,
      views: 15420,
      conversionRate: 3.24,
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      category: "Điện tử",
      revenue: 98000000,
      sold: 420,
      views: 12850,
      conversionRate: 3.27,
    },
    {
      id: 3,
      name: "MacBook Pro M3",
      category: "Điện tử",
      revenue: 156000000,
      sold: 320,
      views: 9850,
      conversionRate: 3.25,
    },
    {
      id: 4,
      name: "Nike Air Max",
      category: "Thể thao",
      revenue: 45000000,
      sold: 850,
      views: 25420,
      conversionRate: 3.34,
    },
    {
      id: 5,
      name: "Áo sơ mi nam",
      category: "Thời trang",
      revenue: 28000000,
      sold: 1200,
      views: 35680,
      conversionRate: 3.36,
    },
  ],
  salesByRegion: [
    {
      region: "TP. Hồ Chí Minh",
      revenue: 980000000,
      orders: 6200,
      percentage: 40.0,
    },
    { region: "Hà Nội", revenue: 735000000, orders: 4650, percentage: 30.0 },
    { region: "Đà Nẵng", revenue: 245000000, orders: 1550, percentage: 10.0 },
    { region: "Cần Thơ", revenue: 196000000, orders: 1240, percentage: 8.0 },
    { region: "Khác", revenue: 294000000, orders: 1780, percentage: 12.0 },
  ],
  conversionFunnel: [
    { stage: "Lượt truy cập", count: 125000, percentage: 100 },
    { stage: "Xem sản phẩm", count: 45000, percentage: 36 },
    { stage: "Thêm vào giỏ", count: 18000, percentage: 14.4 },
    { stage: "Bắt đầu thanh toán", count: 12000, percentage: 9.6 },
    { stage: "Hoàn thành đơn hàng", count: 8500, percentage: 6.8 },
  ],
};

function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("vi-VN").format(number);
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? "ti ti-trending-up" : "ti ti-trending-down";
  };

  const getGrowthClass = (growth) => {
    return growth >= 0 ? "positive" : "negative";
  };

  const maxRevenue = Math.max(
    ...analyticsData.revenueByMonth.map((item) => item.revenue)
  );
  const maxActivity = Math.max(
    ...analyticsData.userActivity.map((item) => item.active)
  );

  return (
    <AdminLayout currentPage="analytics" pageTitle="Thống kê & Báo cáo">
      {/* Period Filter */}
      <div className="analytics-filters">
        <div className="filter-group">
          <label>Thời gian:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">12 tháng qua</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Chỉ số:</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="revenue">Doanh thu</option>
            <option value="orders">Đơn hàng</option>
            <option value="users">Người dùng</option>
            <option value="products">Sản phẩm</option>
          </select>
        </div>
        <button className="btn btn-primary">
          <i className="ti ti-download"></i>
          Xuất báo cáo
        </button>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-title">Tổng doanh thu</span>
              <span className="stat-number">
                {formatCurrency(analyticsData.overview.totalRevenue)}
              </span>
            </div>
            <div className="stat-icon revenue">
              <i className="ti ti-currency-dollar"></i>
            </div>
          </div>
          <div className="stat-footer">
            <span
              className={`stat-change ${getGrowthClass(
                analyticsData.overview.revenueGrowth
              )}`}
            >
              <i
                className={getGrowthIcon(analyticsData.overview.revenueGrowth)}
              ></i>
              {Math.abs(analyticsData.overview.revenueGrowth)}% so với tháng
              trước
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-title">Tổng đơn hàng</span>
              <span className="stat-number">
                {formatNumber(analyticsData.overview.totalOrders)}
              </span>
            </div>
            <div className="stat-icon orders">
              <i className="ti ti-shopping-cart"></i>
            </div>
          </div>
          <div className="stat-footer">
            <span
              className={`stat-change ${getGrowthClass(
                analyticsData.overview.ordersGrowth
              )}`}
            >
              <i
                className={getGrowthIcon(analyticsData.overview.ordersGrowth)}
              ></i>
              {Math.abs(analyticsData.overview.ordersGrowth)}% so với tháng
              trước
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-title">Tổng người dùng</span>
              <span className="stat-number">
                {formatNumber(analyticsData.overview.totalUsers)}
              </span>
            </div>
            <div className="stat-icon users">
              <i className="ti ti-users"></i>
            </div>
          </div>
          <div className="stat-footer">
            <span
              className={`stat-change ${getGrowthClass(
                analyticsData.overview.usersGrowth
              )}`}
            >
              <i
                className={getGrowthIcon(analyticsData.overview.usersGrowth)}
              ></i>
              {Math.abs(analyticsData.overview.usersGrowth)}% so với tháng trước
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <span className="stat-title">Tổng sản phẩm</span>
              <span className="stat-number">
                {formatNumber(analyticsData.overview.totalProducts)}
              </span>
            </div>
            <div className="stat-icon products">
              <i className="ti ti-package"></i>
            </div>
          </div>
          <div className="stat-footer">
            <span
              className={`stat-change ${getGrowthClass(
                analyticsData.overview.productsGrowth
              )}`}
            >
              <i
                className={getGrowthIcon(analyticsData.overview.productsGrowth)}
              ></i>
              {Math.abs(analyticsData.overview.productsGrowth)}% so với tháng
              trước
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Doanh thu theo tháng</h3>
            <div className="chart-actions">
              <button className="chart-action active">Doanh thu</button>
              <button className="chart-action">Đơn hàng</button>
              <button className="chart-action">Người dùng</button>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-area">
              <div className="chart-bars">
                {analyticsData.revenueByMonth.map((item, index) => (
                  <div key={index} className="chart-bar-group">
                    <div
                      className="chart-bar revenue-bar"
                      style={{
                        height: `${(item.revenue / maxRevenue) * 200}px`,
                      }}
                      title={`${item.month}: ${formatCurrency(item.revenue)}`}
                    ></div>
                    <span className="chart-label">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-summary">
              <div className="summary-item">
                <span className="summary-label">Trung bình/tháng:</span>
                <span className="summary-value">
                  {formatCurrency(
                    analyticsData.revenueByMonth.reduce(
                      (sum, item) => sum + item.revenue,
                      0
                    ) / analyticsData.revenueByMonth.length
                  )}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tháng cao nhất:</span>
                <span className="summary-value">
                  T12 - {formatCurrency(345000000)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Hoạt động người dùng</h3>
            <span className="chart-subtitle">7 ngày qua</span>
          </div>
          <div className="chart-container">
            <div className="activity-chart">
              {analyticsData.userActivity.map((item, index) => (
                <div key={index} className="activity-bar-group">
                  <div className="activity-bars">
                    <div
                      className="activity-bar active"
                      style={{
                        height: `${(item.active / maxActivity) * 120}px`,
                      }}
                      title={`Hoạt động: ${item.active}`}
                    ></div>
                    <div
                      className="activity-bar new"
                      style={{
                        height: `${(item.new / maxActivity) * 120}px`,
                      }}
                      title={`Mới: ${item.new}`}
                    ></div>
                  </div>
                  <span className="activity-label">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="activity-legend">
              <div className="legend-item">
                <span className="legend-color active"></span>
                <span>Hoạt động</span>
              </div>
              <div className="legend-item">
                <span className="legend-color new"></span>
                <span>Người dùng mới</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Top Categories */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Danh mục bán chạy</h3>
            <span className="chart-subtitle">Theo doanh thu</span>
          </div>
          <div className="chart-container">
            <div className="categories-chart">
              {analyticsData.topCategories.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="category-revenue">
                      {formatCurrency(category.revenue)}
                    </span>
                  </div>
                  <div className="category-bar-container">
                    <div
                      className="category-bar"
                      style={{
                        width: `${category.percentage}%`,
                      }}
                    ></div>
                  </div>
                  <span className="category-percentage">
                    {category.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales by Region */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Doanh số theo khu vực</h3>
            <span className="chart-subtitle">Phân bố địa lý</span>
          </div>
          <div className="chart-container">
            <div className="regions-chart">
              {analyticsData.salesByRegion.map((region, index) => (
                <div key={index} className="region-item">
                  <div className="region-info">
                    <span className="region-name">{region.region}</span>
                    <span className="region-orders">
                      {formatNumber(region.orders)} đơn
                    </span>
                  </div>
                  <div className="region-revenue">
                    {formatCurrency(region.revenue)}
                  </div>
                  <div className="region-percentage">{region.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="charts-row">
        {/* Top Products Table */}
        <div className="chart-card large">
          <div className="chart-header">
            <h3>Sản phẩm bán chạy</h3>
            <div className="chart-actions">
              <button className="btn btn-outline btn-sm">
                <i className="ti ti-eye"></i>
                Xem tất cả
              </button>
            </div>
          </div>
          <div className="chart-container">
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Doanh thu</th>
                    <th>Đã bán</th>
                    <th>Lượt xem</th>
                    <th>Tỷ lệ chuyển đổi</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-info">
                          <span className="product-rank">#{index + 1}</span>
                          <span className="product-name">{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="product-category">
                          {product.category}
                        </span>
                      </td>
                      <td>
                        <span className="product-revenue">
                          {formatCurrency(product.revenue)}
                        </span>
                      </td>
                      <td>
                        <span className="product-sold">
                          {formatNumber(product.sold)}
                        </span>
                      </td>
                      <td>
                        <span className="product-views">
                          {formatNumber(product.views)}
                        </span>
                      </td>
                      <td>
                        <span className="product-conversion">
                          {product.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Phễu chuyển đổi</h3>
            <span className="chart-subtitle">Hành trình khách hàng</span>
          </div>
          <div className="chart-container">
            <div className="funnel-chart">
              {analyticsData.conversionFunnel.map((stage, index) => (
                <div key={index} className="funnel-stage">
                  <div className="funnel-bar-container">
                    <div
                      className="funnel-bar"
                      style={{
                        width: `${stage.percentage}%`,
                      }}
                    >
                      <span className="funnel-count">
                        {formatNumber(stage.count)}
                      </span>
                    </div>
                  </div>
                  <div className="funnel-info">
                    <span className="funnel-stage-name">{stage.stage}</span>
                    <span className="funnel-percentage">
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="funnel-summary">
              <div className="summary-metric">
                <span className="metric-label">Tỷ lệ chuyển đổi tổng:</span>
                <span className="metric-value">6.8%</span>
              </div>
              <div className="summary-metric">
                <span className="metric-label">Giá trị đơn hàng TB:</span>
                <span className="metric-value">{formatCurrency(288235)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Analytics;
