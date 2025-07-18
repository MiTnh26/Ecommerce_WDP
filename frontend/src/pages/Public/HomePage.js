import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Row, Col, Carousel, Button, Nav } from 'react-bootstrap'
import slide1 from '../../assets/images/slide-1.jpg'
import slide3 from '../../assets/images/slide-3.jpg'
import slide4 from '../../assets/images/slide-4.jpg'
import '../../style/HomePage.css'
import Category from '../../components/homePage/Category'
import Card from '../../components/homePage/Card'
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { getIconForCategory } from '../../store/keywordToIcon';
const dataCategoryTest = [
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
  const [widthCartTrending, setWidthCartTrending] = useState(1); // default với mobile = 1
  const [dataCategory, setDataCategory] = useState([]);
  const [maxLengthCategory, setMaxLengthCategory] = useState(0);
  const [dataTrending, setDataTrending] = useState([]);
  const [dataBestSeller, setDataBestSeller] = useState([]);
  const [dataNewProduct, setDataNewProduct] = useState([]);
  // navigate
  const navigate = useNavigate();
  // inview : Trending Products, Best Seller, New
  const { ref: trendingRef, inView: trendingInView } = useInView({ triggerOnce: true });
  const { ref: bestSellerRef, inView: bestSellerInView } = useInView({ triggerOnce: true });
  const { ref: newProductRef, inView: newProductRefInView } = useInView({ triggerOnce: true });
  // base URL
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
  useEffect(() => {
    const updateWidthCartTrending = () => {
      if (window.innerWidth >= 1200) {
        setWidthCartTrending(5); // Extra large (xl)
      } else if (window.innerWidth >= 992) {
        setWidthCartTrending(4); // Large (lg)
      } else if (window.innerWidth >= 768) {
        setWidthCartTrending(3); // Medium (md)
      } else if (window.innerWidth >= 576) {
        setWidthCartTrending(2); // Small (sm)
      } else {
        setWidthCartTrending(1); // Small và Extra small (sm, xs)
      }
    };
    updateWidthCartTrending();
    // fetch category
    fetchCategory();
    fetchCategoryCount();
    window.addEventListener("resize", updateWidthCartTrending);
    return () => window.removeEventListener("resize", updateWidthCartTrending);

  }, []);
  //console.log("A", widthCartTrending)

  //fetch data
  // get category
  const fetchCategory = async () => {
    try {
      const res = await axios.get(`${baseURL}/category/get-all?limit=4&skip=0`, {
        withCredentials: true,
      });
      const data = res.data;
      // them icon tuong ung voi cateogry
      const categoriesWithIcons = data.map((item, index) => ({
        ...item,
        icon: getIconForCategory(item.CategoryName),
      }));
      //console.log("fetchCategory data", categoriesWithIcons);
      setDataCategory(categoriesWithIcons);
    } catch (err) {
      console.log("fetchCategory err", err)
    }
  }
  // get lengths of categories
  const fetchCategoryCount = async () => {
    try {
      const res = await axios.get(`${baseURL}/category/get-count`, {
        withCredentials: true,
      });
      const count = res.data.count;
      setMaxLengthCategory(count);
      console.log("fetchCategoryCount count", count);
    } catch (err) {
      console.log("fetchCategoryCount err", err);
    }
  }
  const fetchTrendingProducts = async () => {
    
    return
  }
  // useQuery để lấy dữ liệu trending products
  const { data: trendingData, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending'], //tên định danh của query (để cache)
    queryFn: fetchTrendingProducts,
    enabled: trendingInView, 
    staleTime: 1000 * 60 * 10, 
    cacheTime: 1000 * 60 * 30, 
  })

  // xu ly event
  // handle click next category
  const handleCategoryClickNext = () => {
    const addData = async () => {
      try {
        const res = await axios.get(`${baseURL}/category/get-all?limit=1&skip=${dataCategory.length}`, {
          withCredentials: true,
        });
        const data = res.data[0];
        //cập nhật state
        const icon = getIconForCategory(data.CategoryName);
        //const dataWithIcons = {...data, icon: getIconForCategory(data.CategoryName)}
        //console.log("handleCategoryClickNext data", {...data, icon: getIconForCategory(data.CategoryName)});
        setDataCategory((prevData) => [...prevData, {...data, icon: icon}]);
      } catch (error) {
        console.error("Error fetching more categories:", error);
      }
    }
    addData();
  }

  return (
    <div className="mt-4">
      {/* Banner */}
      <Row className='bg-white rounded-3 shadow-sm py-2'>
        <Col lg={7}>
          <div className="banner1 ">
            <Carousel className=" rounded-4" controls={false}>
              <Carousel.Item style={{ backgroundImage: `url(${slide1})`, width: '100%', height: '700px', backgroundPosition: 'right center' }} className=" rounded-3">
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
      <div className="category mt-5 bg-white rounded-3 shadow-sm py-2 px-1 ">
        <Category dataList={dataCategory} title="Category" dataLength={maxLengthCategory} onClickNext={handleCategoryClickNext} />
      </div>
      {/* Trending */}
      <div className="nav-trending-product mt-5 bg-white rounded-3 shadow-sm py-2 px-1" ref={trendingRef}>
        {isLoadingTrending ? (
          <>
            <p>Is Loading ...</p>
          </>) : (
          <>
            <Category dataList={dataTrending} title="Trending Products" Component={Card} dataLength={0}/>
          </>
        )}
      </div>
      {/* Bannner 2 */}
      <div className="d-flex gap-3 mt-5 bg-white rounded-3 shadow-sm py-2 px-1">
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
      <div className="best-seller mt-5 bg-white rounded-3 shadow-sm py-2 px-1">
        <Category dataList={dataCategoryTest} title="Best Seller" Component={Card} />
      </div>
      {/* New product */}
      <div className="new-product mt-5 bg-white rounded-3 shadow-sm py-2 px-1">
        <Category dataList={dataCategoryTest} title="New" Component={Card} />
      </div>
    </div>
  )
}
export default HomePage