import { getRefreshToken, getUserToken, removeUserToken, setUserToken } from "@/utilities/cookies";
import axios, { AxiosInstance } from "axios";

const client: AxiosInstance = axios.create();

//----------------------------------------axios authorization---------------------------------------------

const setAxiosToken = (token: string) => {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

// just for first set-up
if (typeof window !== "undefined") {
  const authState = getUserToken();
  if (!!authState) {
    setAxiosToken(authState);
  }
}

//----------------------------------------silent refresh on 401---------------------------------------------

let refreshingPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const resp = await axios.post("/api/auth/refresh", { refreshToken });
    const result = resp?.data?.data;
    if (result?.accessToken) {
      setUserToken({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      setAxiosToken(result.accessToken);
      return result.accessToken;
    }
    return null;
  } catch {
    return null;
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

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as (typeof error)["config"] & { _retried?: boolean };

    if (
      typeof window !== "undefined" &&
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retried = true;

      if (!refreshingPromise) {
        refreshingPromise = refreshAccessToken().finally(() => {
          refreshingPromise = null;
        });
      }

      const newToken = await refreshingPromise;

      if (newToken) {
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return client(originalRequest);
      }

      removeUserToken();
      setAxiosToken("");
    }

    return Promise.reject(error);
  }
);

export { setAxiosToken };
export default client;
