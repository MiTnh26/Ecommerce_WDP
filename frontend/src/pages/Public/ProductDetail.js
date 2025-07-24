import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import image_default from "../../assets/images/img_default.jpg";
import logo from "../../assets/images/logo_page.jpg";
import styles from "../../style/ProductDetail.module.css";
import { useState } from "react";
import StarVoting from "../../components/public/StarVoting";
import Pagination from "../../components/public/Pagination";
import Card from "../../components/homePage/Card";
import {
  fetchRelatedProducts,
  fetchReviews,
  fetchProductDetail,
} from "../../api/ProductApi";
import { useEffect } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import LazyLoad from 'react-lazyload';
import axios from "axios";
const visibleCount = 5;
const imageWidth = 82;
const imageGap = 10;
const rating = 4.5;

const ProductDetail = () => {
  // 1. State declare
  const [currentIndex, setCurrentIndex] = useState(-1); // index of current image
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0); // index of thumbnail start
  const [dataProduct, setDataProduct] = useState();
  const product_id = useParams().id;
  const [quantity, setQuantity] = useState(1); // quantity of product
  const queryClient = useQueryClient();
  // 2. inView hook for product feedback section and product related section
  const { ref: reviewRef, inView: reviewInView } = useInView({
    triggerOnce: true,
  });
  const { ref: relatedRef, inView: relatedInView } = useInView({
    triggerOnce: true,
  });
   // config
  const URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

  // 3. Data fetching useEffect
  useEffect(() => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
    const loadData = async () => {
    const result = await fetchProductDetail(product_id);
    console.log("result", result.data);  

    if (result?.status === 200 && result?.data === null) {
      alert(result?.message);
      navigate("/Ecommerce/home");
      return;
    }
    const productDetail = result.data;
    if (!productDetail) return;
    setDataProduct(productDetail);
    };
    loadData();

  }, [product_id]);

  // sử dụng useQuery để fectch khi inView
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
    enabled: reviewInView, // chỉ fetch khi phần review đang hiển thị
    staleTime: 1000 * 60 * 10, // 2 minutes
    cacheTime: 1000 * 60 * 30, // 5 minutes
  });
  const { data: relatedProductsData, isLoading: relatedLoading } = useQuery({
    queryKey: ["relatedProducts"],
    queryFn: () => fetchRelatedProducts(dataProduct?.ProductName),
    enabled: relatedInView, // chỉ fetch khi phần related đang hiển thị
  });

  // so lan co the croll
  const maxIndex = dataProduct?.ProductVariant.length - visibleCount;

  //handle click scroll thumbnail
  const handleScroll = (direction) => {
    setQuantity(1); // reset quantity to 1 when changing image
    if (direction === "left") {
      setThumbnailStartIndex((prev) => Math.max(prev - 1, 0));
      setCurrentIndex((prev2) => Math.max(prev2 - 1, 0));
      // console.log("currentIndex", Math.max(prev - 1, 0));
    } else {
      setThumbnailStartIndex((prev) => Math.min(prev + 1, maxIndex));
      setCurrentIndex((prev2) =>
        Math.min(prev2 + 1, dataProduct?.ProductVariant.length - 1)
      );
    }
  };

  // handle change quantity
  const handleChangeQuantity = (e) => {
    if(currentIndex === -1){
      alert("Please select variant");
      return;
    }
    if(dataProduct?.ProductVariant[currentIndex].Status === "Inactive"){
        alert("This variant is inactive");
        return;      
    }
    const value = e.target.value;
    if (value < 0) {
      setQuantity(1);
    } else if (
      value < dataProduct?.ProductVariant[currentIndex].StockQuantity
    ) {
      setQuantity(value);
    } else {
      setQuantity(dataProduct?.ProductVariant[currentIndex].StockQuantity);
    }
  };
  const handleClickQuantity = (direction) => {
    if(currentIndex === -1){
      alert("Please select variant");
      return;
    }
    if(dataProduct?.ProductVariant[currentIndex].Status === "Inactive"){
        alert("This variant is inactive");
        return;      
    }
    if (direction === "decrease") {
      setQuantity((prev) => Math.max(prev - 1, 1));
    } else if (direction === "increase") {
      setQuantity((prev) =>
        Math.min(
          prev + 1,
          dataProduct?.ProductVariant[currentIndex].StockQuantity
        )
      );
    }
  }

  const handleAddToCart = () => {
    //console.log("quantity");
    if(currentIndex === -1){
      alert("Please select variant");
      return;
    }
    const addToCart = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        navigate("/Ecommerce/login");
        return;
      }
      if (quantity === 0) {
        alert("Please select quantity");
        return;
      }
      if(dataProduct?.ProductVariant[currentIndex].Status === "Inactive"){
        alert("This variant is inactive");
        return;      
      }
      const data = {
        UserId: user._id,
        Product_id: product_id,
        ProductName: dataProduct.ProductName,
        ProductImage: dataProduct.ProductImage,
        ShopID: dataProduct.ShopId._id,
        ProductVariant: [
          {
            _id: dataProduct.ProductVariant[currentIndex]._id,
            Image: dataProduct.ProductVariant[currentIndex].Image,
            Price: dataProduct.ProductVariant[currentIndex].Price,
            ProductVariantName: dataProduct.ProductVariant[currentIndex].ProductVariantName,
            Quantity: quantity
          }
        ],
      };

      console.log("data add to cart", data);
      const res = await axios.post(`${URL}/customer/add-to-cart`, {
        UserId: user._id,
        Product_id: product_id,
        ProductName: dataProduct.ProductName,
        ProductImage: dataProduct.ProductImage,
        ShopID: dataProduct.ShopId._id,
        ProductVariant: [
          {
            _id: dataProduct.ProductVariant[currentIndex]._id,
            Image: dataProduct.ProductVariant[currentIndex].Image,
            Price: dataProduct.ProductVariant[currentIndex].Price,
            ProductVariantName: dataProduct.ProductVariant[currentIndex].ProductVariantName,
            Quantity: quantity
          }
        ],
      }, { withCredentials: true });
      if (res.status === 200) {
        alert("Add to cart successfully");
      }
    }
    queryClient.invalidateQueries(["cart"]);
    console.log("add to cart");
    addToCart();
  }
  


  return (
    <>
    {/* 1. Render UI */
      dataProduct == null ? (
        <div className="container">
          <div className="d-flex justify-content-center align-items-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
      <div className="navigate d-flex gap-2  align-items-center my-2 bg-white p-2 flex-wrap">
        {/* Ecommerce > CategoryName > ProductName */}
        <a
          className="navigate-item text-decoration-none"
          href="/Ecommerce/home"
        >
          Ecommerce
        </a>
        <i className="fa-solid fa-chevron-right fa-xs"></i>
        {/* <a className="navigate-item text-decoration-none" href={`/Ecommerce/search?name=&category=${dataProduct?.CategoryId._id}`}>
          {dataProduct?.CategoryId?.CategoryName?.trim()
            ? dataProduct.CategoryId.CategoryName
            : ""}
        </a> */}
        {/* <i className="fa-solid fa-chevron-right fa-xs"></i> */}
        <span className="navigate-item-name">
          {dataProduct?.ProductName || "Loading..."}
        </span>
      </div>
      <main className="main-product-view">
        {/* view product, article: 1 đơn vị nội dung */}
        <article
          className={`${styles["product-summary-section"]} p-3 bg-white rounded shadow-sm gap-4`}
        >
          {/* image main */}
          <section className="product-image-container flex-2">
            <div
              className={`${styles["product-image-main"]}  border border-1 d-flex justify-content-center align-items-center`}
            >
              <LazyLoad>
              <img
                src={ currentIndex === -1 ? dataProduct?.ProductImage :  dataProduct?.ProductVariant[currentIndex].Image}
                alt="product main view"
                className="img-fluid object-fit-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                  "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0";
                }}
                />
                </LazyLoad>
            </div>
            {/* image thumbnail list  */}
            <div
              className={` ${styles["thumbnail-list-product"]} overflow-hidden mt-2 position-relative`}
            >
              <button
                className={`${styles["prev-button"]} border-0 bg-muted opacity-25 py-1`}
                onClick={() => handleScroll("left")}
                disabled={currentIndex === 0}
              >
                <i className="fa-solid fa-chevron-left fa-xs px-1 text-white"></i>
              </button>
              <button
                className={`${styles["next-button"]} border-0 bg-muted opacity-25 py-1`}
                onClick={() => handleScroll("right")}
                disabled={
                  currentIndex >= dataProduct?.ProductVariant.length - 1
                }
              >
                <i className="fa-solid fa-chevron-right fa-xs px-1 text-white "></i>
              </button>
              <div
                className="d-flex transition-thumnail-all justify-content-start  align-items-center flex-nowrap"
                style={{
                  transform: `translateX(-${
                    thumbnailStartIndex * (imageWidth + imageGap)
                  }px)`,
                  transition: "transform 0.3s ease-in-out",
                  gap: "10px",
                  position: "relative",
                }}
              >
                {dataProduct?.ProductImage && (
                  <div
                    key={"img-default"}
                    className={`${styles["thumbnail-wrapper"]} ${
                      Number(-1) === Number(currentIndex)
                        ? `${styles["active"]}`
                        : ""
                    }`}                
                    onClick={() => {
                      setCurrentIndex(-1);
                      setQuantity(1); 
                    }}
                  >
                    <img
                      src={dataProduct?.ProductImage}
                      alt={`Thumb default`}
                      className="img-fluid object-fit-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0";
                      }}
                    />
                  </div>
                )}
                {dataProduct?.ProductVariant?.map((item, index) => (
                  <div
                    key={index}
                    className={`${styles["thumbnail-wrapper"]} ${
                      Number(index) === Number(currentIndex)
                        ? `${styles["active"]}`
                        : ""
                    }`}                
                    onClick={() => {
                      setCurrentIndex(index);
                      setQuantity(1); 
                    }}
                  >
                    <img
                      src={item?.Image}
                      alt={`Thumb ${item.id}`}
                      className="img-fluid object-fit-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* product info */}
          <section className="product-info-container flex-3 w-100">
            <p className="product-name text-bold fs-4 p-0 m-0">
              {dataProduct?.ProductName || "Loading..."}
            </p>
            {/* Price */}
            <div className="product-price d-flex align-items-center gap-2 mt-5 bg-light p-3">
              <p
                className={`${styles["price-value"]} p-0 m-0 text-danger fs-3`}
              >
                { currentIndex >= 0 ?   dataProduct?.ProductVariant[currentIndex].Price?.toLocaleString(
                  "vi-VN"
                ) || "Loading..." : dataProduct?.ProductVariant[0].Price?.toLocaleString(
                  "vi-VN"
                ) || "Loading..."}
              </p>
            </div>

            {/* Product Variant */}
            <div className="product-color mt-5 d-flex gap-2">
              <p className={`${styles["color-label"]}  p-0 m-0 text-muted`}>
                Product Variant
              </p>
              <div
                className={`${styles["list-item-color"]} list-item-color d-flex gap-2 flex-wrap justify-content-between overflow-y-auto`}
              >
                {dataProduct?.ProductVariant.map((item, index) => (
                  <button
                    key={index}
                    className={`color-item border ${
                      currentIndex === index ? "border-warning border-2" : "border-muted"
                    } bg-white p-1 pe-2`}
                    style={{ 
                      maxHeight: "38px",
                      cursor: item.Status === "Inactive" ? "not-allowed" : "pointer" }}
                    onClick={() => {
                      setCurrentIndex(index);
                      setQuantity(0); 
                    }}
                    disabled={item.Status === "Inactive"}
                    //cursor={item.Status === "Inactive" ? "not-allowed" : "pointer"}
                  >
                    <img
                      src={item?.Image || ""}
                      alt={item.name}
                      className="p-0 m-0 object-fit-cover"
                      width={26}
                      height={"auto"}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0";
                      }}
                    />
                    <span className="text-nowrap">
                      {" " + item.ProductVariantName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {/* Quantity */}
            <div className="product-quantity mt-4 d-flex gap-2">
              <p className={`${styles["quantity-label"]} p-0 m-0 text-muted `}>
                Quantity
              </p>
              <div className="quantity-input d-flex align-items-center">
                <button className="border bg-white p-1 px-2 "
                disabled={quantity <= 1}
                onClick={() =>handleClickQuantity("decrease")}>-</button>
                <input
                  type="number"
                  className={`border bg-white p-1 px-2 text-center border-start-0 border-end-0 ${styles["no-spinner"]}`}
                  style={{ width: "50px" }}
                  value={quantity}
                  onChange={handleChangeQuantity}
                />
                <button className="border bg-white p-1 px-2 text-muted fw-light"
                disabled={ currentIndex >= 0 ?  quantity == dataProduct?.ProductVariant[currentIndex].StockQuantity : quantity == dataProduct?.ProductVariant[0].StockQuantity}
                onClick={() =>handleClickQuantity("increase")}>
                  +
                </button>
              </div>
            </div>
            {/* Add to cart */}
            <div className="product-add-to-cart mt-4">
              <button
                className={`${styles["btn-add-cart"]} border border-warning bg-white text-warning p-2 me-2`}
                onClick={handleAddToCart}
              >
                <i className="fa-solid fa-cart-shopping fs-sx me-1"></i>ADD TO CART
              </button>
              <button
                className={`${styles["btn-buy-now"]} border border-warning bg-warning text-white p-2`}
                //onClick={handleAddToCart}
              >
                BUY NOW
              </button>
            </div>
          </section>
        </article>

        {/* view shop */}
        <aside className="shop-info bg-white rounded shadow-sm mt-3">
          <div className="shop-title d-flex align-items-center p-3 gap-2">
            <img
              src={dataProduct?.ShopId?.shopAvatar || ""}
              alt="Shop Logo"
              className=" rounded-circle me-2 flex-shrink-0"
              width={80}
              height={80}
              loading="lazy"
              onError={(e) => {
                e.target.src =
                  "https://cdn.dribbble.com/userupload/29476359/file/original-8b86b24e7fc146c5cd6c64446873cfaa.jpg?resize=400x0";
              }}
            />

            <div className="">
              <p className="shop-name p-0 m-0 fw-bold mb-2">
                {dataProduct?.ShopId?.name || "Loading..."}
              </p>
              <button className="border border-warning bg-white text-warning pe-1 rounded">
                <i className="fa-solid fa-shop fs-sx mx-1"></i>View Shop{" "}
              </button>
            </div>
            <div className={`${styles["vertical-line"]}  mx-4`}></div>
            <div className="other-content d-flex">
              <div>
                <label className="fw-bold p-0 m-0">Address</label>
                <p className="shop-description p-0 m-0 text-muted">
                  {dataProduct?.ShopId?.address?.province || "Loading..."}
                </p>
              </div>
              <div className={`${styles["vertical-line"]}  mx-4`}></div>
              <div>
                <label className="fw-bold p-0 m-0">Description</label>
                <p className="shop-description p-0 m-0 text-muted">
                  {dataProduct?.ShopId?.description || "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* view product description */}
        <section className="product-description-view mt-3 bg-white rounded shadow-sm p-2">
          <p className="product-details-title py-3 px-2 fw-light bg-light">
            PRODUCT DESCRIPTION
          </p>
          <p className="product-details-content m-2 w-100 mx-auto">
            {dataProduct?.Description ? dataProduct?.Description : "Loading..."}
          </p>
        </section>

        {/* view product reviews */}
      </main>
      <section
        className="product-related-container bg-white rounded shadow-sm p-2 my-3"
        ref={relatedRef}
      >
        {relatedLoading ? (
          <p>Loading related products...</p>
        ) : (
          <>
            <p className="product-outstanding-title p-2 fw-light bg-light ">
              RELATED PRODUCTS
            </p>
            <div className="related-products d-flex flex-wrap gap-2 justify-content-start">
              {(relatedProductsData || []).map((item, index) => (
                <div key={index} className={styles["card-item-related"]} >
                  <Card item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
      )
    }
    </>
  );
};

export default ProductDetail;
