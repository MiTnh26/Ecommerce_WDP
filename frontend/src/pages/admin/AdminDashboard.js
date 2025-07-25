"use client";
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders, users, and products data simultaneously
      const [ordersResponse, usersResponse, productsResponse] =
        await Promise.all([
          fetch("http://localhost:5000/admin/getOrder"),
          fetch("http://localhost:5000/admin/getUser"),
          fetch("http://localhost:5000/admin/getProduct"),
        ]);

      if (!ordersResponse.ok) {
        throw new Error(`Orders API error! status: ${ordersResponse.status}`);
      }

      if (!usersResponse.ok) {
        throw new Error(`Users API error! status: ${usersResponse.status}`);
      }

      if (!productsResponse.ok) {
        throw new Error(
          `Products API error! status: ${productsResponse.status}`
        );
      }

      const ordersData = await ordersResponse.json();
      const usersData = await usersResponse.json();
      const productsData = await productsResponse.json();

      console.log("✅ Orders data fetched successfully:", ordersData);
      console.log("✅ Users data fetched successfully:", usersData);
      console.log("✅ Products data fetched successfully:", productsData);

      setOrders(ordersData);
      setUsers(usersData);
      setProducts(productsData);

      // Process all datasets to create dashboard statistics
      const processedData = processAllData(ordersData, usersData, productsData);
      setDashboardData(processedData);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processAllData = (ordersData, usersData, productsData) => {
    // Handle new API response structure
    const ordersArray = ordersData?.orders || [];
    const totalTransactions = ordersData?.totalTransactions || 0;
    const totalAmount = ordersData?.totalAmount || 0;
    if (!usersData || !Array.isArray(usersData)) {
      usersData = [];
    }
    if (!productsData || !Array.isArray(productsData)) {
      productsData = [];
    }
    console.log("📊 Processing data:", {
      totalTransactions,
      totalAmount,
      ordersCount: ordersArray.length,
      usersCount: usersData.length,
      productsCount: productsData.length,
    });
    // Calculate overview statistics
    const totalOrders = totalTransactions;
    const totalRevenueFromOrders = totalAmount;
    const totalUsers = usersData.length;
    const totalProducts = productsData.length;

    // Calculate user growth (compare users created in last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentUsers = usersData.filter((user) => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const previousUsers = usersData.filter((user) => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    const userGrowth =
      previousUsers > 0
        ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100)
        : 0;

    // Calculate product growth (compare products created in last 30 days vs previous 30 days)
    const recentProducts = productsData.filter((product) => {
      const createdAt = new Date(product.CreatedAt);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const previousProducts = productsData.filter((product) => {
      const createdAt = new Date(product.CreatedAt);
      return createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    const productGrowth =
      previousProducts > 0
        ? Math.round(
            ((recentProducts - previousProducts) / previousProducts) * 100
          )
        : 0;

    // Process top products directly from products API using Sales field
    const processTopProducts = () => {
      console.log("🔍 Processing top products from API data...");

      // Filter and sort products by Sales field (descending order)
      const topProducts = productsData
        .filter((product) => product.Sales && product.Sales > 0) // Only products with sales > 0
        .sort((a, b) => (b.Sales || 0) - (a.Sales || 0)) // Sort by Sales descending
        .slice(0, 5) // Get top 5
        .map((product, index) => {
          // Calculate total revenue from all active variants
          let totalRevenue = 0;
          let activeVariants = 0;
          let totalStock = 0;
          let averagePrice = 0;

          if (product.ProductVariant && Array.isArray(product.ProductVariant)) {
            let totalPrice = 0;
            let priceCount = 0;

            product.ProductVariant.forEach((variant) => {
  if (variant.Status === "Active") {
    activeVariants++;
    totalStock += variant.StockQuantity || 0;
    if (variant.Price) {
      totalPrice += variant.Price;
      priceCount++;
    }
  }
});

            // Calculate average price from active variants
            if (priceCount > 0) {
              averagePrice = totalPrice / priceCount;
              // Estimate revenue: Sales * Average Price
              totalRevenue = (product.Sales || 0) * averagePrice;
            }
          }

          // Get shop information
          const shopInfo = product.ShopId || {};
          const shopName = shopInfo.name || "Không rõ";
          const shopStatus = shopInfo.status || "Unknown";
          const shopAddress = shopInfo.address
            ? `${shopInfo.address.ward}, ${shopInfo.address.district}, ${shopInfo.address.province}`
            : "Không có địa chỉ";

          console.log(`📦 Product #${index + 1}: ${product.ProductName}`, {
            sales: product.Sales,
            revenue: totalRevenue,
            variants: activeVariants,
            stock: totalStock,
            shop: shopName,
            averagePrice: averagePrice,
          });

          return {
            id: product._id,
            name: product.ProductName || "Tên sản phẩm",
            image:
              product.ProductImage || "/placeholder.svg?height=40&width=40",
            sold: product.Sales || 0,
            revenue: totalRevenue,
            category: "General", // Could be enhanced with CategoryId lookup
            status: product.Status || "Active",
            variants: product.ProductVariant?.length || 0,
            activeVariants: activeVariants,
            totalStock: totalStock,
            description: product.Description || "",
            shop: {
              id: shopInfo._id || "",
              name: shopName,
              status: shopStatus,
              address: shopAddress,
              avatar:
                shopInfo.shopAvatar || "/placeholder.svg?height=30&width=30",
            },
            averagePrice: averagePrice,
            ranking: index + 1,
          };
        });

      console.log("🏆 Top products processed:", topProducts);
      return topProducts;
    };

    const topProducts = processTopProducts();

    // Calculate monthly revenue from delivered orders based on OrderDate
    const calculateMonthlyRevenue = () => {
      const now = new Date();
      const monthlyData = {};

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = `T${date.getMonth() + 1}`;

        monthlyData[monthKey] = {
          month: monthLabel,
          revenue: 0,
          orderCount: 0,
        };
      }

      console.log("📅 Monthly data initialized:", monthlyData);
      console.log("📦 Total orders to process:", ordersArray.length);

      // Process all orders (not just delivered for debugging)
      let deliveredCount = 0;
      let totalProcessed = 0;

      ordersArray.forEach((order, index) => {
        totalProcessed++;

        if (order.OrderDate) {
          const orderDate = new Date(order.OrderDate);
          const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;

          console.log(`📋 Order ${index + 1}:`, {
            id: order._id?.slice(-8),
            status: order.Status,
            date: order.OrderDate,
            amount: order.TotalAmount,
            monthKey: monthKey,
            isInRange: !!monthlyData[monthKey],
          });

          // Count delivered orders
          if (order.Status && order.Status.toLowerCase() === "delivered") {
            deliveredCount++;

            if (monthlyData[monthKey]) {
              monthlyData[monthKey].revenue += order.TotalAmount || 0;
              monthlyData[monthKey].orderCount += 1;
              console.log(`✅ Added to ${monthKey}:`, order.TotalAmount);
            }
          }
        } else {
          console.log(
            `❌ Order ${index + 1} missing OrderDate:`,
            order._id?.slice(-8)
          );
        }
      });

      console.log("📊 Processing summary:", {
        totalOrders: totalProcessed,
        deliveredOrders: deliveredCount,
        finalMonthlyData: monthlyData,
      });

      // If no delivered orders, show all orders for debugging
      if (deliveredCount === 0) {
        console.log(
          "⚠️ No delivered orders found, processing all orders for chart..."
        );

        ordersArray.forEach((order) => {
          if (order.OrderDate && order.TotalAmount) {
            const orderDate = new Date(order.OrderDate);
            const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;

            if (monthlyData[monthKey]) {
              monthlyData[monthKey].revenue += order.TotalAmount;
              monthlyData[monthKey].orderCount += 1;
            }
          }
        });
      }

      return Object.values(monthlyData);
    };

    const monthlyRevenue = calculateMonthlyRevenue();

    // Calculate total revenue from delivered orders only
    const totalRevenueDelivered = ordersArray
      .filter(
        (order) => order.Status && order.Status.toLowerCase() === "delivered"
      )
      .reduce((sum, order) => sum + (order.TotalAmount || 0), 0);

    // Get recent orders (last 5)
    const recentOrders = ordersArray
      .sort((a, b) => new Date(b.OrderDate) - new Date(a.OrderDate))
      .slice(0, 5)
      .map((order) => {
        // Find user info for this order
        const user = usersData.find((u) => u._id === order.BuyerId);
        const customerName = order.BuyerId
  ? `${order.BuyerId.FirstName || ""} ${order.BuyerId.LastName || ""}`.trim()
  : "N/A";

        // Get first product name from order
        let productName = "Sản phẩm";
        if (
          order.Items &&
          order.Items.Product &&
          Array.isArray(order.Items.Product) &&
          order.Items.Product[0]
        ) {
          productName = order.Items.Product[0].ProductName || "Sản phẩm";
        }

        return {
          id: order._id,
          orderId: order._id?.slice(-8).toUpperCase() || "N/A",
          customer: customerName,
          customerName: customerName,
          product: productName,
          productName: productName,
          amount: order.TotalAmount || 0,
          totalAmount: order.TotalAmount || 0,
          status: order.Status ? order.Status.toLowerCase() : "pending",
          date: order.OrderDate,
          createdAt: order.OrderDate,
          shippingAddress: order.ShippingAddress,
        };
      });

    // Calculate revenue growth (compare delivered orders in last 30 days vs previous 30 days)
    const recentRevenue = ordersArray
      .filter((order) => {
        if (!order.OrderDate) return false;
        const orderDate = new Date(order.OrderDate);
        const isRecent = orderDate >= thirtyDaysAgo;
        const isDelivered =
          order.Status && order.Status.toLowerCase() === "delivered";

        if (isRecent) {
          console.log("🔍 Recent order:", {
            id: order._id?.slice(-8),
            date: order.OrderDate,
            status: order.Status,
            amount: order.TotalAmount,
            isDelivered,
          });
        }

        return isDelivered && isRecent;
      })
      .reduce((sum, order) => sum + (order.TotalAmount || 0), 0);

    const previousRevenue = ordersArray
      .filter((order) => {
        if (!order.OrderDate) return false;
        const orderDate = new Date(order.OrderDate);
        const isInPreviousPeriod =
          orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
        const isDelivered =
          order.Status && order.Status.toLowerCase() === "delivered";
        return isDelivered && isInPreviousPeriod;
      })
      .reduce((sum, order) => sum + (order.TotalAmount || 0), 0);

    console.log("💰 Revenue calculation:", {
      recentRevenue,
      previousRevenue,
      thirtyDaysAgo: thirtyDaysAgo.toISOString(),
      sixtyDaysAgo: sixtyDaysAgo.toISOString(),
    });

    const revenueGrowth =
      previousRevenue > 0
        ? Math.round(
            ((recentRevenue - previousRevenue) / previousRevenue) * 100
          )
        : 0;

    return {
      overview: {
        totalUsers: totalUsers,
        totalOrders: totalOrders,
        totalRevenue: totalRevenueFromOrders,
        totalProducts: totalProducts,
        userGrowth: userGrowth,
        orderGrowth: 8, // Mock growth data for orders
        revenueGrowth: revenueGrowth,
        productGrowth: productGrowth,
      },
      monthlyRevenue,
      topProducts,
      recentOrders,
      productStats: {
        activeProducts: productsData.filter((p) => p.Status === "Active")
          .length,
        inactiveProducts: productsData.filter((p) => p.Status === "Inactive")
          .length,
        totalVariants: productsData.reduce(
          (sum, p) => sum + (p.ProductVariant?.length || 0),
          0
        ),
        totalSales: productsData.reduce((sum, p) => sum + (p.Sales || 0), 0),
      },
    };
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { text: "Hoàn thành", class: "bg-success" },
      processing: { text: "Đang xử lý", class: "bg-warning text-dark" },
      shipped: { text: "Đã giao", class: "bg-info text-dark" },
      cancelled: { text: "Đã hủy", class: "bg-danger" },
      pending: { text: "Chờ xử lý", class: "bg-warning text-dark" },
      delivered: { text: "Đã giao", class: "bg-success" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      class: "bg-secondary",
    };
    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
    );
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="dashboard" pageTitle="Dashboard">
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout currentPage="dashboard" pageTitle="Dashboard">
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
          <i className="bi bi-exclamation-triangle fs-2 text-danger"></i>
          <h3>Không thể tải dữ liệu dashboard</h3>
          <p className="text-danger">Lỗi: {error}</p>
          <button onClick={handleRetry} className="btn btn-primary">
            <i className="bi bi-arrow-clockwise me-2"></i>
            Thử lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!dashboardData) {
    return (
      <AdminLayout currentPage="dashboard" pageTitle="Dashboard">
        <div className="d-flex flex-column align-items-center justify-content-center p-5">
          <i className="bi bi-database-dash fs-2 text-secondary"></i>
          <p>Không có dữ liệu để hiển thị</p>
        </div>
      </AdminLayout>
    );
  }

  const { overview, monthlyRevenue, topProducts, recentOrders, productStats } =
    dashboardData;
  const maxRevenue =
    monthlyRevenue && monthlyRevenue.length > 0
      ? Math.max(...monthlyRevenue.map((item) => item.revenue || 0))
      : 1;

  return (
    <AdminLayout currentPage="dashboard" pageTitle="Dashboard">
      {/* Overview Stats */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3 mb-4">
        <div className="col">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title text-muted mb-0">Tổng người dùng</h6>
                <i className="bi bi-people fs-4 text-primary"></i>
              </div>
              <div className="h4 fw-bold text-dark mb-1">
                {(overview?.totalUsers || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title text-muted mb-0">Tổng đơn hàng</h6>
                <i className="bi bi-cart fs-4 text-success"></i>
              </div>
              <div className="h4 fw-bold text-dark mb-1">
                {(orders.totalTransactions || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title text-muted mb-0">Tổng doanh thu</h6>
                <i className="bi bi-currency-dollar fs-4 text-warning"></i>
              </div>
              <div className="h4 fw-bold text-dark mb-1">
                {formatCurrency(orders.totalAmount || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="card-title text-muted mb-0">Tổng sản phẩm</h6>
                <i className="bi bi-box fs-4 text-info"></i>
              </div>
              <div className="h4 fw-bold text-dark mb-1">
                {(overview?.totalProducts || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="row g-3 mb-4">
        {/* Monthly Revenue Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pb-0">
              <h5 className="card-title mb-1">Doanh thu theo tháng</h5>
              <p className="text-muted small mb-0">
                Biểu đồ doanh thu 6 tháng gần nhất
              </p>
            </div>
            <div className="card-body">
              {monthlyRevenue && monthlyRevenue.length > 0 ? (
                <div className="chart-container">
                  <div
                    className="d-flex align-items-end justify-content-between"
                    style={{ height: "400px" }}
                  >
                    {monthlyRevenue.map((item, index) => (
                      <div
                        key={index}
                        className="d-flex flex-column align-items-center flex-fill"
                      >
                        <div
                          className="bg-primary rounded-top"
                          style={{
                            width: "40px",
                            height: `${
                              ((item.revenue || 0) / maxRevenue) * 350
                            }px`,
                            minHeight: "10px",
                          }}
                          title={`${
                            item.month || `T${index + 1}`
                          }: ${formatCurrency(item.revenue || 0)}`}
                        ></div>
                        <span className="small text-muted mt-2">
                          {item.month || `T${index + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-center mt-3">
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary rounded me-2"
                        style={{ width: "12px", height: "12px" }}
                      ></div>
                      <span className="small text-muted">Doanh thu (VNĐ)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="text-center py-5"
                  style={{
                    height: "400px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <i className="bi bi-bar-chart-line fs-1 text-muted"></i>
                  <p className="text-muted mt-2">Không có dữ liệu doanh thu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 pb-0">
              <h5 className="card-title mb-1">Sản phẩm bán chạy</h5>
              <p className="text-muted small mb-0">
                Top 5 sản phẩm có lượt bán cao nhất
              </p>
            </div>
            <div className="card-body">
              {topProducts && topProducts.length > 0 ? (
                <div className="list-group list-group-flush">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.id || index}
                      className="list-group-item border-0 px-0 py-3"
                    >
                      <div className="d-flex align-items-start">
                        <div className="position-relative me-3">
                          <img
                            src={
                              product.image ||
                              "/placeholder.svg?height=50&width=50"
                            }
                            className="rounded"
                            width="50"
                            height="50"
                            style={{ objectFit: "cover" }}
                          />
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                            {product.ranking}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1">
                            {product.name || "Tên sản phẩm"}
                          </div>

                          {/* Shop Information
                          <div className="d-flex align-items-center mb-2">
                            <span className="small text-primary fw-medium">
                              {product.shop?.name || "Không rõ"}
                            </span>
                          </div> */}

                          {/* Sales and Variants Info */}
                          <div className="small text-muted mb-1">
                            <i className="bi bi-cart-check me-1"></i>
                            Đã bán:{" "}
                            <span className="fw-bold text-success">
                              {product.sold || 0}
                            </span>{" "}
                            lượt
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-box fs-1 text-muted"></i>
                  <p className="text-muted mt-2">
                    Không có dữ liệu sản phẩm bán chạy
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pb-0">
          <h5 className="card-title mb-1">Đơn hàng gần đây</h5>
          <p className="text-muted small mb-0">
            5 đơn hàng mới nhất trong hệ thống
          </p>
        </div>
        <div className="card-body">
          {recentOrders && recentOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th className="border-0">Mã đơn hàng</th>
                    <th className="border-0">Khách hàng</th>
                    <th className="border-0">Sản phẩm</th>
                    <th className="border-0">Số tiền</th>
                    <th className="border-0">Trạng thái</th>
                    <th className="border-0">Ngày đặt</th>
                    <th className="border-0">Địa chỉ giao hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={order.id || index}>
                      <td>
                        <span
                          className="fw-bold text-primary"
                          style={{ cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => handleOrderClick(order)}
                        >
                          #{order.orderId}
                        </span>
                      </td>
                      <td>
                        <span className="fw-medium">{order.customerName}</span>
                      </td>
                      <td>
                        <span
                          className="text-truncate"
                          style={{ maxWidth: "150px", display: "inline-block" }}
                        >
                          {order.productName}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <span className="text-muted">
                          {order.date
                            ? new Date(order.date).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-muted text-truncate"
                          style={{ maxWidth: "120px", display: "inline-block" }}
                        >
                          {order.shippingAddress || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-cart-x fs-1 text-muted"></i>
              <p className="text-muted mt-2">Không có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.4)" }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div className="modal-header" style={{ background: '#fff7ea', borderBottom: 'none' }}>
                <h5 className="modal-title" style={{ fontWeight: 700 }}>Chi tiết đơn hàng</h5>
                <button type="button" className="close" onClick={handleCloseOrderModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body" style={{ background: '#fff', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  {/* Avatar sản phẩm hoặc khách hàng nếu có */}
                  {selectedOrder.BuyerId?.Image && (
                    <img src={selectedOrder.BuyerId.Image} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 20 }}>#{selectedOrder.orderId}</div>
                    <div style={{ color: '#888', fontSize: 14 }}>{selectedOrder.customerName}</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ background: '#e0f7fa', color: '#007bff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 500, marginRight: 8 }}>{selectedOrder.BuyerId?.UserRole?.toUpperCase() || 'USER'}</span>
                      {selectedOrder.status && (
                        <span style={{ background: selectedOrder.status === 'delivered' ? '#e6f9ec' : '#ffeaea', color: selectedOrder.status === 'delivered' ? '#22c55e' : '#f87171', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 500 }}>
                          {selectedOrder.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ color: '#888', fontSize: 13 }}>Ngày đặt</div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedOrder.date ? new Date(selectedOrder.date).toLocaleDateString('vi-VN') : 'N/A'}</div>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                    <div style={{ color: '#888', fontSize: 13 }}>Tổng tiền</div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{formatCurrency(selectedOrder.totalAmount)}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Thông tin đơn hàng</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <div><i className="ti ti-user" style={{ marginRight: 8 }}></i>{selectedOrder.customerName}</div>
                  <div><i className="ti ti-package" style={{ marginRight: 8 }}></i>{selectedOrder.productName}</div>
                  <div><i className="ti ti-map-pin" style={{ marginRight: 8 }}></i>{selectedOrder.shippingAddress || 'N/A'}</div>
                  <div><i className="ti ti-credit-card" style={{ marginRight: 8 }}></i>{selectedOrder.PaymentId?.Name || 'N/A'}</div>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Hoạt động gần đây</div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, textAlign: 'center', color: '#888' }}>
                  <i className="ti ti-info-circle" style={{ fontSize: 20, marginBottom: 4 }}></i>
                  <div>Chưa có hoạt động nào</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
