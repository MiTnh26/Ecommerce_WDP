import { createContext, useState } from "react";

//1. Tao context
const AppContext = createContext();

//2. Tao provider
export function AppProvider({ children }) {
    const [dataTest, setDataTest] = useState("hello");

    return (
        <AppContext.Provider value={{ 
            dataTest, setDataTest 
            }}>
            {children}
        </AppContext.Provider>
    )
}