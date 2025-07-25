import { Button, Form, Card } from 'react-bootstrap';
import StarVoting from '../../components/public/StarVoting';
import CardCustom from '../../components/homePage/Card';
import Pagination from '../../components/public/Pagination';
import { useEffect, useState } from 'react';
import { useSearchParams , useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext  } from "../../store/Context";
import { useContext } from "react"; 
import img_empty from "../../assets/images/data-empty.png";
const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();
  const {dataProductFilter, filterData} = useContext(AppContext);
  //console.log("dataProductFilter", dataProductFilter);
  const navigate = useNavigate();
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [nameSearch, setNameSearch] = useState(searchParams.get("name") || "");
  const [whereToBuy, setWhereToBuy] = useState([]);
  const [whereToBuyFilter, setWhereToBuyFilter] = useState([]);
  const [fromPrice, setFromPrice] = useState();
  const [toPrice, setToPrice] = useState();
  const [showAllWTB, setShowAllWTB] = useState(false);

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // fetch data
    setCategory(searchParams.get("category") || "");
    //console.log("category", searchParams.get("category") || "");
    filterData(nameSearch, category);

    // fetch data where to buy
    const loadData = async () => {
      try {
        const res = await axios.get("https://provinces.open-api.vn/api/p/");
        //console.log(res.data);
        setWhereToBuy(res.data);
      } catch (error) {
        console.error("Lỗi khi load province:", error);
      }
    };
    loadData();
  }, [searchParams]);

  //handle change where to buy
  const handleWhereToBuyChange = (event) => {
    if(event.target.checked){
    const datacheck = [...whereToBuyFilter, event.target.value];
    console.log("datacheck", datacheck);
    setWhereToBuyFilter([...whereToBuyFilter, event.target.value]);
    }else{
      const datacheck = whereToBuyFilter.filter(item => item !== event.target.value)
      console.log("datacheck", datacheck);
      setWhereToBuyFilter(whereToBuyFilter.filter(item => item !== event.target.value));
    }
  };
  //handle change from price
  const handleFromPriceChange = (event) => {
    console.log("datacheck",event.target.value);
    setFromPrice(event.target.value);
  };
  //handle change to price
  const handleToPriceChange = (event) => {
    console.log("datacheck", event.target.value);
    setToPrice(event.target.value);
  };
  //handle submit form

 // search, category, fromPrice, toPrice, whereToBuyFilter
    const handleSubmitSearch = () => {
      if(fromPrice > toPrice){
        alert("From price must be less than to price");
        setFromPrice(0);
        setToPrice(0);
        return;
      }
      console.log("before", nameSearch);
      console.log("after",  nameSearch.trim().replace(/\s+/g, " "));
  filterData(
    nameSearch.trim().replace(/\s+/g, " "),
    category,
    fromPrice || undefined,  // Nếu fromPrice là "" hoặc null/undefined → truyền undefined
    toPrice || undefined,    // Tương tự với toPrice
    whereToBuyFilter
  );
};
 const displayed = showAllWTB ? whereToBuy : whereToBuy.slice(0, 6);

  return (
    <div className="container-fluid py-3">
      <div className="row">
        <div className="col-md-2">
          <aside className="bg-white p-3 rounded shadow-sm">
            <h6 className="text-warning fw-bold mb-3">
              <i className="fa-solid fa-filter me-2"></i>BỘ LỌC TÌM KIẾM
            </h6>
            {/* Where to buy */}
            <Card className="mb-3 border-0 border-bottom">
              <Card.Body className="p-0">
                <Card.Title className="fs-6 text-muted mb-2">Where to buy</Card.Title>
                <div className="list-group list-group-flush">
                  {displayed.map((item, index) => (
                    <div key={index} className="list-group-item px-0 py-1 border-0">
                      <Form.Check
                        type="checkbox"
                        label={<span className="ms-1 small">{item.name}</span>}
                        value={item.name}
                        onChange={handleWhereToBuyChange}
                      />
                    </div>
                  ))}
                  <div className="d-flex justify-content-center" onClick={() => setShowAllWTB(!showAllWTB)}>
                    <hr className='flex-grow-1'></hr>
                    <i className="bi bi-chevron-down mt-2" ></i>
                    <hr className='flex-grow-1'></hr>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Price range */}
            <Card className="mb-3 border-0 border-bottom">
              <Card.Body className="p-0">
                <Card.Title className="fs-6 text-muted mb-2">Price range</Card.Title>
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label className="form-text mb-1">From</Form.Label>
                    <Form.Control size="sm" type="number" placeholder="VNĐ" value={fromPrice} onChange={handleFromPriceChange}/>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label className="form-text mb-1">Đến</Form.Label>
                    <Form.Control size="sm" type="number" placeholder="VNĐ" value={toPrice} onChange={handleToPriceChange}/>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
            <Button
              variant="warning"
              size="sm"
              className="rounded-0 w-100 mt-2"
              onClick={handleSubmitSearch}
            >
              Áp Dụng
            </Button>
          </aside>
        </div>

        {/* Main content */}
        <div className="col-md-10">
          {dataProductFilter !== null && dataProductFilter.length ==0 && (
                <div>
                  <img
                    src={img_empty}
                    alt="no data"
                    className="object-fit-cover opacity-50 mx-auto d-block"></img>
                  <p className="text-center text-muted" style={{ fontSize: "0.8rem" }}>Cart is empty</p>
                </div>
              )}
          {dataProductFilter !== null  && dataProductFilter.length > 0 &&
          (
          <div>
          <main className="bg-white p-3 rounded shadow-sm">
            <div className="row g-2">
              {dataProductFilter?.map((item, index) => (
                <div
                  key={index}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <div className="product-item bg-white border rounded text-center p-2 h-100">
                    <CardCustom item={item} />

                  </div>
                </div>
              ))}
            </div>
          </main>
          <div className="panigation">
            <Pagination
              currentPage={currentPage}
              totalPages={
                dataProductFilter && dataProductFilter.length > 0
                  ? Math.ceil(dataProductFilter.length / 20)
                  : 1
              }
              onPageChange={(page) => {
                filterData(
                  nameSearch,
                  category,
                  fromPrice || undefined,  
                  toPrice || undefined,
                  whereToBuyFilter
                );
                setCurrentPage(page)
              }}
            />
          </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
