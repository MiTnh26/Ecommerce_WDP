import React from "react";
import { Col, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";

const HomeSeller = () => {
  return (
    <div>
      <Row>
        <Col md={3} className="bg-light p-0" style={{ minHeight: "100vh" }}>
          <Sidebar />
        </Col>
        <Col md={9} className="p-0">
          <Header />
          <Outlet />
        </Col>
      </Row>
    </div>
  );
};

export default HomeSeller;
