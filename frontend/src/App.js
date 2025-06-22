import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import RouterSeller from "./router/router-seller";
import CategoryList from "./components/admin/Category";
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Routes>
        <Route path="/Ecommerce/login" element={<LoginPage />} />
        <Route path="/Ecommerce/register" element={<RegisterPage />} />

        <Route path="/Ecommerce/seller/*" element={<RouterSeller />} />
        <Route path="/Ecommerce/admin" element={<CategoryList />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
