import React, { useState } from "react";
import defaultImage from "../../assets/images/img_default.jpg";
import "../../style/card.css";
import { useNavigate } from "react-router-dom";
const Card = ({ item }) => {
  //console.log("cardInfo", item);
  const [animate, setAnimate] = useState(false);
  const [quantity, setQuantity] = useState(0);
  // navigate
  const navigate = useNavigate();

  const handleAddToCart = () => {
    // TODO: xử lý thêm vào cart ở đây

    setAnimate(true);
    // Tự động ẩn animation sau 1 giây
    setTimeout(() => {
      setAnimate(false);
    }, 1000);
  };
  const handleClickQuantity = (direction) => {
    if (direction === "decrease") {
      setQuantity((prev) => Math.max(prev - 1, 0));
    } else if (direction === "increase") {
      setQuantity((prev) => Math.min(prev + 1, item?.StockQuantity));
    }
  };
  const handleBuyNow = () => {
    // lưu data vào localstorage
  };

  return (
    <div
      className="card-custom rounded-3 p-3 h-100"
      style={{
        boxShadow: "0px 5px 22px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="card-header-custom rounded-3 overflow-hidden">
        <div
          className="card-image-container bg-light"
          onClick={() => {
            navigate(`/Ecommerce/product-detail/${item._id}`);
            // window.location.reload();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{ aspectRatio: "1/1", position: "relative" }}
        >
          <img
            src={item?.ProductImage}
            alt=""
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
            loading="lazy"
            onError={(e) => {
              e.target.src =
                "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0";
            }} // Xử lý khi ảnh lỗi
          />
        </div>
      </div>
      <div className="card-body mt-2">
        <p className="card-title-custom fw-bold title">
          {item.ProductName ? item.ProductName : "Product Name"}
        </p>
        <div className="d-flex justify-content-between">
          <p className="price fw-bold">
            {item.Price ? Number(item.Price).toLocaleString("en-US") : "0"} $
          </p>
          {/* <p className="rate text-warning"><i className="fa-solid fa-star"></i> 4.8</p> */}
        </div>
      </div>
    </div>

  );
};
export default Card;
