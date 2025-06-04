import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PublicRoutes from "./routes/PublicRoutes"
import { AppProvider } from './store/Context'
function App() {
  return (
    <GoogleOAuthProvider clientId="452044254054-auvkf89chh5uahvttnmqegnrf9uj9l98.apps.googleusercontent.com">
      <AppProvider>
        <Router>
          <Routes>
            {PublicRoutes.map((route, index) => {
              const Layout = route.element;
              return (
                <Route key={index} path={route.path} element={Layout}>
                  {route.children &&
                    route.children.map((childRoute, index) => (
                      <Route
                        key={index}
                        path={childRoute.path}
                        element={childRoute.element} />
                    ))}
                </Route>
              )
            })}
          </Routes>
        </Router>
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
