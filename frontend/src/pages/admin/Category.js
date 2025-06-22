import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  ButtonGroup,
  Pagination,
  Dropdown,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminLayout from "../../components/admin/AdminLayout";

// Validation schema for the category form
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Category name is required."),
  status: Yup.string()
    .oneOf(["Active", "Inactive"])
    .required("Status is required."),
});

export default function CategoryList() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("A-Z");
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null); // For editing existing category
  const [isSaving, setIsSaving] = useState(false); // Simulate saving state

  // Static categories data
  const [categories, setCategories] = useState([
    { _id: 1, name: "Áo", status: "Active" },
    { _id: 2, name: "Quần", status: "Active" },
  ]);

  // Formik for category form
  const formik = useFormik({
    initialValues: {
      name: editCategory?.name || "",
      status: editCategory?.status || "Active",
    },
    enableReinitialize: true, // Reinitialize when editCategory changes
    validationSchema,
    onSubmit: (values) => {
      setIsSaving(true); // Simulate API call
      setTimeout(() => {
        // Simulate async delay
        if (editCategory) {
          // Update existing category
          setCategories(
            categories.map((cat) =>
              cat._id === editCategory._id ? { ...cat, ...values } : cat
            )
          );
        } else {
          // Add new category
          setCategories([
            ...categories,
            { _id: categories.length + 1, ...values },
          ]);
        }
        setIsSaving(false);
        setShowModal(false);
        setEditCategory(null);
        formik.resetForm();
      }, 1000); // 1-second delay to simulate API
    },
  });

  // Handle status change
  const handleStatusChange = (id, newStatus) => {
    setCategories(
      categories.map((cat) =>
        cat._id === id ? { ...cat, status: newStatus } : cat
      )
    );
  };

  // Filter and sort categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || category.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOrder === "A-Z") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  // Handle opening modal for adding/editing
  const openModal = (category = null) => {
    setEditCategory(category);
    setShowModal(true);
  };

  // Handle closing modal
  const closeModal = () => {
    setShowModal(false);
    setEditCategory(null);
    formik.resetForm();
  };

  return (
    <AdminLayout currentPage="categories" pageTitle="Manage Categories">
      <Container
        fluid
        className="py-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="bg-white rounded shadow-sm p-4">
              {/* Header */}
              <Row className="mb-4">
                <Col>
                  <h2
                    className="text-center mb-4"
                    style={{ color: "#333", fontWeight: "600" }}
                  >
                    View List Category
                  </h2>
                </Col>
              </Row>

              {/* Filter Tabs and Add Button */}
              <Row className="mb-4 align-items-center">
                <Col md={6}>
                  <ButtonGroup>
                    <Button
                      variant={
                        activeTab === "All" ? "success" : "outline-secondary"
                      }
                      onClick={() => setActiveTab("All")}
                      style={{
                        backgroundColor:
                          activeTab === "All" ? "#28a745" : "transparent",
                        borderColor:
                          activeTab === "All" ? "#28a745" : "#6c757d",
                        color: activeTab === "All" ? "white" : "#6c757d",
                      }}
                    >
                      All
                    </Button>
                    <Button
                      variant={
                        activeTab === "Active" ? "success" : "outline-secondary"
                      }
                      onClick={() => setActiveTab("Active")}
                      style={{
                        backgroundColor:
                          activeTab === "Active" ? "#28a745" : "transparent",
                        borderColor:
                          activeTab === "Active" ? "#28a745" : "#6c757d",
                        color: activeTab === "Active" ? "white" : "#6c757d",
                      }}
                    >
                      Active
                    </Button>
                    <Button
                      variant={
                        activeTab === "Inactive"
                          ? "success"
                          : "outline-secondary"
                      }
                      onClick={() => setActiveTab("Inactive")}
                      style={{
                        backgroundColor:
                          activeTab === "Inactive" ? "#28a745" : "transparent",
                        borderColor:
                          activeTab === "Inactive" ? "#28a745" : "#6c757d",
                        color: activeTab === "Inactive" ? "white" : "#6c757d",
                      }}
                    >
                      Inactive
                    </Button>
                  </ButtonGroup>
                </Col>
                <Col md={6} className="text-end">
                  <Button
                    variant="success"
                    style={{
                      backgroundColor: "#28a745",
                      borderColor: "#28a745",
                    }}
                    onClick={() => openModal()}
                  >
                    Add New Category
                  </Button>
                </Col>
              </Row>

              {/* Search and Sort */}
              <Row className="mb-4 align-items-center">
                <Col md={6}>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      placeholder="Search by name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ marginRight: "10px" }}
                    />
                    <Button variant="outline-secondary">Search</Button>
                  </div>
                </Col>
                <Col md={6} className="text-end">
                  <ButtonGroup>
                    <Button
                      variant={
                        sortOrder === "Z-A" ? "warning" : "outline-warning"
                      }
                      onClick={() => setSortOrder("Z-A")}
                      style={{
                        backgroundColor:
                          sortOrder === "Z-A" ? "#ffc107" : "transparent",
                        borderColor: "#ffc107",
                        color: sortOrder === "Z-A" ? "#000" : "#ffc107",
                      }}
                    >
                      Category name Z-A
                    </Button>
                    <Button
                      variant={
                        sortOrder === "A-Z" ? "warning" : "outline-warning"
                      }
                      onClick={() => setSortOrder("A-Z")}
                      style={{
                        backgroundColor:
                          sortOrder === "A-Z" ? "#ffc107" : "transparent",
                        borderColor: "#ffc107",
                        color: sortOrder === "A-Z" ? "#000" : "#ffc107",
                      }}
                    >
                      Category name A-Z
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>

              {/* Table */}
              <Row>
                <Col>
                  <Table responsive className="border">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th
                          style={{
                            padding: "15px",
                            fontWeight: "600",
                            color: "#333",
                          }}
                        >
                          No
                        </th>
                        <th
                          style={{
                            padding: "15px",
                            fontWeight: "600",
                            color: "#333",
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            padding: "15px",
                            fontWeight: "600",
                            color: "#333",
                          }}
                        >
                          Change Status
                        </th>
                        <th
                          style={{
                            padding: "15px",
                            fontWeight: "600",
                            color: "#333",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCategories.map((category, index) => (
                        <tr key={category._id}>
                          <td
                            style={{
                              padding: "15px",
                              color: "#007bff",
                              fontWeight: "500",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td style={{ padding: "15px", color: "#333" }}>
                            {category.name}
                          </td>
                          <td style={{ padding: "15px" }}>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                style={{ minWidth: "100px" }}
                              >
                                {category.status}
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() =>
                                    handleStatusChange(category._id, "Active")
                                  }
                                >
                                  Active
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    handleStatusChange(category._id, "Inactive")
                                  }
                                >
                                  Inactive
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                          <td style={{ padding: "15px" }}>
                            <Button
                              variant="warning"
                              size="sm"
                              style={{
                                backgroundColor: "#ffc107",
                                borderColor: "#ffc107",
                                color: "#000",
                                fontWeight: "500",
                              }}
                              onClick={() => openModal(category)}
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>

              {/* Pagination */}
              <Row className="mt-4">
                <Col className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.Item active>{1}</Pagination.Item>
                  </Pagination>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Category Modal */}
        <Modal show={showModal} onHide={closeModal} size="lg">
          <Form onSubmit={formik.handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>
                {editCategory ? "Edit Category" : "Add New Category"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Category Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      isInvalid={formik.touched.name && !!formik.errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Status *</Form.Label>
                    <Form.Select
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      isInvalid={
                        formik.touched.status && !!formik.errors.status
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.status}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={closeModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving || !formik.isValid}
              >
                {isSaving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : editCategory ? (
                  "Update Category"
                ) : (
                  "Add Category"
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </AdminLayout>
  );
}
