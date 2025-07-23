// src/pages/ProfilePage.js

import React, { useState } from "react";
import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import ProfileView from "../components/ProfileViewForm";
import UpdateProfileForm from "../components/UpdateProfileForm";
import PurchaseOrders from "../components/PurchaseOrders";
import OrderDetail from "../components/OrderDetail";
import AddressForm from "../components/AddressForm";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { useLocation } from "react-router-dom";
import ChangePasswordForm from "../components/ChangePasswordForm";
import '../style/customer/ProfilePage.css';

import { Outlet } from "react-router-dom";

const user = JSON.parse(localStorage.getItem("user"));

let userId = "0";
try {
  userId = user._id;
  console.log("userid", userId);
} catch (error) {
  console.error(error);
}

function ProfilePage() {
  const [showSubmenu, setShowSubmenu] = useState(false);

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };
  const location = useLocation();
  const defaultTab = location.state?.tab || "view";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  return (
    <div className="d-flex flex-column min-vh-100 container-fluid p-0 m-0 profile-page-wrapper">

      <header>
        <Header />
      </header>
      <Container className="mt-4 profile-container">
        <Row>
          {/* Sidebar */}
          <Col md={3} className="bg-light p-3 rounded shadow-sm profile-sidebar">
            <div className="d-flex flex-column align-items-center mb-4 profile-avatar-section">
              <img
                src={user.Image || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                alt="avatar"
                className="profile-avatar"
              />
              <h6 className="profile-username">
                {user.FirstName} {user.LastName}
              </h6>
            </div>

            <Nav
              variant="pills"
              className="flex-column profile-nav"
              activeKey={activeTab}
              onSelect={(selectedKey) => {
                setActiveTab(selectedKey);
                const personalInfoTabs = ["view", "bank", "address", "changepassword", "notisetting"];
                if (!personalInfoTabs.includes(selectedKey)) {
                  setShowSubmenu(false);
                }
              }}
            >
              <Nav.Item>
                <Nav.Link
                  className="nav-hover profile-nav-link"
                  onClick={() => {
                    setShowSubmenu(!showSubmenu);
                    setActiveTab("view");
                  }}
                >
                  <i className="bi bi-person-lines-fill profile-nav-icon"></i>
                  <span className="profile-nav-title">Personal Information</span>
                  <i className={`bi ${showSubmenu ? "bi-caret-up-fill" : "bi-caret-down-fill"} profile-nav-caret`} />
                </Nav.Link>
              </Nav.Item>

              {showSubmenu && (
                <div className="profile-submenu">
                  <Nav.Item>
                    <Nav.Link eventKey="view" className="nav-hover profile-nav-link">
                      <i className="bi bi-person-circle me-2" /> View Profile
                    </Nav.Link>
                  </Nav.Item>
                  {/* <Nav.Item>
                    <Nav.Link eventKey="bank" className="nav-hover profile-nav-link">
                      <i className="bi bi-bank me-2" /> Bank
                    </Nav.Link>
                  </Nav.Item> */}
                  <Nav.Item>
                    <Nav.Link eventKey="address" className="nav-hover profile-nav-link">
                      <i className="bi bi-geo-alt me-2" /> Address
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="changepassword" className="nav-hover profile-nav-link">
                      <i className="bi bi-key me-2" /> Change Password
                    </Nav.Link>
                  </Nav.Item>
                  {/* <Nav.Item>
                    <Nav.Link eventKey="notisetting" className="nav-hover profile-nav-link">
                      <i className="bi bi-bell me-2" /> Notification Setting
                    </Nav.Link>
                  </Nav.Item> */}
                </div>
              )}

              {/* <Nav.Item>
                <Nav.Link eventKey="history" className="nav-hover profile-nav-link">
                  <i className="bi bi-clock-history me-2" /> Purchase History
                </Nav.Link>
              </Nav.Item> */}
              <Nav.Item>
                <Nav.Link eventKey="purchaseorder" className="nav-hover profile-nav-link">
                  <i className="bi bi-bag-check me-2" /> Orders
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          {/* Content */}
          <Col md={9} className="ps-md-4 pt-2 pt-md-0 profile-content">
            <Tab.Container activeKey={activeTab}>
              <Tab.Content>
                <Tab.Pane eventKey="view">
                  <ProfileView userId={userId} />
                </Tab.Pane>
                <Tab.Pane eventKey="update">
                  <UpdateProfileForm userId={userId} />
                </Tab.Pane>
                <Tab.Pane eventKey="address">
                  <AddressForm userId={userId} />
                </Tab.Pane>
                <Tab.Pane eventKey="changepassword">
                  <ChangePasswordForm userId={userId} />
                </Tab.Pane>
                <Tab.Pane eventKey="orderdetail">
                  <OrderDetail 
                    setActiveTab={setActiveTab}
                    orderId={selectedOrderId}
                  />
                </Tab.Pane>
                <Tab.Pane eventKey="security">
                  <div className="mt-4">
                    The "Change Password" feature is under development...
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="history">
                  <div className="mt-4">
                    The "Transaction History" feature is under development...
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="purchaseorder">
                  <PurchaseOrders
                    userId={userId}
                    setActiveTab={setActiveTab}
                    setSelectedOrderId={setSelectedOrderId}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>
      <main className="flex-fill container-fluid">
        <Outlet context={{ setActiveTab }} />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default ProfilePage;
