import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useIsMutating } from "@tanstack/react-query";
import MainLoader from "components/General/Loader/MainLoader";

const Loader = ({ isShowing = false }: { isShowing?: boolean }) => {
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const isMutating = useIsMutating();

  const loadStart = () => setIsFetching(true);

  const loadEnd = () => {
    setIsFetching(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    router.events.on("routeChangeStart", loadStart);
    router.events.on("routeChangeComplete", loadEnd);
    router.events.on("routeChangeError", () => loadEnd());

    return () => {
      router.events.off("routeChangeStart", loadStart);
      router.events.off("routeChangeComplete", loadEnd);
      router.events.off("routeChangeError", () => loadEnd());
    };
  }, [router]);

  return <MainLoader isLoading={isFetching || !!isMutating || isShowing} />;
};

export default Loader;
