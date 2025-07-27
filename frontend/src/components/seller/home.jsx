import React from "react";
import { Col, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";

const HomeSeller = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default HomeSeller;
