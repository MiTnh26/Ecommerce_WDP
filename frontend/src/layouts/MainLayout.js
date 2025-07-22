import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
// import SideBar from "./SideBar";

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 container-fluid p-0 m-0">
      <header>
        <Header />
      </header>

      {/* <div className="container">
        <SideBar />
      </div> */}

      <main className="flex-fill container-fluid p-0 m-0" style={{backgroundColor:"#f5f5f5"}}>
        <Outlet />
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
