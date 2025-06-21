
import logo from "../../assets/images/logo_page.jpg"
import { Form } from 'react-bootstrap'
const Cart = () => {
  return (
    <div className="container-fluid bg-light vh-100">
          <header className="bg-white p-2">
              <div className="container d-flex justify-content-between">
                  <div className="header-left d-flex gap-3 align-items-center">
                      <img src={logo} width={"80px"} height={"80px"} />
                      <div className="vertical-line bg-warning" style={{ width: "2px", height: "50px" }}></div>
                      <p className="title p-0 m-0 text-warning fw-bold">GIỎ HÀNG</p>
                  </div>
                  <div className="header-right d-flex align-items-center">
                      <form className="d-flex" role="search">
                          <input
                              type="text"
                              id="search"
                              className="form-control border-end-0 rounded-0 rounded-start"
                              placeholder="Tìm kiếm..."
                              width={"150px"}
                              style={{ width: '250px' }}
                          />
                          <button className="bg-warning border-start-0 border-0 px-4 rounded-end">
                              <i className="fa-solid fa-magnifying-glass text-white"></i>
                          </button>
                      </form>
                  </div>
              </div>
          </header>
          <main className="container">
            <div className="title d-flex align-items-center text-muted text-nowrap bg-white mt-2 py-3 px-1 rounder">
                <div className="mx-3"><Form.Check type="checkbox" /></div>
                <div className="flex-grow-1"><p className="mb-0">Sản phẩm</p></div>
                <div className="flex-shrink-0" style={{ flexBasis: "15%", textAlign: "center" }}><p className="mb-0">Đơn giá</p></div>
                <div className="flex-shrink-0" style={{ flexBasis: "15%", textAlign: "center" }}><p className="mb-0">Số lượng</p></div>
                <div className="flex-shrink-0" style={{ flexBasis: "15%", textAlign: "center" }}><p className="mb-0">Số tiền</p></div>
                <div className="flex-shrink-0" style={{ flexBasis: "10%", textAlign: "center" }}><p className="mb-0">Thao tác</p></div>
            </div>
          </main>
    </div>
  )
}

export default Cart