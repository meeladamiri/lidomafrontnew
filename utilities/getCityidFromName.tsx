import cities_data from "./SearchPage/cities_data";

export const getCityidFromName = (city: string) => {
  for (const [key, value] of Object.entries(cities_data)) {
    if (value === city) {
      return key;
    }
  }
  return "City not found";
};
