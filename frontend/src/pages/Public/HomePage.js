import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Row, Col, Carousel, Button, Nav } from 'react-bootstrap'
import slide1 from '../../assets/images/banner-01.png'
import slide12 from '../../assets/images/banner-02.png'
import slide13 from '../../assets/images/banner-03.png'
import slide3 from '../../assets/images/trending.jpg'
import slide4 from '../../assets/images/best-seller-11.png'
import slide5 from '../../assets/images/banner-happy-shoping.png'
import slide6 from '../../assets/images/banner-cart.png'
import '../../style/HomePage.css'
import Category from '../../components/homePage/Category'
import Card from '../../components/homePage/Card'
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { getIconForCategory } from '../../store/keywordToIcon';
import { fetchCategory, fetchCategoryLength, fetchTrendingProducts, fetchBestSellerProducts, fetchNewProducts } from '../../api/ProductApi';

const HomePage = () => {
  // 1. State declare
  const [dataCategory, setDataCategory] = useState([]);
  const [maxLengthCategory, setMaxLengthCategory] = useState(0);
  const [user, setUser] = useState(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
  //console.log("user", user);
  const navigate = useNavigate();

  // 2. Refs 
  const { ref: trendingRef, inView: trendingInView } = useInView({ triggerOnce: true });
  const { ref: bestSellerRef, inView: bestSellerInView } = useInView({ triggerOnce: true });
  const { ref: newProductRef, inView: newProductRefInView } = useInView({ triggerOnce: true });

  // 3. Configurations
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  // 4. Data fetching - useEffect
  useEffect(() => {
    const loadData = async () => {
      const [categories, count] = await Promise.all([
        fetchCategory(),
        fetchCategoryLength()
      ]);
      setDataCategory(categories || []);
      setMaxLengthCategory(count || 0);
    };

    loadData();
  }, []);

  // 5. React Query hooks
    //5.1 trending products
  const { data: trendingData, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrendingProducts,
    enabled: trendingInView,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
  });
    //5.2 best sales products
  const { data: bestSellerData, isLoading: isBestSellerLoading } = useQuery({
    queryKey: ['bestSeller'],
    queryFn: fetchBestSellerProducts,
    enabled: bestSellerInView,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
  });
  //5.3 new products
  const { data: newProductData, isLoading: isNewProductLoading } = useQuery({
    queryKey: ['newProducts'],
    queryFn: fetchNewProducts,
    enabled: newProductRefInView,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
  });


  // 6. Event handlers
    //6.1 Handle category click next category
  const handleCategoryClickNext = async () => {
    console.log("handleCategoryClickNext");
    try {
      const res = await axios.get(`${baseURL}/category/get-category?limit=1&skip=${dataCategory.length}`, {
        withCredentials: true,
      });
      const data = res.data[0];
      const icon = getIconForCategory(data.CategoryName);
      setDataCategory(prev => [...prev, { ...data, icon }]);
    } catch (error) {
      console.error("Error fetching more categories:", error);
    }
  };
  // test api
  return (
    <div className="mt-4">
      {/* Banner */}
      <Row className='bg-white rounded-3 shadow-sm py-2'>
        <Col lg={7}>
          <div className="banner1 ">
            <Carousel className=" rounded-4">
              <Carousel.Item 
              style={{ 
                backgroundImage: `url(${slide1})`, 
                width: '100%', height: '700px', 
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                position: 'relative'
                }} className=" rounded-3">                
                <Button 
                variant=" mb-auto border" 
                className="rounded-0 px-4 py-2 fw-bold text-dark border-dark shadow-sm hover-effect"
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  left: '5%',
                }}
                onClick={() => navigate('/Ecommerce/search?name=')}
                >SHOP NOW</Button>
              </Carousel.Item>
              <Carousel.Item
                style={{
                  backgroundImage: `url(${slide12})`,
                  width: '100%', height: '700px',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  position: 'relative'
                }} className=" rounded-3">
              </Carousel.Item>
               <Carousel.Item
                style={{
                  backgroundImage: `url(${slide13})`,
                  width: '100%', height: '700px',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  position: 'relative'
                }} className=" rounded-3">
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
                backgroundSize: 'cover',
                position: 'relative'
              }}>
              <a 
                href="#trending"
                className='text-muted text-decoration-none'
                style={{
                  position: "absolute",
                  top: "85%",     
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}>
                Check It Out
                <i className="fa-solid fa-arrow-right"></i></a>
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
                backgroundSize: 'cover',
                position: 'relative'
              }}>         
                <a 
                  href="#best-seller" 
                  className='text-muted text-decoration-none'
                  style={{
                    position: "absolute",
                    top: "85%",     
                    left: "80%",
                    transform: "translate(-50%, -50%)",
                  }}>
                    View Now {" "}
                  <i className="fa-solid fa-arrow-right"></i></a>
                </div>
          </div>
        </Col>
      </Row>
      {/* <div className="category mt-5 bg-white rounded-3 shadow-sm py-2 px-1 ">
        {dataCategory && <Category dataList={dataCategory} title="Category" dataLength={maxLengthCategory} onClickNext={handleCategoryClickNext} />}
      </div> */}
      {/* Trending */}
      <div 
        className="nav-trending-product mt-5 bg-white rounded-3 shadow-sm py-2 px-1" 
        ref={trendingRef}
        id="trending">
        {isLoadingTrending ? (
          <>
            <p>Is Loading ...</p>
          </>) : (
          <>
         {trendingData && trendingData.length > 0  ? (<>
            <Category dataList={trendingData} title="Trending Products" Component={Card} dataLength={trendingData.length}/>
          </>):(<>
            <p className="title h4">Trending Products</p>
            {/* <Category dataList={dataTrending} title="Trending Products" Component={Card} dataLength={0}/> */}
            <p>Data is updateing ... </p>
          </>)}
          </>
        )}
      </div>
      {/* Bannner 2 */}
      <div className="d-flex gap-3 mt-5 bg-white rounded-3 shadow-sm py-2 px-1" 
        style={{ height: '200px' }}> 
        <div className="banner2 rounded-3"
          style={{
            backgroundImage: `url(${slide5})`,
            width: '100%',
            height: '100%',
            // backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }}>
        </div>
        <div className="banner2 rounded-3"
          style={{
            backgroundImage: `url(${slide6})`,
            width: '100%',
            height: '100%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
        </div>
      </div>
      {/* Best seller */}
      <div 
        className="best-seller mt-5 bg-white rounded-3 shadow-sm py-2 px-1" 
        ref={bestSellerRef}
        id="best-seller">
        {isBestSellerLoading ? (
          <>
            <p>Is Loading ...</p>
          </>) : (
          <>
         {bestSellerData && bestSellerData.length > 0  ? (<>
            <Category dataList={bestSellerData} title="Best Seller Products" Component={Card} dataLength={bestSellerData.length}/>
          </>):(<>
            <p className="title h4">Best Seller Products</p>
            <p>Data is updateing ... </p>
          </>)}
          </>
        )}
      </div>
      
      {/* New product */}
      <div className="new-product mt-5 bg-white rounded-3 shadow-sm py-2 px-1" ref={newProductRef}>
       {isNewProductLoading ? (
          <>
            <p>Is Loading ...</p>
          </>
          ) : (
          <>
          {newProductData && newProductData.length > 0  ? (
            <>
            <Category dataList={newProductData} title="New Products" Component={Card} dataLength={newProductData.length}/>
          </>):(<>
            <p className="title h4">New Products</p>
            <p>Data is updateing ... </p>
          </>
        
        )}
          </>
        )}
      </div>
    </div>
  )
}
export default HomePage