
import { useQuery } from '@tanstack/react-query';
const ProductDetail = () => {
  return (
    <div className="container">
        <div className="navigate d-flex gap-2  align-items-center my-2 bg-white p-2">
            {/* Ecommerce > CategoryName > ProductName */}
            <a className="navigate-item text-decoration-none" href="/">Ecommerce</a><i class="fa-solid fa-chevron-right fa-xs"></i>
            <a className="navigate-item text-decoration-none" href="/">Category1</a><i class="fa-solid fa-chevron-right fa-xs"></i>
            <a className="navigate-item text-decoration-none" href="/">Category2</a><i class="fa-solid fa-chevron-right fa-xs"></i>
            <span className="navigate-item-name">Name Product</span>
            
        </div>
      <main className="main-product-view">
        {/* view product */}
        {/* article: 1 đơn vị nội dung */}
        <article className="product-summary-section d-flex">
          <section className="product-image flex-2"></section>
          <section className="product-info flex-3"></section>
        </article>

        {/* view shop */}
        <aside className="shop-info">
          <h2>Nutriboot93</h2>
          <p>Đánh giá: 119.9k | Tỷ lệ phản hồi: 93%</p>
          <a href="/shop">Xem Shop</a>
        </aside>

        {/* view product description */}
        <section className="product-description-view row">
          <div className="col-md-9">
            <section className="product-details"></section>
            <section className="product-rivews"></section>
          </div>
          <div className="col-md-3">
            <section className="product-outstanding"></section>
          </div>
        </section>
      </main>

      <div className="pagination"></div>
      <div className="related-products"></div>
    </div>
  )
}

export default ProductDetail