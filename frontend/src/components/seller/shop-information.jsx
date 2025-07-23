"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Image,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDataByUrl } from "../../utility/FeatchData";
import { SHOP_API } from "../../api/SellerApi";
import { uploadFile } from "../../utility/uploadFile";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

export default function ShopInformation() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");
  const queryClient = useQueryClient();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const { data, isLoading, error } = useDataByUrl({
    url: SHOP_API.GET_SHOP_INFORMATION + `?owner=${user?._id}`,
    key: "shopInfo",
  });

  const shopInfo = data?.data;

  useEffect(() => {
    setPreviewImage(shopInfo?.shopAvatar || null);
  }, [shopInfo]);

  // Fetch provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(setProvinces);
  }, []);

  // Khi mở modal edit, nếu đã có địa chỉ, tự động load và set sẵn district và ward theo địa chỉ cũ của shop.
  useEffect(() => {
    if (showEditModal && shopInfo?.address && provinces.length > 0) {
      setSelectedProvince(shopInfo.address.province || "");
      // Tìm province object
      const provinceObj = provinces.find(p => p.name === shopInfo.address.province);
      if (provinceObj) {
        fetch(`https://provinces.open-api.vn/api/p/${provinceObj.code}?depth=2`)
          .then(res => res.json())
          .then(data => {
            setDistricts(data.districts || []);
            setSelectedDistrict(shopInfo.address.district || "");
            // Tìm district object
            const districtObj = data.districts.find(d => d.name === shopInfo.address.district);
            if (districtObj) {
              fetch(`https://provinces.open-api.vn/api/d/${districtObj.code}?depth=2`)
                .then(res => res.json())
                .then(data2 => {
                  setWards(data2.wards || []);
                  setSelectedWard(shopInfo.address.ward || "");
                });
            } else {
              setWards([]);
              setSelectedWard("");
            }
          });
      } else {
        setDistricts([]);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
      }
    }
  }, [showEditModal, shopInfo, provinces]);

  // Khi chọn tỉnh
  const handleProvinceChange = async (e) => {
    const name = e.target.value;
    setSelectedProvince(name);
    setSelectedDistrict("");
    setSelectedWard("");
    const selected = provinces.find(p => p.name === name);
    if (!selected) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const res = await fetch(`https://provinces.open-api.vn/api/p/${selected.code}?depth=2`);
    const data = await res.json();
    setDistricts(data.districts || []);
    setWards([]);
  };

  // Khi chọn quận/huyện
  const handleDistrictChange = async (e) => {
    const name = e.target.value;
    setSelectedDistrict(name);
    setSelectedWard("");
    const selected = districts.find(d => d.name === name);
    if (!selected) {
      setWards([]);
      return;
    }
    const res = await fetch(`https://provinces.open-api.vn/api/d/${selected.code}?depth=2`);
    const data = await res.json();
    setWards(data.wards || []);
  };

  // Khi chọn xã/phường
  const handleWardChange = (e) => {
    const name = e.target.value;
    setSelectedWard(name);
  };

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (payload) => axios.put(SHOP_API.UPDATE_SHOP_PROFILE, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopInfo"] });
      setShowEditModal(false);
      setPreviewImage(null);
    },
    onError: (error) => {
      console.error("Error updating shop information:", error);
      alert("Failed to update shop information. Please try again later.");
    },
  });

  const formik = useFormik({
    initialValues: {
      _id: shopInfo?._id,
      name: shopInfo?.name || "",
      description: shopInfo?.description || "",
      status: shopInfo?.status || "Pending",
      shopAvatar: shopInfo?.shopAvatar || null,
      // Không cần address ở đây, sẽ lấy từ state khi submit
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Shop name is required."),
      description: Yup.string().trim().required("Description is required."),
      status: Yup.string()
        .oneOf(["Pending", "Active", "Banned"])
        .required("Status is required."),
    }),
    onSubmit: (values) => {
      const dataToSend = {
        ...values,
        owner: shopInfo?.owner,
        address: {
          province: selectedProvince,
          district: selectedDistrict,
          ward: selectedWard
        }
      };
      console.log("DATA TO SEND:", dataToSend);
      mutate(dataToSend);
    },
  });

  const handleImageChange = async (e) => {
    const file = e.currentTarget.files[0];

    try {
      const base64 = await uploadFile(
        file,
        ALLOWED_IMAGE_TYPES,
        MAX_IMAGE_SIZE
      );
      formik.setFieldValue("shopAvatar", base64);
      setPreviewImage(base64);
    } catch (errorMessage) {
      alert(errorMessage);
      formik.setFieldValue("shopAvatar", null);
      setPreviewImage(null);
    }
  };

  if (isLoading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    console.log(error);

    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Error loading shop information. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="text-center mb-5">🛍️ Shop Information</h2>

      <Row className="justify-content-center">
        <Col md={7}>
          <Card className="shadow rounded-4">
            <Card.Body className="text-center p-4">
              <Image
                src={shopInfo?.shopAvatar || "/placeholder.svg"}
                roundedCircle
                width="160"
                height="160"
                style={{ objectFit: "cover", border: "3px solid #ddd" }}
                className="mb-4"
              />

              <h4 className="mb-3">{shopInfo?.name}</h4>
              <p className="text-muted">{shopInfo?.description}</p>
              {/* Hiển thị địa chỉ shop */}
              {shopInfo?.address && (
                <div className="mb-3">
                  <span className="fw-semibold">Địa chỉ: </span>
                  <span>{[shopInfo.address.ward, shopInfo.address.district, shopInfo.address.province].filter(Boolean).join(", ")}</span>
                </div>
              )}
              <Button
                variant="primary"
                className="px-4 mt-2"
                onClick={() => setShowEditModal(true)}
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Edit Shop"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Form onSubmit={formik.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Shop Information</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {isError && (
              <Alert variant="danger">
                Error updating shop information. Please try again.
              </Alert>
            )}

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Shop Name *</Form.Label>
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
                    isInvalid={formik.touched.status && !!formik.errors.status}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Banned">Banned</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.status}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                isInvalid={
                  formik.touched.description && !!formik.errors.description
                }
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Địa chỉ: Tỉnh/Thành, Quận/Huyện, Xã/Phường */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tỉnh/Thành *</Form.Label>
                  <Form.Select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Quận/Huyện *</Form.Label>
                  <Form.Select
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Xã/Phường *</Form.Label>
                  <Form.Select
                    value={selectedWard}
                    onChange={handleWardChange}
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn xã/phường</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.name}>{w.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Shop Avatar</Form.Label>
              <Form.Control
                type="file"
                name="shopAvatar"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="mt-3 text-center">
                  <Image
                    src={previewImage}
                    roundedCircle
                    width="140"
                    height="140"
                    style={{ objectFit: "cover", border: "3px solid #ddd" }}
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending || !formik.isValid}
            >
              {isPending ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                "Update Shop"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
