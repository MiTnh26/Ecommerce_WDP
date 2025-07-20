// src/pages/ProfilePage.js

import React, { useState } from "react";
import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import ProfileView from "../components/ProfileViewForm";
import UpdateProfileForm from "../components/UpdateProfileForm";
import PurchaseOrders from "../components/PurchaseOrders";
import AddressForm from "../components/AddressForm";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { useLocation } from "react-router-dom";
import ChangePasswordForm from "../components/ChangePasswordForm";



import { Outlet } from "react-router-dom";



const user = JSON.parse(localStorage.getItem("user"));
// const userId = user._id;
// console.log("userid" ,userId);

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


  return (
    <div className="d-flex flex-column min-vh-100 container-fluid p-0 m-0">

      <header>
        <Header />
      </header>
      {/* <div className="container">
        <SideBar />
      </div> */}
      <Container className="mt-4" style={{ minHeight: "80vh" }}>

        <Row>
          {/* Sidebar */}
          <Col md={3} className="bg-light p-3 rounded shadow-sm">
            <h5 className="mb-4 text-center">My Account </h5>
            <h6 className="mb-4 text-center"> {user.FirstName}{user.LastName} </h6>
            <Nav
              variant="pills"
              className="flex-column"
              activeKey={activeTab}
              onSelect={(selectedKey) => {
                setActiveTab(selectedKey);
                const personalInfoTabs = ["view", "bank", "address", "changepassword", "notisetting"];
                if (!personalInfoTabs.includes(selectedKey)) {
                  setShowSubmenu(false); // tự đóng submenu nếu chọn tab khác
                }
              }}
            >

              <Nav.Item>
                <Nav.Link
                  onClick={() => {
                    setShowSubmenu(!showSubmenu);
                    setActiveTab("view"); // tự mở tab View Profile
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Personal Information ▾
                </Nav.Link>
              </Nav.Item>

              {showSubmenu && (
                <div style={{ marginLeft: "15px" }}>
                  <Nav.Item>
                    <Nav.Link eventKey="view">View Profile</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="bank">Bank</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="address">Address</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="changepassword">Change Password</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notisetting">Notification Setting</Nav.Link>
                  </Nav.Item>
                </div>
              )}
              {/* Extended features */}
              {/* <Nav.Item>
                <Nav.Link eventKey="security">Security</Nav.Link>
              </Nav.Item> */}
              <Nav.Item>
                <Nav.Link eventKey="history">Purchase History</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="purchaseorder">Orders</Nav.Link>
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

                  <Tab.Pane eventKey="update">
                    <UpdateProfileForm userId={userId} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="address">
                    <AddressForm userId={userId} />
                  </Tab.Pane>
                  <Tab.Pane eventKey="changepassword">
                    <ChangePasswordForm userId={userId} />
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
                    <PurchaseOrders userId={userId} setActiveTab={setActiveTab} />
                  </Tab.Pane>

                </Tab.Content>
              </Tab.Container>
            </Tab.Content>
          </Col>
        </Row>
      </Container>
      <main className="flex-fill container-fluid">
        {/* <Outlet /> */}
        <Outlet context={{ setActiveTab }} />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default ProfilePage;
