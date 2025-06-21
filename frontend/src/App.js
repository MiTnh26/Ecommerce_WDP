import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProfilePage from "./pages/ProfilePage";
import PublicRoutes from "./routes/PublicRoutes";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import SellerRoutes from "./routes/SellerRoutes";
import { AppProvider } from "./store/Context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>

      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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
                          element={childRoute.element}
                        />
                      ))}
                  </Route>
                );
              })}
              {UserRoutes.map((route, index) => {
                return (
                  <Route key={index} path={route.path} element={route.element}>
                    {route.children &&
                      route.children.map((childRoute, idx) => (
                        <Route
                          key={idx}
                          path={childRoute.path}
                          element={childRoute.element}
                        />
                      ))}
                  </Route>
                );
              })}
              {AdminRoutes.map((route, index) => {
                return (
                  <Route key={index} path={route.path} element={route.element}>
                    {route.children &&
                      route.children.map((childRoute, idx) => (
                        <Route
                          key={idx}
                          path={childRoute.path}
                          element={childRoute.element}
                        />
                      ))}
                  </Route>
                );
              })}
              {SellerRoutes.map((route, index) => {
                return (
                  <Route key={index} path={route.path} element={route.element}>
                    {route.children &&
                      route.children.map((childRoute, idx) => (
                        <Route
                          key={idx}
                          path={childRoute.path}
                          element={childRoute.element}
                        />
                      ))}
                  </Route>
                );
              })}
            </Routes>
          </Router>
        </AppProvider>
      </GoogleOAuthProvider>
      <ReactQueryDevtools initialIsOpen={true} position="top-left" />
    </QueryClientProvider>
  );
}

export default App;
