const Order = require("../../models/Orders");
const OrderItem = require("../../models/OrderItems");
const Product = require("../../models/Products");

const getSellerStatistics = async (req, res) => {
  const { shopId } = req.query;

  if (!shopId) return res.status(400).json({ message: "shopId is required" });

  try {
    // 1. Tất cả đơn của shop
    const orders = await Order.find({ ShopId: shopId });

    // Tổng đơn
    const totalOrders = orders.length;

    // Tổng doanh thu đơn Completed
    const totalRevenue = orders
      .filter((o) => o.Status === "Completed")
      .reduce((acc, order) => acc + order.TotalAmount, 0);

    // Tổng đơn theo status
    const statusCount = {
      Completed: 0,
      Cancelled: 0,
      Pending: 0,
      Processing: 0,
      Shipping: 0,
      Returned: 0,
    };

    orders.forEach((order) => {
      statusCount[order.Status] = (statusCount[order.Status] || 0) + 1;
    });

    // Biểu đồ doanh thu theo tháng
    const monthlyRevenue = Array(12).fill(0);
    orders.forEach((order) => {
      if (order.Status === "Completed") {
        const month = new Date(order.createdAt).getMonth(); // 0-11
        monthlyRevenue[month] += order.TotalAmount;
      }
    });

    // Lấy top sản phẩm bán chạy (từ OrderItem)
    const orderItems = await OrderItem.find();
    const productSales = {};

    orderItems.forEach((item) => {
      item.Product.forEach((p) => {
        p.ProductVariant.forEach((v) => {
          const key = `${p.ProductName} - ${v.ProductVariantName}`;
          productSales[key] = (productSales[key] || 0) + v.Quantity;
        });
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return res.status(200).json({
      totalOrders,
      totalRevenue,
      statusCount,
      monthlyRevenue,
      topProducts,
    });
  } catch (error) {
    console.error("Error in getSellerStatistics:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error });
  }
};

module.exports = { getSellerStatistics };
