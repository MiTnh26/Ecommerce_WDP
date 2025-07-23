import React from "react";
import { Accordion, ListGroup } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const sidebarConfig = [
  {
    key: "products",
    title: "Manager Products",
    items: [
      { label: "View Products", to: "/Ecommerce/seller/products" },
      { label: "Create Product", to: "/Ecommerce/seller/products/create" },
    ],
  },
  {
    key: "orders",
    title: "Manager Orders",
    items: [
      { label: "View Orders", to: "/Ecommerce/seller/viewlistorder" },
      
    ],
  },
  {
    key: "shop",
    title: "Manager Shop",
    items: [
      { label: "View Shop", to: "/Ecommerce/seller/shop-profile" },
    ],
  },
  {
  key: "statistics",
  title: "Seller Statistic",
  items: [
    { label: "View Statistic", to: "/Ecommerce/seller/statistic" },
  ],
},

];

const Sidebar = () => {
  const location = useLocation();

  // Xác định accordion nào đang active dựa trên url
  const getActiveAccordion = () => {
    if (location.pathname.includes("products")) return "0";
    if (location.pathname.includes("orders")) return "1";
    if (location.pathname.includes("shop")) return "2";
    if (location.pathname.includes("statistic")) return "3";
    return "";
  };

  return (
    <div className="p-3 bg-white shadow rounded" style={{ minHeight: "100vh"}}>
      <h4 className="mb-4 fw-bold text-primary text-center">Seller Dashboard</h4>
      <Accordion defaultActiveKey={getActiveAccordion()} alwaysOpen flush>
        {sidebarConfig.map((section, idx) => {
          const isSectionActive = getActiveAccordion() === String(idx);
          return (
            <Accordion.Item eventKey={String(idx)} key={section.key}>
              <Accordion.Header
                style={{
                  background: isSectionActive ? "#e3f0fc" : undefined,
                  color: isSectionActive ? "#1976d2" : undefined,
                  fontWeight: isSectionActive ? 700 : 500,
                  borderRadius: "6px",
                }}
              >
                {section.title}
              </Accordion.Header>
              <Accordion.Body className="p-0">
                <ListGroup variant="flush">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <ListGroup.Item
                        as={Link}
                        to={item.to}
                        key={item.label}
                        className="ps-4 py-2"
                        style={{
                          background: isActive
                            ? isSectionActive
                              ? "#1976d2"
                              : "#e3f0fc"
                            : undefined,
                          color: isActive
                            ? isSectionActive
                              ? "#fff"
                              : "#1976d2"
                            : undefined,
                          fontWeight: isActive ? 600 : 400,
                          borderLeft: isActive ? "4px solid #1976d2" : undefined,
                          borderRadius: isActive ? "0 20px 20px 0" : undefined,
                          transition: "all 0.2s",
                        }}
                      >
                        {item.label}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Sidebar;