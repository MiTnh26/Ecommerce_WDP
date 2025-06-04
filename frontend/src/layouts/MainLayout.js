import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import SideBar from "./SideBar";
const MainLayout = () => {
    return (
        <div className="d-flex flex-column  min-vh-100 container-fluid p-0 m-0">
            <header>
                <Header />
            </header>
            <sidebar className="container">
                <SideBar />
            </sidebar>
            <main className="flex-fill container-fluid">
                    <Outlet />
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
};

export default MainLayout;
