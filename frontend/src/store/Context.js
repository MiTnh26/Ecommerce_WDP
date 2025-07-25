import { createContext, useEffect, useState } from "react";
import { fetchCategory } from "../api/ProductApi";
import axios from "axios";
//1. Tao context
export const AppContext = createContext();

//2. Tao provider
export function AppProvider({ children }) {
  const [dataProductFilter, setDataProductFilter] = useState([]);
  const [checkOut, setCheckOut] = useState();
  const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    if (checkOut) {
      localStorage.setItem("checkOutData", JSON.stringify(checkOut));
    }
  }, [checkOut]);
  //fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(`${baseURL}/seller/getShopProvince`, {
          withCredentials: true,
        });
        //console.log(res.data)
        // setWhereToBuy(res.data);
      } catch (error) {
        console.error("Lỗi khi load province:", error);
      }
    };
    loadData();
  }, []);
  const filterData = async (
    search,
    category,
    fromPrice,
    toPrice,
    whereToBuyFilter
  ) => {
    try {
      const res = await axios.post(
        `${baseURL}/product/filter-product`,
        {
          name: search,
          category: category,
          fromPrice: fromPrice,
          toPrice: toPrice,
          whereToBuyFilter: whereToBuyFilter,
        },
        {
          withCredentials: true,
        }
      );
      setDataProductFilter(res.data);
    } catch (error) {
      console.error("Lỗi lọc sản phẩm:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        dataProductFilter,
        setDataProductFilter,
        filterData,
        checkOut,
        setCheckOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
