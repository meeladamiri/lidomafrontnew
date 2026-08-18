import { useSearchData } from "Hooks/SearchPages/useSearchData";

export function useGetPersianCityname() {
  const { data } = useSearchData();
  return data?.params?.cat_name;
}
