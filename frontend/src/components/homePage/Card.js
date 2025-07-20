import React, { useState } from 'react'
import defaultImage from '../../assets/images/img_default.jpg';
import "../../style/card.css"
import { useNavigate } from 'react-router-dom';
const Card = ({item}) => {
  console.log("cardInfo", item);
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
      setQuantity((prev) =>
        Math.min(
          prev + 1,
          item?.StockQuantity
        )
      );
    }
  }

  return (
    <div className="card-custom rounded-3 p-3"
      style={{
        boxShadow: '0px 5px 22px rgba(0, 0, 0, 0.04)'
      }}>
      <div className="card-header-custom rounded-3 overflow-hidden">
        <div className="card-image-container bg-light"
          onClick={() => {
            navigate(`/Ecommerce/product-detail/${item._id}`);
            window.location.reload();
          }}
          style={{ aspectRatio: '1/1', position: 'relative' }}>
          <img
            // src={ item?.ProductImage || "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0"} 
            src={ item?.ProductImage}
            alt=""
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => { e.target.src = "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0" }} // Xử lý khi ảnh lỗi

          />
          {/* <div className="discord rounded-3"
            style={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              backgroundColor: "#a3be4c"
            }}
          ><p className='fw-bold text-white m-0 px-1'>30%</p></div>
          <div className="heart border rounded-circle"
            style={{
              position: 'absolute',
              top: '5%',
              right: '5%',
            }}
          >
            <i className="fa-regular fa-heart fs-4 p-2 m-0"></i>
          </div> */}
        </div>
      </div>
      <div className="card-body mt-2">
        <p className="card-title-custom fw-bold title">{item.ProductName ? item.ProductName : "Product Name"}</p>
        <div className="d-flex justify-content-between">
          <p className="price fw-bold">{item.Price ? item.Price : "0".toLocaleString('vi-VN')} ₫</p>
          {/* <p className="rate text-warning"><i className="fa-solid fa-star"></i> 4.8</p> */}
        </div>
        {/* control */}
        {/* <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-2">
            <button className="btn border border-muted p-0 m-0"
              onClick={() => handleClickQuantity("decrease")}
              disabled={quantity == 0}>
              <span className="text-muted fw-light p-1"
                style={{
                  fontSize: '24px',
                  lineHeight: '1',
                }}>-</span>
            </button>
            <p className="amount p-0 m-0 pt-1">{quantity}</p>
            <button className="btn border border-muted p-0 m-0"
            onClick={() => handleClickQuantity("increase")}
            disabled={quantity >= item.StockQuantity}>
              <span className="text-muted fw-light p-1"
                style={{
                  fontSize: '24px',
                  lineHeight: '1',
                }}>+</span>
            </button>
          </div>
          <div className="position-relative d-inline-block">
            <button className="btn border-0 add-to-cart" onClick={handleAddToCart}>
              <i className="fa-solid fa-cart-shopping"></i>
            </button>

            {animate && (
              <div className="animation-add-to-cart position-absolute">
                <span className="amount">{quantity}</span>
                <i className="fa-solid fa-cart-shopping"></i>
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Card