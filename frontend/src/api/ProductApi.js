
import axios from "axios";
import { useEffect, useState } from "react";
import { getIconForCategory } from "../store/keywordToIcon";

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const fetchCategory = async () => {
  try {
    const res = await axios.get(`${baseURL}/category/get-category?limit=4&skip=0`, {
      withCredentials: true,
    });
    const data = res.data;
    // them icon tuong ung voi cateogry
    const categoriesWithIcons = data.map((item, index) => ({
      ...item,
      icon: getIconForCategory(item.CategoryName),
    }));
    //console.log("fetchCategory data", categoriesWithIcons);
    return categoriesWithIcons;
  } catch (err) {
    console.log("fetchCategory err", err);
  }
};

// get lengths of categories
export const fetchCategoryLength = async () => {
  try {
    const res = await axios.get(`${baseURL}/category/get-count`, {
      withCredentials: true,
    });
    const count = res.data.count;
    return count;
    //console.log("fetchCategoryCount count", count);
  } catch (err) {
    console.log("fetchCategoryCount err", err);
  }
};
export const fetchTrendingProducts = async () => {
  try {
    const res = await axios.get(`${baseURL}/product/trending?limit=10&skip=0`, {
      withCredentials: true,
    });
    const data = res.data;
    //console.log("fetchTrendingProducts data", data);
    return data;
  } catch (err) {
    console.log("fetchTrendingProducts err", err);
  }
  return;
};
export const fetchBestSellerProducts = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/product/best-seller`, {
      withCredentials: true,
    });
    const data = res.data;
    //console.log("fetchTopSalesProducts data", data);
    return data;
  } catch (err) {
    console.log("fetchTopSalesProducts err", err);
  }
  return;
};
export const fetchNewProducts = async () => {
  try {
    const res = await axios.get(`${baseURL}/product/get-new?limit=10&skip=0`, {
      withCredentials: true,
    });
    const data = res.data;
    //console.log("fetchNewProducts data", data);
    return data;
  } catch (err) {
    console.log("fetchNewProducts err", err);
  }
  return;
};


  // fetch data product detail

export const fetchProductDetail = async (product_id) => {
  try {
    const res = await axios.get(`${baseURL}/product/${product_id}`, {
      withCredentials: true,
    });
    const data = res.data.product; // ✅ Sửa lại đúng key
    const status = res.status; // ✅ status là HTTP status, không phải res.data.status
    const message = res.data.message;
    //console.log("fetchProductDetail data", data, status, message);
    return { data, message, status };
  } catch (err) {
    console.log("fetchProductDetail err", err);
  }
  return;
};

  export const fetchReviews = async () => {
    console.log("Fetching reviews...");
    return [1, 2, 3, 4, 5, 6];
  };
  export const fetchRelatedProducts = async (name) => {
  try {
    const res = await axios.post(
      `${baseURL}/product/related-products`,
      { name_product: name }, // body
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("fetchRelatedProducts err", err);
    throw err;
  }
};
  
export const filterData = async (
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
      return res.data;
    } catch (error) {
      console.error("Lỗi lọc sản phẩm:", error);
    }
  };
