import { createContext, useEffect, useState } from "react";
//1. Tao context
export const AppContext = createContext();

//2. Tao provider
export function AppProvider({ children }) {
  const [checkOut, setCheckOut] = useState();
  useEffect(() => {
    if (checkOut) {
      localStorage.setItem("checkOutData", JSON.stringify(checkOut));
    }
  }, [checkOut]);
  
  return (
    <AppContext.Provider
      value={{
        checkOut,
        setCheckOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
