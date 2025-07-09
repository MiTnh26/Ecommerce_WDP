import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Row, Col, Carousel, Button, Nav } from 'react-bootstrap'
import slide1 from '../../assets/images/slide-1.jpg'
import slide3 from '../../assets/images/slide-3.jpg'
import slide4 from '../../assets/images/slide-4.jpg'
import '../../style/HomePage.css'
import Category from '../../components/homePage/Category'
import Card from '../../components/homePage/Card'
const dataCategory = [
  { id: 1, title: "Fruits & Vegetables", icon: "🥕" },
  { id: 2, title: "Meat & Fish", icon: "🍗" },
  { id: 3, title: "Beverages", icon: "☕" },
  { id: 4, title: "Dairy Products", icon: "🧀" },
  { id: 5, title: "Snacks", icon: "🍪" },
  { id: 6, title: "Bakery", icon: "🍞" },
  { id: 7, title: "Frozen Foods", icon: "🧊" },
  { id: 8, title: "Household", icon: "🧽" },
]
const HomePage = () => {  
  const [filterTrending, setFilterTrending] = useState("All");
  const [widthCartTrending, setWidthCartTrending] = useState(1); // default với mobile = 1
  // navigate
  const navigate = useNavigate();
  useEffect(() => {
    const updateWidthCartTrending = () => {
      if (window.innerWidth >= 1200) {
        setWidthCartTrending(5); // Extra large (xl)
      } else if (window.innerWidth >= 992) {
        setWidthCartTrending(4); // Large (lg)
      } else if (window.innerWidth >= 768) {
        setWidthCartTrending(3); // Medium (md)
      } else if(window.innerWidth >= 576){
        setWidthCartTrending(2); // Small (sm)
      } else {
        setWidthCartTrending(1); // Small và Extra small (sm, xs)
      }
    };
    updateWidthCartTrending();
    window.addEventListener("resize", updateWidthCartTrending);
    return () => window.removeEventListener("resize", updateWidthCartTrending);
  }, []);
  console.log("A", widthCartTrending)

  const handleSelect = (selectedKey, event) => {
    event.preventDefault(); // Chặn chuyển hướng
    setFilterTrending(selectedKey);
  };
  return (
    <div className="mt-4">
      {/* Banner */}
      <Row>
        <Col lg={7}>
          <div className="banner1 ">
            <Carousel className=" rounded-4" controls={false}>
              <Carousel.Item style={{backgroundImage: `url(${slide1})`, width: '100%', height: '700px', backgroundPosition: 'right center'}} className=" rounded-3">
              <div className='container-detail p-4 w-50 h-100 d-flex flex-column align-items-start justify-content-around'>
              <div>
              <p className='title h1'>...</p>
              <p className="description text-muted">...</p>
              </div>
              <Button variant="outline-secondary" className='rounded-0'>SHOP NOW</Button>
              </div>

              </Carousel.Item>      
            </Carousel>
          </div>
          </Col>
        <Col lg={5} style={{ height: '700px' }} className='d-flex flex-column justify-content-between'>
          {/* Banner trên cùng phai*/}
          <div style={{ height: '340px' }}>
            <div className="banner2 rounded-3"
              style={{
                backgroundImage: `url(${slide3})`,
                width: '100%',
                height: '100%',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
              }}>
              <div className='container-detail p-4 w-50 h-100 d-flex flex-column align-items-start justify-content-around'>
                <div>
                  <p className='title h2'>Fruits & Vegetables</p>
                  <a href="/" className='text-muted text-decoration-none'>Shop Collection <i className="fa-solid fa-arrow-right"></i></a>
                </div>
              </div>
            </div>
          </div>
          {/* Banner dưới đáy phai */}
          <div style={{ height: '340px' }} className="mt-auto">
            <div className="banner2 rounded-3"
              style={{
                backgroundImage: `url(${slide4})`,
                width: '100%',
                height: '100%',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
              }}>
              <div className='container-detail p-4 w-50 h-100 d-flex flex-column align-items-start justify-content-around'>
                <div>
                  <p className='title h2'>Fruits & Vegetables</p>
                  <a href="/" className='text-muted text-decoration-none'>Shop Collection <i className="fa-solid fa-arrow-right"></i></a>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <div className="category mt-5">
        <Category dataList={dataCategory} title="Category" />
      </div>
      <div className="nav-trending-product mt-5">
        <div className="header-nav d-flex justify-content-between align-items-center">
          <div className="title h3">Trending Products</div>
          <Nav 
          variant="underline" 
          activeKey={filterTrending}
          onSelect={handleSelect}
          >
            <Nav.Item>
              <Nav.Link className="fw-normal" eventKey="All">ALL</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="fw-normal" eventKey="link-1">Option 1</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="fw-normal" eventKey="link-2">Option 2</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
              <p>Giá trị hiện tại: {filterTrending}</p>
              <div className="body-nav d-flex gap-3 flex-wrap">
              <div className="item-cart" onClick={() => navigate("/Ecommerce/product-detail/1")}
              style={{width: `calc(${100 / widthCartTrending}% - 1rem)`}} >
              <Card />
              </div>
               <div className="item-cart" 
              style={{width: `calc(${100 / widthCartTrending}% - 1rem)`}} >
              <Card />
              </div>
              <div className="item-cart" 
              style={{width: `calc(${100 / widthCartTrending}% - 1rem)`}} >
              <Card />
              </div>
              <div className="item-cart" 
              style={{width: `calc(${100 / widthCartTrending}% - 1rem)`}} >
              <Card />
              </div>
              <div className="item-cart" 
              style={{width: `calc(${100 / widthCartTrending}% - 1rem)`}} >
              <Card />
              </div>
              <div className="item-cart" 
              style={{width: `calc(${100 / widthCartTrending}% - 1rem)`}} >
              <Card />
              </div>

        </div>
      </div>
      {/* Bannner 2 */}
      <div className="d-flex gap-3 mt-5">
        <div className="banner2 rounded-3"
          style={{
            backgroundImage: `url(${slide1})`,
            width: '100%',
            height: '100%',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}>
          <div className='container-detail p-4 w-50 h-100 d-flex flex-column align-items-start justify-content-around'>
            <div>
              <p className='title h2'>Fruits & Vegetables</p>
              <a href="/" className='text-muted text-decoration-none'>Shop Collection <i className="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
        <div className="banner2 rounded-3"
          style={{
            backgroundImage: `url(${slide3})`,
            width: '100%',
            height: '100%',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}>
          <div className='container-detail p-4 w-50 h-100 d-flex flex-column align-items-start justify-content-around'>
            <div>
              <p className='title h2'>Fruits & Vegetables</p>
              <a href="/" className='text-muted text-decoration-none'>Shop Collection <i className="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>
      {/* Best seller */}
      <div className="best-seller mt-5">
      <Category dataList={dataCategory} title="Best Seller" Component={Card}/>
      </div>
      {/* New product */}
      <div className="new-product mt-5">
      <Category dataList={dataCategory} title="New" Component={Card}/>
      </div>
    </div>
  )
}
export default HomePage