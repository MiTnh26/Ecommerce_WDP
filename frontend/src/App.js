import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/Ecommerce/login" element={<LoginPage />} />
          <Route path="/Ecommerce/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
