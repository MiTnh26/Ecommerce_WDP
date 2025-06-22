import { Button, Form, Card } from 'react-bootstrap';
import StarVoting from '../../components/public/StarVoting';
import CardCustom from '../../components/homePage/Card';
import Pagination from '../../components/public/Pagination';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const brands = [
  { id: 1, name: "brands1" },
  { id: 2, name: "brands2" },
  { id: 3, name: "brands3" },
  { id: 4, name: "brands4" },
];

const whereToBuy = [
  { id: 1, name: "whereToBuy1" },
  { id: 2, name: "whereToBuy2" },
  { id: 3, name: "whereToBuy3" },
  { id: 4, name: "whereToBuy4" },
];

const ProductList = () => {
    const [currentPage, setCurrentPage] = useState(1);
      // navigate
  const navigate = useNavigate();
  return (
    <div className="container-fluid py-3">
      <div className="row">
        <div className="col-2">
          <aside className="bg-white p-3 rounded shadow-sm">
            <h6 className="text-warning fw-bold mb-3">
              <i className="fa-solid fa-filter me-2"></i>BỘ LỌC TÌM KIẾM
            </h6>

            {/* Brands */}
            <Card className="mb-3 border-0 border-bottom">
              <Card.Body className="p-0">
                <Card.Title className="fs-6 text-muted mb-2">Theo brands</Card.Title>
                <div className="list-group list-group-flush">
                  {brands.map((brand) => (
                    <div key={brand.id} className="list-group-item px-0 py-1 border-0">
                      <Form.Check
                        type="checkbox"
                        label={<span className="ms-1 small">{brand.name}</span>}
                      />
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Where to buy */}
            <Card className="mb-3 border-0 border-bottom">
              <Card.Body className="p-0">
                <Card.Title className="fs-6 text-muted mb-2">Theo Nơi Bán</Card.Title>
                <div className="list-group list-group-flush">
                  {whereToBuy.map((wtb) => (
                    <div key={wtb.id} className="list-group-item px-0 py-1 border-0">
                      <Form.Check
                        type="checkbox"
                        label={<span className="ms-1 small">{wtb.name}</span>}
                      />
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {/* Price range */}
            <Card className="mb-3 border-0 border-bottom">
              <Card.Body className="p-0">
                <Card.Title className="fs-6 text-muted mb-2">Theo Giá</Card.Title>
                <Form>
                  <Form.Group className="mb-2">
                    <Form.Label className="form-text mb-1">Từ</Form.Label>
                    <Form.Control size="sm" type="number" placeholder="VNĐ" />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label className="form-text mb-1">Đến</Form.Label>
                    <Form.Control size="sm" type="number" placeholder="VNĐ" />
                  </Form.Group>
                  <Button
                    variant="warning"
                    size="sm"
                    className="rounded-0 w-100 mt-2"
                  >
                    Áp Dụng
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* Rating */}
            <Card className="mb-2 border-0 border-bottom">
              <Card.Body className="p-0">
                <Card.Title className="fs-6 text-muted mb-2">Theo Đánh Giá</Card.Title>
                <div className="d-flex flex-column gap-2">
                  {[5, 4, 3].map((rating) => (
                    <StarVoting key={rating} rating={rating} />
                  ))}
                </div>
              </Card.Body>
            </Card>
          </aside>
        </div>

        {/* Main content */}
              <div className="col-10">
                  <main className="bg-white p-3 rounded shadow-sm">
                      <div className="d-flex flex-wrap gap-2 justify-content-start">
                          {[...Array(20)].map((_, index) => (
                              <div
                                  key={index}
                                  className="product-item bg-white border rounded text-center p-2"
                                  style={{ width: 'calc(25% - 8px)' }}
                                  onClick={() => navigate('/Ecommerce/product-detail/1')}
                              >
                                  <CardCustom />
                              </div>
                          ))}
                      </div>
                  </main>
                  <div className="panigation">
                    <Pagination currentPage={currentPage} totalPages={10} onPageChange={(page) => setCurrentPage(page)}/>
                  </div>
              </div>
      </div>
    </div>
  );
};

export default ProductList;
