import { createContext, useEffect, useState } from "react";
import { fetchCategory } from "../api/ProductApi";
import axios from "axios";
//1. Tao context
export const AppContext = createContext();

//2. Tao provider
export function AppProvider({ children }) {
   
    const [dataTest, setDataTest] = useState("hello");
    const [dataProductFilter, setDataProductFilter] = useState([]);
    const [search, setSearch] = useState("");
    const [whereToBuy, setWhereToBuy] = useState([]);
    const [whereToBuyFilter, setWhereToBuyFilter] = useState([]);
    const [fromPrice, setFromPrice] = useState();
    const [toPrice, setToPrice] = useState();
    const [category, setCategory] = useState("");
    const [checkOut, setCheckOut] = useState();
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    //fetch data
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await axios.get(`${baseURL}/seller/getShopProvince`, {
                    withCredentials: true,
                });

                console.log(res.data)
                setWhereToBuy(res.data);
            } catch (error) {
                console.error("Lỗi khi load province:", error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        filterData()
    }, [category]);

    const filterData = async () => {
        console.log("filterData", "1", search, "2",category, "3",fromPrice, toPrice, "4",whereToBuyFilter);
        try {
            const res = await axios.post(
                `${baseURL}/product/filter-product`,
                {
                    name: search,            
                    category: category,
                    fromPrice: fromPrice,
                    toPrice: toPrice,
                    whereToBuyFilter: whereToBuyFilter
                },
                {
                    withCredentials: true
                }
            );
            setDataProductFilter(res.data);
            // Xử lý kết quả:
            console.log(res.data);
        } catch (error) {
            console.error('Lỗi lọc sản phẩm:', error);
        }
    }

    return (
        <AppContext.Provider value={{ 
            dataTest, setDataTest,
            search, setSearch,
            dataProductFilter, setDataProductFilter,
            whereToBuy, setWhereToBuy,
            fromPrice, setFromPrice,
            toPrice, setToPrice,
            whereToBuyFilter, setWhereToBuyFilter,
            category, setCategory,
            filterData,
            checkOut, setCheckOut
            }}>
            {children}
        </AppContext.Provider>
    )
}