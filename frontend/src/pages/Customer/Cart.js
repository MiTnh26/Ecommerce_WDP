import logo from "../../assets/images/logo_page.jpg";
import cartList from "../../style/product/cartList.css";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import "../../style/CartDetail.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { AppContext } from "../../store/Context";
import { useContext } from "react";


const Cart = () => {
  const [checkedItems, setCheckedItems] = useState([]); // chứa id của các variant được chọn
  const [data, setData] = useState([]);
  const [totalCart, setTotalCart] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { checkOut, setCheckOut } = useContext(AppContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user._id) {
          navigate("/Ecommerce/login");
        }
        const res = await axios.post("http://localhost:5000/customer/get-cart",
          {
            UserId: user._id
          },
          { withCredentials: true },
        );
        const data = res.data;
        console.log("data", data);
        setData(data);
        // Tính tổng số item trong ProductVariant
        const total = data.Items.reduce((sum, item) => {
          if (Array.isArray(item.ProductVariant)) {
            return sum + item.ProductVariant.length;
          }
          return sum;
        }, 0);

        setTotalCart(total);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [])

  const [showClassification, setShowClassification] = useState(false);
  const navigate = useNavigate();

  const handleOpenClassification = () => {
    setShowClassification(true);
  };
  const handleCloseClassification = () => {
    setShowClassification(false);
  };

  // handle delete
  const handleDeleteProduct = async (Product_id, ProductVariant) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log("Data Test", Product_id, ProductVariant, user._id);
      if (!Product_id || !ProductVariant) {
        Alert("Delete fail by invalid data");
      }
      if (!user._id) {
        navigate("/Ecommerce/login");
      }
      const res = await axios.delete("http://localhost:5000/customer/remove-p-variant-cart", {
        data: {
          UserId: user._id,
          Product_id: Product_id,
          ProductVariant: { _id: ProductVariant }
        },
        withCredentials: true,
      });
      if (res.status === 200) {
        window.alert("Delete success");
        // Tạo object mới hoàn toàn
        const filteredItems = data.Items
          .map((item) => ({
            ...item,
            ProductVariant: item.ProductVariant.filter(
              (variant) => variant._id !== ProductVariant
            ),
          }))
          .filter((item) => item.ProductVariant.length > 0);

        setData({
          ...data,
          Items: filteredItems,
        });
        console.log({
          ...data,
          Items: filteredItems,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  // handle click check box
const handleCheck = ({ name, ShopId, Product_Id, ProductVariant_id, Quantity, Price }) => {
  if (name === "all") {
    const allVariants = data.Items.flatMap(item =>
      item.ProductVariant.map(variant => ({
        ShopId: item.ShopID._id,
        Product_Id: item._id,
        ProductVariant_id: variant._id,
        Quantity: variant.Quantity,
        Price: variant.Price
      }))
    );

    const allSelected = allVariants.every(variant =>
      checkedItems.some(checked => checked.ProductVariant_id === variant.ProductVariant_id)
    );

    setCheckedItems(allSelected ? [] : allVariants);
  }

  if (name === "shop") {
    const shopItem = data.Items.find(item => item.ShopID._id === ShopId);
    if (!shopItem) return;

    const shopVariants = shopItem.ProductVariant.map(variant => ({
      ShopId,
      Product_Id: shopItem._id,
      ProductVariant_id: variant._id,
      Quantity: variant.Quantity,
      Price: variant.Price
    }));

    const allSelected = shopVariants.every(variant =>
      checkedItems.some(checked => checked.ProductVariant_id === variant.ProductVariant_id)
    );

    if (allSelected) {
      // Bỏ hết các variant thuộc shop này
      setCheckedItems(prev =>
        prev.filter(item => item.ShopId !== ShopId)
      );
    } else {
      // Thêm vào (loại bỏ duplicate)
      setCheckedItems(prev => {
        const existingIds = new Set(prev.map(i => i.ProductVariant_id));
        const newItems = shopVariants.filter(v => !existingIds.has(v.ProductVariant_id));
        return [...prev, ...newItems];
      });
    }
  }

  if (name === "productVariant") {
    const exists = checkedItems.some(item => item.ProductVariant_id === ProductVariant_id);

    if (exists) {
      setCheckedItems(prev =>
        prev.filter(item => item.ProductVariant_id !== ProductVariant_id)
      );
    } else {
      setCheckedItems(prev => [
        ...prev,
        { ShopId, Product_Id, ProductVariant_id, Quantity, Price }
      ]);
    }
  }
};
  const calculateTotalPriceChecked = () => {
    const totalPrice = checkedItems.reduce(
      (sum, item) => sum + (item.Quantity * item.Price),
      0
    );
    return totalPrice;
  }
    
  //handle checkout
  const handlecheckOut = () => {
    const dataCheckOut = {
      UserId: JSON.parse(localStorage.getItem("user"))._id,
      Items: checkedItems,
      TotalPrice: calculateTotalPriceChecked()
    }
    console.log("dataCheckOut", dataCheckOut);
    setCheckOut(dataCheckOut);
    navigate("/Ecommerce/user/checkout")
  }

  useEffect(() => {
  const newTotal = calculateTotalPriceChecked();
  setTotalPrice(newTotal);
}, [checkedItems]);
  //console.log("checkedItems", checkedItems);
  return (
    <div className="w-100 bg-light vh-100 overflow-auto">
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
      <main className="container-sm" style={{ paddingBottom: "80px" }}>
        <div className="cart-header d-flex align-items-center text-muted text-nowrap bg-white mt-2 py-3 px-1 rounder overflow-auto  rounded">
          <div className="mx-3">
            <Form.Check
              type="checkbox"
              onChange={() => handleCheck({ name: "all" })}
              checked={
                data.Items?.flatMap(item => item.ProductVariant).every(v =>
                  checkedItems.some(c => c.ProductVariant_id === v._id)
                )
              }
            />

          </div>
          <div className="flex-grow-1">
            <p className="mb-0">Product</p>
          </div>
          <div className="flex-shrink-0 flex-basic-15 text-center">
            <p className="mb-0">Price</p>
          </div>
          <div className="flex-shrink-0 flex-basic-15 text-center">
            <p className="mb-0">Quantity</p>
          </div>
          <div className="flex-shrink-0 flex-basic-15 text-center">
            <p className="mb-0">Total Price</p>
          </div>
          <div className="flex-shrink-0 flex-basic-10 text-center">
            <p className="mb-0">Action</p>
          </div>
        </div>
        <div className="cart-body bg-white mt-2 overflow-auto">
          {data.Items?.map((item, index) => (
            <div className="cart-item rounded mb-2" key={item._id}>
              <div className="chosse-all-in-shop d-flex py-2 px-1 position-relative">
                <Form.Check
                  type="checkbox"
                  onChange={() => handleCheck({ name: "shop", ShopId: item.ShopID._id })}
                  checked={
                    item.ProductVariant.every(v =>
                      checkedItems.some(c => c.ProductVariant_id === v._id)
                    )
                  }
                />


                <div className="flex-grow-1"><p className="mb-0">Shop : {item.ShopID?.name}</p></div>
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
              {item?.ProductVariant?.map((variant, index) => (
                <div className="d-flex align-items-center text-muted text-nowrap bg-white mt-2 py-3 px-1  overflow-auto " key={index}>
                  <Form.Check
                    type="checkbox"
                    onChange={() =>
                      handleCheck({
                        name: "productVariant",
                        ShopId: item.ShopID._id,
                        Product_Id: item._id,
                        ProductVariant_id: variant._id,
                        Quantity: variant.Quantity,
                        Price: variant.Price
                      })
                    }
                    checked={checkedItems.some(v => v.ProductVariant_id === variant._id)}
                  />


                  <div className="flex-grow-1 d-flex gap-3">
                    <img src={variant.Image} alt="img product" width={"80px"} height={"80px"} />
                    <p className="product-name text-wrap p-0 m-0" style={{ flexBasis: '50%', flexShrink: 0 }}>{item.ProductName}</p>
                    <p className="classification text-muted p-0 m-0 " style={{ flexBasis: '20%', flexShrink: 0 }} onClick={() => handleOpenClassification(true)}>{variant.ProductVariantName}</p>
                  </div>
                  <div className="flex-shrink-0 flex-basic-15 text-center">
                    <p className="discount-price align-self-center p-0 m-0">{variant.Price.toLocaleString("vi-VN")}</p></div>
                  <div className="flex-shrink-0 flex-basic-15 text-center">
                    <div className="quantity-inputt d-flex justify-content-center">
                      <button className="border bg-white p-1 px-2 ">-</button>
                      <input type="number" className="border bg-white py-1 px-2 text-center border-start-0 border-end-0 input-no-spinner" style={{ width: '40px' }} value={variant.Quantity} />
                      <button className="border bg-white p-1 px-2 text-muted fw-light">+</button>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex-basic-15 text-center"><p className="total-price p-0 m-0 text-danger">{(variant.Price * variant.Quantity).toLocaleString("vi-VN")}</p></div>
                  <div className="flex-shrink-0 flex-basic-10 text-center" >
                    <button className="btn btn-outline-danger" onClick={() => handleDeleteProduct(item._id, variant._id)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>
      </main>
      <footer className="container-sm bg-white fixed-bottom shadow ">
        <div className="d-flex gap-5 justify-content-end align-items-center py-3">
          {/* <div className="mx-3">
            <Form.Check type="checkbox" label={`Chosse all (${totalCart})`} />
          </div> */}
          <div className="d-flex gap-3 align-items-center">
            <p className="total-price p-0 m-0">
              Total Price: {totalPrice}
              <span className="text-danger">{ }</span>
            </p>
            <Button
              variant="outline-warning px-5 rounded-0"
              onClick={() => handlecheckOut()}
            >
              BUY NOW
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
