const express = require("express");
require("dotenv").config();
const app = express();


// ⚠️ Cấu hình JSON và URL-encoded phải đúng thứ tự, không lặp lại!
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const cors = require("cors");
const session = require("express-session");
// Cho phép frontend localhost:3000 truy cập

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);




//Tao session
app.use(
  session({
    secret: `${process.env.SECRET_KEY}`,
    resave: false,
    saveUninitialized: false,
  })
);


//Ket noi voi mongodb
const mongoose = require("mongoose");
mongoose
  .connect(`${process.env.URL}${process.env.DBNAME}`)
  .then(() => console.log("Connected to mongodb using mongoose"))
  .catch((err) => console.log(`Connect fail:${err}`));


// API routes
const userRouter = require("./src/routes/UserRoutes");

const adminRouter = require("./src/routes/AdminRoutes");
const sellerRouter = require("./src/routes/SellerRoutes");

const productRouter = require("./src/routes/ProductRoutes")
app.use("/customer", userRouter);
app.use("/admin", adminRouter);
app.use("/seller", sellerRouter);
app.use("/product", productRouter);
// Start server
const port = process.env.PORT;
const host = process.env.HOSTNAME;
app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
