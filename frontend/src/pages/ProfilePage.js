// src/pages/ProfilePage.js

import React, { useState } from "react";
import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import ProfileView from "../components/ProfileViewForm";
import UpdateProfileForm from "../components/UpdateProfileForm";
import PurchaseOrders from "../components/PurchaseOrders";

const user = JSON.parse(localStorage.getItem("user"));
const userId = user._id;
console.log("userid" ,userId);


function ProfilePage() {
  const [activeTab, setActiveTab] = useState("view");

  return (
    <Container className="mt-4" style={{ minHeight: "80vh" }}>
      <Row>
        {/* Sidebar */}
        <Col md={3} className="bg-light p-3 rounded shadow-sm">
          <h5 className="mb-4 text-center">My Account</h5>
          <Nav
            variant="pills"
            className="flex-column"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Nav.Item>
              <Nav.Link eventKey="view">Personal Information</Nav.Link>
            </Nav.Item>
            {/* Extended features */}
            <Nav.Item>
              <Nav.Link eventKey="security">Security</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="history">Purchase History</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="puchaseorder">Orders</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Content */}
        <Col md={9} className="ps-md-4 pt-2 pt-md-0">
          <Tab.Content>
            <Tab.Container activeKey={activeTab}>
              <Tab.Content>
                <Tab.Pane eventKey="view">
                  <ProfileView userId={userId} />
                </Tab.Pane>
                <Tab.Pane eventKey="security">
                  <div className="mt-4">The "Change Password" feature is under development...</div>
                </Tab.Pane>
                <Tab.Pane eventKey="history">
                  <div className="mt-4">The "Transaction History" feature is under development...</div>
                </Tab.Pane>
                <Tab.Pane eventKey="puchaseorder">
                  <PurchaseOrders userId={userId} />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
