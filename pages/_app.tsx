import "styles/globals.css";
import "styles/admin.css";
import { useState } from "react";
import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "layouts/MainLayout";
import exception from "utilities/exception";
import UserProfileProvider from "providers/Profile";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Alert from "components/General/Alert";

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            // process.env.NODE_ENV === "development" ? true : false,
            // staleTime: Infinity,
            retryDelay: (attemptIndex) => 1000 * Math.pow(2, attemptIndex),
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        {/* @ts-ignore */}
        <Alert ref={exception.snackBarRef} />
        <UserProfileProvider>
          <MainLayout Component={Component} pageProps={pageProps} />
        </UserProfileProvider>
        {/* {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />} */}
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
