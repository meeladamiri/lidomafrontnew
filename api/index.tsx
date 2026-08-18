import { getUserToken } from "@/utilities/cookies";
import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";

interface CommonHeaderProperties extends AxiosRequestHeaders {
  Cookie: string;
}

const client: AxiosInstance = axios.create({
  // baseURL: BASE_URL,
  // headers: (typeof window !== "undefined"
  //   ? { Cookie: getUserToken() }
  //   : {}) as CommonHeaderProperties,
});

//----------------------------------------axious autorization---------------------------------------------

const setAxiosToken = (token: string) => {
  client.defaults.headers = {
    Cookie:
      // "session_id=" +
      token + ";",
  } as any;
};

// just for first set-up
if (typeof window !== "undefined") {
  const authState = getUserToken();
  if (!!authState) {
    setAxiosToken(authState);
  }
}

//----------------------------------------request handle---------------------------------------------

client.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

//---------------------------------------response handle---------------------------------------------

// client.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   function (error) {
//     const originalRequest = error.config;

//     return Promise.reject(error);
//   }
// );

export { setAxiosToken };
export default client;
