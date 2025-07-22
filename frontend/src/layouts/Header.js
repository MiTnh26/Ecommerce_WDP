import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useNavigate, useSearchParams } from "react-router-dom";
// useQuery to state Cart
import {
  Col,
  Container,
  Row,
  Form,
  Offcanvas,
  ListGroup,
} from "react-bootstrap";
import image from "../assets/images/logo_page.jpg";
import { AppContext } from "../store/Context";
import { useContext } from "react";
import axios from "axios";
const Header = () => {
  const [popUpSearch, setPopUpSearch] = useState(false);
  const [showCanvasCart, setShowCanvasCart] = useState(false);
  const [category_id, setCategory_id] = useState("");
  const { search, setSearch, filterData } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [UserId, setUserId] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  //console.log("UserId", UserId._id);

  // navigate
  const navigate = useNavigate();

  // config
  const URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  //useEffect
  useEffect(() => {
    setSearch(searchParams.get("name") || "");
    setCategory_id(searchParams.get("category") || "");
  }, [searchParams]);

  //inview hook for cart
  const { ref: cartRef, inView: cartInView } = useInView({ triggerOnce: true });


  // useQuery to state Cart
  //fetch cart data
  const fetchCartData = async () => {
    try {
      if (!UserId._id) {
        return;
      }
      const res = await axios.post(`${URL}/customer/get-cart`,
        {
          UserId: UserId._id
        },
        { withCredentials: true },
      );
      const data = res.data;
      console.log("data", data);
      return data;
    } catch (err) {
      console.log(err);
    }
  };
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCartData,
    enabled: cartInView,
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 30,
  });

  const handlePopUpSearch = () => {
    setPopUpSearch(!popUpSearch);
  };
  const handleShowCanvasCart = () => {
    if (UserId._id) {
      setShowCanvasCart(!showCanvasCart);
    }
  };

  const handleSubmitSearch = () => {
    filterData();
    navigate(`/Ecommerce/search?name=${search || ""}&category=${category_id || ""}`);
  }
  //console.log("hello")
  return (
    <>
      <Container fluid>
        <Row
          className=" py-2 d-flex align-items-center"
          style={{ borderBottom: "1px solid #f7f7f7" }}
        >
          {/* Responsive __sm md lg__ */}
          {/* Logo */}
          <Col
            sm={4}
            lg={2}
            className="order-lg-1 d-flex justify-content-md-start justify-content-center"
          >
            <div className="container-logo ">
              <a href="/Ecommerce/home">
                <img src={image} alt="logo" width={"auto"} height={"100px"} />
              </a>
            </div>
          </Col>
          {/* Sreach on header , hidden on sm */}
          <Col
            md={12}
            lg={6}
            className="d-none d-md-block d-lg-block order-md-last order-lg-2"
          >
            <Row className="search-bar p-2 my-2 bg-light rounded-4 align-items-center">
              {/* Có thể chừa ra 1 khoảng trống nhỏ trái/phải khi ở md */}
              <Col md={1} className="d-md-block d-lg-none"></Col>

              {/* Ô nhập liệu */}
              <Col md={10} lg={10}>
                <Form id="search-form">
                  <Form.Control
                    type="text"
                    className="border-0 bg-transparent"
                    placeholder="Search for more than 20,000 products"
                    value={search || ""}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Form>
              </Col>

              {/* Icon tìm kiếm - có thể click */}
              <Col
                md={1}
                lg={2}
                onClick={() => handleSubmitSearch()}
                className="text-center"
                style={{ cursor: "pointer" }}
              >
                <i className="fa-solid fa-magnifying-glass fs-4 pt-2"></i>
              </Col>

              {/* Khoảng trắng phải nếu cần ở md */}
              <Col md={1} className="d-md-block d-lg-none"></Col>
            </Row>
          </Col>

          {/* Icon right header */}
          <Col
            sm={8}
            lg={4}
            className="order-lg-3 d-flex justify-content-sm-end align-items-center mt-4 mt-sm-0 justify-content-center "
          >
            <ul className="d-flex justify-content-end list-unstyled m-0 gap-2">
              <li>
                <a
                  href="/Ecommerce/login"
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light text-decoration-none"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="fa-solid fa-right-to-bracket text-black fs-4"></i>
                </a>
              </li>
              <li>
                <a
                  href="/Ecommerce/user/profile"
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light text-decoration-none"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="fa-regular fa-user text-black fs-4"></i>
                </a>
              </li>
              <li>
                <a
                  href="/Ecommerce/seller/seller-register"
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light text-decoration-none"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="fa-solid fa-shop text-black fs-4"></i>
                </a>
              </li>
              <li className="d-md-none" onClick={handlePopUpSearch}>
                <a
                  href="/Ecommerce/search/hello"
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light text-decoration-none"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i class="fa-solid fa-magnifying-glass text-black fs-4"></i>
                </a>
              </li>
              <li className="d-lg-none" onClick={handleShowCanvasCart}>
                <a
                  href="/"
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light text-decoration-none"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="fa-solid fa-cart-shopping text-black fs-4"></i>
                </a>
              </li>
            </ul>
            {/* Cart dropdown */}
            <div
              className="d-none d-lg-flex flex-column gap-2 lh-1 border-0 p-0 ms-5"
              onClick={handleShowCanvasCart}
            >
              <span className="fs-6 text-muted">Your Cart</span>
              <span className="cart-total fs-5 fw-bold">$1290.00</span>
            </div>
          </Col>
        </Row>

        {popUpSearch && (
          <>
            <Row className="d-block d-md-none">
              <div className=" row search-bar p-2 my-2 rounded-3">
                <Col xs={1} className="d-block d-lg-none"></Col>
                <Col xs={3} className=" bg-light p-2">
                  {/* <Form.Select className="bg-transparent border-0 ">
                    <option>All Categories</option>
                    <option>Groceries</option>
                    <option>Drinks</option>
                    <option>Chocolates</option>
                  </Form.Select> */}
                </Col>
                <Col xs={6} className=" bg-light p-2">
                  <Form id="search-form" className="text-center">
                    <Form.Control
                      type="text"
                      className="border-0 bg-transparent"
                      placeholder="Search for more than 20,000 products"
                    />
                  </Form>
                </Col>
                <Col
                  xs={1}
                  className=" bg-light p-2"
                  onClick={() => navigate("/Ecommerce/search/hello")}
                >
                  <i className="fa-solid fa-magnifying-glass fs-4 pt-2"></i>
                </Col>
                <Col xs={1} className="d-block d-lg-none"></Col>
              </div>
            </Row>
          </>
        )}
      </Container>
      <Offcanvas
        show={showCanvasCart}
        onHide={handleShowCanvasCart}
        placement="end"
      >
        <Offcanvas.Header className="d-flex justify-content-between">
          <Offcanvas.Title>You Cart</Offcanvas.Title>
          <div
            className="bg-warning  d-flex justify-content-center align-items-center rounded-circle"
            style={{ width: "40px", height: "40px" }}
          >
            <span className="total item text-white p-0">0</span>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body className="h-100 d-flex flex-column" ref={cartRef}>
          <div className="flex-grow-1 overflow-auto">
            <ListGroup>
              {cartLoading ? (
                <p>Loading Cart Items .. </p>
              ) : (
                <>
                 {(cartData?.Items || []).map((item, itemIndex) => (
                    (item.ProductVariant || []).map((variant, variantIndex) => (
                      <ListGroup.Item
                        className="px-1 border-0 border-bottom"
                        key={`${itemIndex}-${variantIndex}`}
                      >
                      <div className="d-flex gap-3">
                        <img
                          src={variant.Image}
                          alt=""
                          className="p-0 m-0"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="overflow-hidden flex-1">
                          <p
                            className="product-name text-nowrap text-truncate"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {item.ProductName} : <span className="fw-light text-muted">{variant.ProductVariantName}</span>
                          </p>
                        </div>
                        <p
                          className="product-price"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {variant.Price? variant.Price.toLocaleString("vi-VN") : "0".toLocaleString("vi-VN")}
                        </p>
                        </div>
                      </ListGroup.Item>
                    )
                    )
                  ))}

                </>
              )}
            </ListGroup>
          </div>
          <div className="p-3 border-top mb-auto">
            <button
              className="btn bg-warning w-100 text-white fw-bold"
              onClick={() => navigate("/Ecommerce/user/cart")}
            >
              XEM GIỎ HÀNG
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};
export default Header;
