import React from "react";
import { Image, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useDataByUrl } from "../../utility/FeatchData";
import { SHOP_API } from "../../api/SellerApi";

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const { data } = useDataByUrl({
    url: SHOP_API.GET_SHOP_INFORMATION + `?owner=${user?._id}`,
    key: "shopInfo",
  });

  const shopInfo = data?.data;


  return (
    <>
      {/* Top Navigation */}
      <Navbar
        expand="lg"
        style={{ backgroundColor: "#FFB366" }}
        className="px-4"
      >
        <Navbar.Brand href="#" className="d-flex align-items-center">
          <Image
            src={shopInfo?.shopAvatar || "/placeholder.svg?height=40&width=40"}
            alt="Profile"
            className="rounded-circle me-2"
            width="40"
            height="40"
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#" className="text-dark fw-semibold">
              Home
            </Nav.Link>
            <Nav.Link href="#" className="text-dark fw-semibold">
              Order
            </Nav.Link>
            <NavDropdown
              title="Product"
              id="product-dropdown"
              className="text-dark fw-semibold"
            >
              <NavDropdown.Item href="#">View Products</NavDropdown.Item>
              <NavDropdown.Item href="#">Add Product</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#" className="text-dark fw-semibold">
              Shop
            </Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link href="#" className="text-dark">
              Back to shopping page
            </Nav.Link>
            <Image 
              src={user?.Image || "/assets/avatar-default.svg?height=35&width=35"}
              alt="User"
              className="rounded-circle ms-2"
              width="35"
              height="35"
            />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default Header;
