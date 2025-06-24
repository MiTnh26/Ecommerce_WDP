import React from "react";
import CheckoutHeader from "./CheckoutHeader";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <>
      <CheckoutHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
