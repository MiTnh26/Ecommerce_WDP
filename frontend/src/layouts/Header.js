import React, { useState } from "react";
import {
  Col,
  Container,
  Row,
  Form,
  Offcanvas,
  ListGroup,
} from "react-bootstrap";
import image from "../assets/images/logo_page.jpg";
const Header = () => {
  const [popUpSearch, setPopUpSearch] = useState(false);
  const [showCanvasCart, setShowCanvasCart] = useState(false);

  const handlePopUpSearch = () => {
    setPopUpSearch(!popUpSearch);
  };
  const handleShowCanvasCart = () => {
    setShowCanvasCart(!showCanvasCart);
  };
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
            className="d-none d-md-block d-lg-block order-md-last order-lg-2 "
          >
            <div className="row search-bar p-2 my-2 bg-light rounded-4 ">
              <Col md={1} lg={0} className="d-block d-lg-none"></Col>
              <Col md={3} lg={4}>
                <Form.Select className="bg-transparent border-0 ">
                  <option>All Categories</option>
                  <option>Groceries</option>
                  <option>Drinks</option>
                  <option>Chocolates</option>
                </Form.Select>
              </Col>
              <Col md={6} lg={7}>
                <Form id="search-form" className="text-center">
                  <Form.Control
                  
                    type="text"
                    className="border-0 bg-transparent"
                    placeholder="Search for more than 20,000 products"
                  />
                </Form>
              </Col>
              <Col md={1} lg={1}>
                <i className="fa-solid fa-magnifying-glass fs-4 pt-2"></i>
              </Col>
              <Col md={1} lg={0} className="d-block d-lg-none"></Col>
            </div>
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
                  href="/"
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light text-decoration-none"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="fa-regular fa-user text-black fs-4"></i>
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light text-decoration-none"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="fa-regular fa-heart text-black fs-4"></i>
                </a>
              </li>
              <li className="d-md-none" onClick={handlePopUpSearch}>
                <a
                  href="/"
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
                  <Form.Select className="bg-transparent border-0 ">
                    <option>All Categories</option>
                    <option>Groceries</option>
                    <option>Drinks</option>
                    <option>Chocolates</option>
                  </Form.Select>
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
                <Col xs={1} className=" bg-light p-2">
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
            <span className="text-white p-0">0</span>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup>
            <ListGroup.Item className="px-0">
              <div className="d-flex gap-2">
                <img
                  src={image}
                  alt=""
                  className="p-0 m-0"
                  style={{ width: "80px", height: "80px" }}
                />
                <div className="inforItem d-flex">
                  <div className="">
                    <p>Product Name</p>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};
export default Header;
