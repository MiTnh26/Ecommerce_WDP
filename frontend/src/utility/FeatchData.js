import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function useDataByUrl({ url, key, method = "get", payload = null }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [key],
    queryFn: () => axios({ method, url, data: payload}),
    staleTime: 1000 * 60 * 1,
    cacheTime: 1000 * 60 * 5,
  });
  return { data, isLoading, error, refetch };
}

export { useDataByUrl };