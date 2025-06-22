
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import image_default from "../../assets/images/img_default.jpg"
import logo from "../../assets/images/logo_page.jpg"
import '../../style/ProductDetail.css';
import { useState } from 'react';
import StarVoting from '../../components/public/StarVoting';
import Pagination from '../../components/public/Pagination';
import Card from "../../components/homePage/Card";
const visibleCount = 5;
const imageWidth = 82;
const imageGap = 10;
const dataImageListDefault = [
  { id: 1, image: image_default },
  { id: 2, image: logo },
  { id: 3, image: image_default },
  { id: 4, image: image_default },
  { id: 5, image: image_default },
  { id: 6, image: image_default },
  { id: 7, image: image_default },
  { id: 8, image: image_default },
];
const rating = 3;
const color = [
  { id: 1, name: "default", color: image_default },
  { id: 2, name: "default1", color: logo },
  { id: 3, name: "default2", color: image_default },
  { id: 4, name: "default3", color: image_default },
  { id: 5, name: "default4", color: image_default },
  { id: 6, name: "default5", color: image_default },
  { id: 7, name: "default6", color: image_default },
  { id: 8, name: "default7", color: image_default },
  { id: 9, name: "default8", color: image_default },
  { id: 10, name: "default9", color: image_default },
  { id: 11, name: "default10", color: image_default },
  { id: 12, name: "default11", color: image_default },
  // { id: 13, name: "default12", color: image_default},
  // { id: 14, name: "default13", color: image_default},
  // { id: 15, name: "default14", color: image_default},
  // { id: 16, name: "default15", color: image_default}
];
const size = [
  { id: 1, name: "default", color: image_default },
  { id: 2, name: "default1", color: logo },
  { id: 3, name: "default2", color: image_default },
  { id: 4, name: "default3", color: image_default },
  { id: 5, name: "default4", color: image_default },
  { id: 6, name: "default5", color: image_default },
  { id: 7, name: "default6", color: image_default },
  { id: 8, name: "default7", color: image_default },
  { id: 9, name: "default8", color: image_default },
  { id: 10, name: "default9", color: image_default },
  { id: 11, name: "default10", color: image_default },
  { id: 12, name: "default11", color: image_default },
  { id: 13, name: "default12", color: image_default },
  { id: 14, name: "default13", color: image_default },
  { id: 15, name: "default14", color: image_default },
  { id: 16, name: "default15", color: image_default },
  { id: 17, name: "default16", color: image_default },
  { id: 18, name: "default17", color: image_default },
  { id: 19, name: "default18", color: image_default },
  { id: 20, name: "default19", color: image_default },
  { id: 21, name: "default20", color: image_default },
  { id: 22, name: "default21", color: image_default },
  { id: 23, name: "default22", color: image_default },
  { id: 24, name: "default23", color: image_default }

];
const ProductDetail = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0)
  const [currentPageFeedback, setCurrentPageFeedback] = useState(1);
  // inView hook for product feedback section and product related section
  const { ref: reviewRef, inView: reviewInView } = useInView({ triggerOnce: true });
  const { ref: relatedRef, inView: relatedInView } = useInView({ triggerOnce: true });

  // fetch data
  const fetchReviews = async () => {
    console.log("Fetching reviews...");
    return [1, 2, 3];
  };
  const fetchRelatedProducts = async () => {
    console.log("Fetching related products...");
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  };

  // sử dụng useQuery để fectch khi inView
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
    enabled: reviewInView, // chỉ fetch khi phần review đang hiển thị
    staleTime: 1000 * 60 * 10, // 2 minutes
    cacheTime: 1000 * 60 * 30, // 5 minutes
  });
  const { data: relatedProductsData, isLoading: relatedLoading } = useQuery({
    queryKey: ['relatedProducts'],
    queryFn: fetchRelatedProducts,
    enabled: relatedInView, // chỉ fetch khi phần related đang hiển thị
  });

  // so lan co the croll
  const maxIndex = dataImageListDefault.length - visibleCount;

  //handle click scroll thumbnail
  const handleScroll = (direction) => {
    if (direction === "left") {
      setThumbnailStartIndex((prev) => Math.max(prev - 1, 0));
      setCurrentIndex((prev2) => Math.max(prev2 - 1, 0));
      // console.log("currentIndex", Math.max(prev - 1, 0));
    } else {
      setThumbnailStartIndex((prev) => Math.min(prev + 1, maxIndex));
      setCurrentIndex((prev2) => Math.min(prev2 + 1, dataImageListDefault.length - 1));
    }
  };

  console.log("currentIndex", currentPageFeedback);
  return (
    <div className="container">
      <div className="navigate d-flex gap-2  align-items-center my-2 bg-white p-2 flex-wrap">
        {/* Ecommerce > CategoryName > ProductName */}
        <a className="navigate-item text-decoration-none" href="/">Ecommerce</a><i class="fa-solid fa-chevron-right fa-xs"></i>
        <a className="navigate-item text-decoration-none" href="/">Category1</a><i class="fa-solid fa-chevron-right fa-xs"></i>
        <a className="navigate-item text-decoration-none" href="/">Category2</a><i class="fa-solid fa-chevron-right fa-xs"></i>
        <span className="navigate-item-name">Name Product</span>

      </div>
      <main className="main-product-view">
        {/* view product, article: 1 đơn vị nội dung */}
        <article className="product-summary-section p-3 bg-white rounded shadow-sm gap-4">
          {/* image main */}
          <section className="product-image-container flex-2">
            <div className="product-image-main border border-1 d-flex justify-content-center align-items-center">
              <img
                src={dataImageListDefault[currentIndex].image}
                alt="product main view"
                className="img-fluid object-fit-cover"
              />
            </div>
            {/* image thumbnail list  */}
            <div className="overflow-hidden thumbnail-list-product mt-2 position-relative">
              <button
                className="prev-button border-0 bg-muted opacity-25 py-1"
                onClick={() => handleScroll("left")}
                disabled={currentIndex === 0}>
                <i className="fa-solid fa-chevron-left fa-xs px-1 text-white"></i>
              </button>
              <button
                className="next-button border-0 bg-muted opacity-25 py-1"
                onClick={() => handleScroll("right")}
                disabled={currentIndex >= dataImageListDefault.length - 1}>
                <i className="fa-solid fa-chevron-right fa-xs px-1 text-white "></i>
              </button>
              <div className="d-flex transition-thumnail-all justify-content-around  align-items-center flex-nowrap"
                style={{
                  transform: `translateX(-${thumbnailStartIndex * (imageWidth + imageGap)}px)`,
                  transition: "transform 0.3s ease-in-out",
                  gap: "10px",
                  position: "relative",
                }}>
                {dataImageListDefault.map((item, index) => (
                  <div
                    key={index}
                    className={`thumbnail-wrapper ${Number(index) === Number(currentIndex) ? "active" : ""}`}
                    onClick={() => setCurrentIndex(index)}>
                    <img src={item.image} alt={`Thumb ${item.id}`} className="img-fluid object-fit-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* product info */}
          <section className="product-info-container flex-3">
            <p className="product-name text-bold fs-4 p-0 m-0">Lorim ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor</p>
            <div className="d-flex justify-content-between align-items-center">
              <div className="product-rating d-flex align-items-center justify-content-center">
                <p className="rating-text me-2 p-0 m-0">{rating}</p>
                <StarVoting rating={rating} />
                <p className="p-0 m-0 mx-2">|</p>
                <p className="feedback-text mx-2 p-0 m-0 text-muted fw-light">Đánh giá</p>
                <p className="feedback-value p-0 m-0">120</p>
              </div>
              <p className="accuse p-0 m-0 text-muted fw-light">Tố cáo</p>
            </div>
            {/* Price */}
            <div className="product-price d-flex align-items-center gap-2 mt-5 bg-light p-3">
              <p className="price-value p-0 m-0 text-danger fs-3 ">1.200.000</p>
              <p className="price-old-value p-0 m-0 text-muted">1.500.000</p>
              <p className="price-discount  m-0 text-danger">-20%</p>
            </div>
            {/* Banner */}
            {/* <p className="banner-label p-0 m-0 text-muted ">An Tâm Mua Sắm Cùng EZ ecommerce</p> */}
            {/* Color */}
            <div className="product-color mt-5 d-flex gap-2">
              <p className="color-label p-0 m-0 text-muted ">Color</p>
              <div className="list-item-color d-flex gap-2 flex-wrap justify-content-between overflow-y-auto">
                {color.map((item) => (
                  <button key={item.id} className="color-item border border-muted bg-white p-1 pe-2  " style={{ maxHeight: '38px' }}>
                    <img src={item.color} alt={item.name} className="p-0 m-0 object-fit-cover" width={26} height={"auto"} />
                    <span className="text-nowrap">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Size */}
            <div className="product-size mt-3 d-flex gap-2">
              <p className="size-label p-0 m-0 text-muted ">Size</p>
              <div className="list-item-size d-flex gap-2 flex-wrap align-items-center justify-content-between overflow-y-auto">
                {size.map((item) => (
                  <button key={item.id} className="color-item border border-muted bg-white p-1 pe-2 " style={{ height: '38px' }}>
                    <span className="text-nowrap">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Quantity */}
            <div className="product-quantity mt-4 d-flex gap-2">
              <p className="quantity-label p-0 m-0 text-muted ">Số lượng</p>
              <div className="quantity-input d-flex align-items-center">
                <button className="border bg-white p-1 px-2 ">-</button>
                <input type="number" className="border bg-white p-1 px-2 text-center border-start-0 border-end-0 no-spinner" style={{ width: '50px' }} />
                <button className="border bg-white p-1 px-2 text-muted fw-light">+</button>
              </div>
            </div>
            {/* Add to cart */}
            <div className="product-add-to-cart mt-4">
              <button className="btn-add-cart border border-warning bg-white text-warning p-2 me-2"><i className="fa-solid fa-cart-shopping fs-sx me-1"></i>Thêm vào giỏ hàng</button>
              <button className="btn-buy-now border border-warning bg-warning text-white p-2">Mua ngay</button>
            </div>
          </section>
        </article>

        {/* view shop */}
        <aside className="shop-info bg-white rounded shadow-sm mt-3" >
          <div className="shop-title d-flex align-items-center p-3 gap-2">
            <img src={logo} alt="Shop Logo" className=" rounded-circle me-2 flex-shrink-0" width={80} height={80} />
            <div className="">
              <p className="shop-name p-0 m-0 fw-bold mb-2">Tên Shop</p>
              <button className="border border-warning bg-white text-warning pe-1 rounded"><i className="fa-solid fa-shop fs-sx mx-1"></i>Xem Shop </button>
            </div>
            <div className="vertical-line mx-4"></div>
            <div className="other-content"></div>
          </div>
        </aside>

        {/* view product description */}
        <section className="product-description-view mt-3 bg-white rounded shadow-sm p-2">
          <p className="product-details-title py-3 px-2 fw-light bg-light">MÔ TẢ SẢN PHẨM</p>
          <p className='product-details-content m-2 w-75 mx-auto'>Đây là mô tả sản phẩm.
            Lorem ipsum dolor sit amet,
            consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua.
            Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        </section>

        {/* view product reviews */}
        <section className="product-reviews-view mt-3" ref={reviewRef}>
          {reviewsLoading ? (
            <p>Loading reviews...</p>
          ) : (
            <div className="row">
              <div className="col-md-9">
                <section className="product-reviews bg-white rounded shadow-sm p-2">
                  <div className="product-reviews-title d-flex align-items-center justify-content-around bg-light py-4">
                    <p className="p-0 m-0 fw-light">ĐÁNH GIÁ SẢN PHẨM</p>
                    <div className="d-flex">
                      <p className="rating-text me-2 p-0 m-0">{rating}</p>
                      <StarVoting rating={rating} />
                    </div>
                  </div>
                  <div className="product-reviews-details">
                    {(reviewsData || []).map((review, index) => (
                      <div key={index} className="review-item p-3 border-bottom">
                        <div className="d-flex align-items-center gap-3">
                          <img src={logo} alt="User Avatar" className="rounded-circle align-self-start" width={50} height={50} />
                          <div className="review-content flex-1">
                            <p className="fw-bold m-0 p-0">User Name</p>
                            <StarVoting rating={rating} />
                            <p className="review-date text-muted m-0 p-0">Ngày đánh giá: 01/01/2023</p>
                            <p className="review-text m-0 p-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                          </div>
                        </div>
                        <div className="image-review d-flex gap-2 flex-wrap" style={{ marginLeft: "66px" }}>
                          {dataImageListDefault.slice(0, 3).map((item, idx) => (
                            <img key={idx} src={item.image} alt={`Review img ${idx + 1}`} className="object-fit-cover border rounded" width={50} height={50} />
                          ))}
                        </div>
                      </div>
                    ))}
                    {/*pagination for comment*/}
                    <Pagination currentPage={currentPageFeedback} totalPages={10} onPageChange={(page) => setCurrentPageFeedback(page)}/>
                  </div>
                </section>
              </div>
              {/* view product outstanding */}
              <div className="col-md-3">
                <section className="product-outstanding-container p-1 m-0 bg-white rounded shadow-sm">
                  
                    <p className="product-outstanding-title p-2 fw-light bg-light text-center">SẢN PHẨM TOP SALE</p>
                    <div className="product-outstanding p-1 m-0 bg-white rounded shadow-sm">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div className="card-item">
                          <Card cardInfo={{ id: "1", image: "1" }} />
                        </div>
                      ))}
                    </div>            
                </section>
              </div>
            </div>
          )}
        </section>
      </main>
      <section className="product-related-container bg-white rounded shadow-sm p-2 my-3" ref={relatedRef}>
        {relatedLoading ? (
          <p>Loading related products...</p>
        ) : (<>
          <p className="product-outstanding-title p-2 fw-light bg-light ">SẢN PHẨM CÓ LIÊN QUAN</p>
          <div className="related-products d-flex flex-wrap gap-2 justify-content-start">
           {(relatedProductsData || []).map((_, index) => (
              <div className="" style={{
                flex: '0 0 calc(20% - 0.4rem)', // 100% chia 5, trừ đi khoảng cách

              }}>
                <Card cardInfo={{ id: "1", image: "1" }} />
              </div>
            ))}
          </div>
        </>)}
      </section>
    </div>
  )
}

export default ProductDetail
