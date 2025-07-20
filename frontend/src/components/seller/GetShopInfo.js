import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Button } from "react-bootstrap";

const GetShopInfo = () => {
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Function to fetch shop info
  const fetchShopInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/seller/getShopInformation?owner=${user._id}`
      );
      console.log("Shop data:", response.data);
      setShopInfo(response.data);

      // Save to localStorage
      if (response.data && response.data._id) {
        localStorage.setItem("shopId", response.data._id);
        console.log("Saved shopId to localStorage:", response.data._id);
      }
    } catch (err) {
      console.error("Error fetching shop:", err);
      setError(err.message || "Failed to fetch shop information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchShopInfo();
    } else {
      setError("No user found in localStorage");
      setLoading(false);
    }
  }, []);

  // Function to view localStorage
  const checkLocalStorage = () => {
    const shopId = localStorage.getItem("shopId");
    alert(`Current shopId in localStorage: ${shopId || "Not found"}`);
  };

  // Function to manually set shopId in localStorage
  const setShopIdManually = () => {
    if (shopInfo && shopInfo._id) {
      localStorage.setItem("shopId", shopInfo._id);
      alert(`ShopId set to: ${shopInfo._id}`);
    } else {
      alert("No shop information available");
    }
  };

  return (
    <Container className="py-4">
      <h2>Shop Information Debug</h2>

      {loading ? (
        <p>Loading shop information...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>{shopInfo?.name || "No shop name"}</Card.Title>
            <p>
              <strong>Shop ID:</strong> {shopInfo?._id || "N/A"}
            </p>
            <p>
              <strong>Owner ID:</strong> {shopInfo?.owner || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {shopInfo?.status || "N/A"}
            </p>
          </Card.Body>
        </Card>
      )}

      <div className="d-flex gap-2 mb-3">
        <Button onClick={fetchShopInfo} disabled={loading}>
          Refresh Shop Info
        </Button>
        <Button onClick={checkLocalStorage} variant="info">
          Check localStorage
        </Button>
        <Button
          onClick={setShopIdManually}
          variant="success"
          disabled={!shopInfo}
        >
          Set shopId in localStorage
        </Button>
      </div>

      <div className="mt-4">
        <h4>Debug Information</h4>
        <pre className="bg-light p-3">
          User ID: {user._id || "Not found"}
          <br />
          shopId in localStorage:{" "}
          {localStorage.getItem("shopId") || "Not found"}
        </pre>
      </div>
    </Container>
  );
};

export default GetShopInfo;
