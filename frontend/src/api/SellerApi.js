import axios from "axios";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/seller";

export const SHOP_API = {
  GET_SHOP_INFORMATION: `${API_URL}/getShopInformation`,
  UPDATE_SHOP_PROFILE: `${API_URL}/updateShopProfile`,
};


export function useShopInfo(user) {
  const [shopInfo, setShopInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchShopInfo = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(SHOP_API.GET_SHOP_INFORMATION, { owner: user });
        setShopInfo(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch shop information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopInfo();
  }, [user]);

  return { shopInfo, isLoading, error };
}