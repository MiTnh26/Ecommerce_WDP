import logo from "../../assets/images/logo_page.jpg";
import image_default from "../../assets/images/img_default.jpg";
import { Button, Form, Modal } from "react-bootstrap";
import "../../style/CartDetail.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const color = [
  { id: 1, name: "default", color: image_default },
  { id: 2, name: "default1", color: logo },
  { id: 3, name: "default2", color: image_default },
  { id: 4, name: "default3", color: image_default },
];
const size = [
  { id: 1, name: "default", color: image_default },
  { id: 2, name: "default1", color: logo },
  { id: 3, name: "default2", color: image_default },
  { id: 4, name: "default3", color: image_default },
  { id: 5, name: "default4", color: image_default },
  { id: 6, name: "default5", color: image_default },
  { id: 7, name: "default6", color: image_default },
];
const count = 5;

const Cart = () => {
  const [showClassification, setShowClassification] = useState(false);
  const navigate = useNavigate();

  const handleOpenClassification = () => {
    setShowClassification(true);
  };
  const handleCloseClassification = () => {
    setShowClassification(false);
  };

  return (
    <div className="w-100 bg-light vh-100">
      <header className="">
        <div className="header-top bg-warning">
          <div className="container d-flex justify-content-between py-1 align-items-center">
            <a
              className=" text-decoration-none text-white"
              href="/Ecommerce/home"
            >
              Home
            </a>
            <div className="d-flex align-items-center">
              <img
                src={logo}
                width={"30px"}
                height={"30px"}
                className="rounded-circle me-1"
                alt="img account"
              />
              <a
                className=" text-decoration-none text-white"
                href="/Ecommerce/user/profile"
              >
                Name Account
              </a>
            </div>
          </div>
        </div>
        <div className="header-bottom bg-white p-2">
          <div className="container d-flex justify-content-between flex-wrap overflow-hidden align-items-center">
            <div className="header-bottom-left d-flex gap-3 align-items-center">
              <img
                src={logo}
                width={"80px"}
                height={"80px"}
                alt="img product"
              />
              <div
                className="vertical-line bg-warning"
                style={{ width: "2px", height: "50px" }}
              ></div>
              <p className="title p-0 m-0 text-warning fw-bold">GIỎ HÀNG</p>
            </div>
            <form
              className="header-bottom-right d-flex "
              style={{ width: "100%", maxWidth: "350px" }}
            >
              <input
                type="text"
                id="search"
                className="form-control border-end-0 rounded-0 rounded-start "
                placeholder="Tìm kiếm..."
              />
              <button className="bg-warning border-start-0 border-0 px-4 rounded-end">
                <i className="fa-solid fa-magnifying-glass text-white"></i>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-sm">
        <div className="cart-header d-flex align-items-center text-muted text-nowrap bg-white mt-2 py-3 px-1 rounder overflow-auto  rounded">
          <div className="mx-3">
            <Form.Check type="checkbox" />
          </div>
          <div className="flex-grow-1">
            <p className="mb-0">Sản phẩm</p>
          </div>
          <div className="flex-shrink-0 flex-basic-15 text-center">
            <p className="mb-0">Đơn giá</p>
          </div>
          <div className="flex-shrink-0 flex-basic-15 text-center">
            <p className="mb-0">Số lượng</p>
          </div>
          <div className="flex-shrink-0 flex-basic-15 text-center">
            <p className="mb-0">Số tiền</p>
          </div>
          <div className="flex-shrink-0 flex-basic-10 text-center">
            <p className="mb-0">Thao tác</p>
          </div>
        </div>
        <div className="cart-body bg-white mt-2">

          <div className="cart-item rounded border-bottom mb-2">
            <div className="d-flex align-items-center text-muted text-nowrap bg-white mt-2 py-3 px-1  overflow-auto ">
              
              <div className="cart-body bg-white mt-2">
                <div className="cart-item rounded mb-2">
                      <div className="chosse-all-in-shop d-flex py-2 px-1 position-relative">
                          <div className="mx-3"><Form.Check type="checkbox" /></div>
                          <div className="flex-grow-1"><p className="mb-0">Name Shop Lorem ipsum dolor sit</p></div>
                          {/* Đường kẻ 90% nằm dưới */}
                          <div
                              className="position-absolute"
                              style={{
                                  width: '95%',
                                  borderBottom: '1px solid #dee2e6',
                                  bottom: 0,
                                  left: '50%',
                                  transform: 'translateX(-50%)',                           
                              }}
                          ></div>
                      </div>
                  <div className="d-flex align-items-center text-muted text-nowrap bg-white mt-2 py-3 px-1  overflow-auto ">
                      <div className="mx-3"><Form.Check type="checkbox" /></div>
                      <div className="flex-grow-1 d-flex gap-3">
                          <img src={logo} alt="img product" width={"80px"} height={"80px"} />
                          <p className="product-name text-wrap p-0 m-0">Sản phẩm: Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta voluptatibus Soll</p>
                          <p className="classification text-muted p-0 m-0" onClick={() => handleOpenClassification(true)}>Color, size</p>
                      </div>
                      <div className="flex-shrink-0 flex-basic-15 text-center">
                          <span className="original-price text-muted text-decoration-line-through">15000</span>
                          <p className="discount-price">10000</p></div>
                      <div className="flex-shrink-0 flex-basic-15 text-center">
                          <div className="quantity-inputt d-flex justify-content-center">
                              <button className="border bg-white p-1 px-2 ">-</button>
                              <input type="number" className="border bg-white py-1 px-2 text-center border-start-0 border-end-0 no-spinner" style={{ width: '40px' }} />
                              <button className="border bg-white p-1 px-2 text-muted fw-light">+</button>
                          </div>
                      </div>
                      <div className="flex-shrink-0 flex-basic-15 text-center"><p className="total-price p-0 m-0 text-danger">10000</p></div>
                      <div className="flex-shrink-0 flex-basic-10 text-center" ><button className="btn btn-outline-danger"><i className="fa-solid fa-trash"></i></button></div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
      <footer className="container-sm bg-white fixed-bottom shadow">
        {/* <div className="d-flex gap-5 justify-content-end align-items-center py-3 border-bottom">
                <p className="ez-voucher text-warning p-0 m-0"><i className="fa-solid fa-ticket "></i> EZ Voucher</p>
                <p className="option-choose-voucher text-primary p-0 m-0">Chọn hoặc nhập mã</p>
            </div> */}
        <div className="d-flex gap-5 justify-content-between align-items-center py-3">
          <div className="mx-3">
            <Form.Check type="checkbox" label={`Chọn tất cả (${count})`} />
          </div>
          <div className="d-flex gap-3 align-items-center">
            <p className="total-price p-0 m-0">
              Tổng cộng({count} Sản Phẩm):{" "}
              <span className="text-danger">0</span>
            </p>
            <Button
              variant="outline-warning px-5 rounded-0"
              onClick={() => navigate("/Ecommerce/user/checkout")}
            >
              Mua hàng
            </Button>
          </div>
        </div>
      </footer>
      <Modal
        show={showClassification}
        onHide={handleCloseClassification}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">Chọn phân loại sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fw-bold p-0 m-0">Color</p>
          <div className="list-item-color d-flex gap-2 flex-wrap overflow-y-auto h-auto">
            {color.map((item) => (
              <button
                key={item.id}
                className="color-item border border-muted bg-white p-1"
                style={{ maxHeight: "38px" }}
              >
                <img
                  src={item.color}
                  alt={item.name}
                  className="object-fit-cover"
                  width={26}
                  height="auto"
                />
                <span className="text-nowrap">{item.name}</span>
              </button>
            ))}
          </div>
          <p className="fw-bold p-0 m-0 mt-3">Size</p>
          <div className="list-item-size d-flex gap-2 flex-wrap overflow-y-auto h-auto">
            {size.map((item) => (
              <button
                key={item.id}
                className="color-item border border-muted bg-white p-1"
                style={{ height: "38px" }}
              >
                <span className="text-nowrap">{item.name}</span>
              </button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Cart;
