import React from "react";
import Header from "./CheckoutHeader";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
