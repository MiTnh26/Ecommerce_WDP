

const Order = require("../../models/Orders");
const OrderItem = require("../../models/OrderItems");
const Shop = require("../../models/Shops");

const getSellerStatistics = async (req, res) => {
  try {
    const userId = req.query.userId; // truyền từ FE qua query
    console.log("[DEBUG] userId từ FE:", userId);

    if (!userId) {
      console.error("[ERROR] Thiếu userId trong query");
      return res.status(400).json({ message: "Missing userId" });
    }

    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      console.error("[ERROR] Không tìm thấy shop cho user:", userId);
      return res.status(404).json({ message: "Shop not found for this user" });
    }

    const shopId = shop._id;
    console.log("[DEBUG] Đã tìm thấy shopId:", shopId);
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);


    const orders = await Order.find({
      ShopId: shopId,
      OrderDate: { $gte: start, $lte: end },
    });
    console.log("[DEBUG] Tổng số đơn hàng:", orders.length);

    const totalOrders = orders.length;

    const totalRevenue = orders
      .filter((o) => o.Status === "Delivered")
      .reduce((sum, o) => sum + o.TotalAmount, 0);

    const statusCount = {
      Pending: 0,
      Delivered: 0,
      Cancelled: 0,
      Processing: 0,
      Shipping: 0,
      Returned: 0,
    };

    orders.forEach((o) => {
      statusCount[o.Status] = (statusCount[o.Status] || 0) + 1;
    });

    const monthlyRevenue = Array(12).fill(0);
    orders.forEach((o) => {
      if (o.Status === "Delivered") {
        const month = new Date(o.OrderDate).getMonth(); // 0-11
        monthlyRevenue[month] += o.TotalAmount;
      }
    });

    //best seller 
    const deliveredOrders = orders.filter((o) => o.Status === "Delivered");
    const orderItemIds = deliveredOrders.map((order) => order.Items).filter(Boolean).flat();

    const orderItems = await OrderItem.find({ _id: { $in: orderItemIds } });

    const productSales = {};

    orderItems.forEach((item) => {
      item.Product.forEach((p) => {
        p.ProductVariant.forEach((v) => {
          const key = `${p.ProductName} - ${v.ProductVariantName}`;
          if (!productSales[key]) {
            productSales[key] = {
              quantity: 0,
              image: v.Image || p.Images?.[0] || "",
            };
          }
          productSales[key].quantity += v.Quantity;
        });
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        image: data.image,
      }))
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
    console.error("[ERROR] getSellerStatistics:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};


module.exports = { getSellerStatistics };

