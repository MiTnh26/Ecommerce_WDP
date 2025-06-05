const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
const cors = require("cors");
const session = require("express-session");
// Cho phép frontend localhost:3000 truy cập
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // nếu bạn dùng cookie, token hoặc session
  })
);
//Tao session
app.use(
  session({
  secret: `${process.env.SECRET_KEY}`,
  resave: false,
  saveUninitialized: false,
}));

//Ket noi voi mongodb
console.log("MongoDB URI:", `${process.env.URL}${process.env.DBNAME}`);

//Ket noi voi mongodb
const mongoose = require("mongoose");
mongoose
  .connect(`${process.env.URL}${process.env.DBNAME}`)
  .then(() => console.log("Connected to mongodb using mongoose"))
  .catch((err) => console.log(`Connect fail:${err}`));

//Tao API
const userRouter = require("./src/routes/UserRoutes");


const adminRouter = require("./src/routes/AdminRoutes");
const sellerRouter = require("./src/routes/SellerRoutes");
app.use("/customer", userRouter);
app.use("/admin", adminRouter);
app.use("/seller", sellerRouter);
// //Cho server Khoi dong

const port = process.env.PORT;
const host = process.env.HOSTNAME;
app.listen(port, host, () => {
  console.log(`server is running at http://${host}:${port}`);
});
