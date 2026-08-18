import React from "react";
import { usePagination, DOTS } from "./usePagination";
import classes from "styles/pagination.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { BASE_URL } from "@/configs/info";

interface I_Pagination {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}

const Pagination = (props: I_Pagination) => {
  const { onPageChange, totalCount, siblingCount = 1, currentPage, pageSize, className } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  const router = useRouter();
  const { query } = router;

  if (currentPage === 0 || paginationRange!?.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange?.[paginationRange!?.length - 1];

  // Construct the filtered query string without the 'page' parameter
  const filteredQueryString = Object.entries(query)
    .filter(([key]) => key !== "page" && key !== "id")
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return (
    <ol className={`${classes["pagination-container"]} ${className || ""}`}>
      <li
        className={`${classes["pagination-item"]} ${currentPage === 1 ? classes["disabled"] : ""}`}
        onClick={onPrevious}
      >
        <div className={`${classes["arrow"]} ${classes["left"]}`} />
      </li>
      {paginationRange?.map((pageNumber, idx: number) => {
        if (pageNumber === DOTS) {
          return (
            <li key={idx} className={`${classes["pagination-item"]} ${classes["dots"]}`}>
              &#8230;
            </li>
          );
        }

        return (
          <li
            key={idx}
            className={`${classes["pagination-item"]} ${
              pageNumber === currentPage ? classes["selected"] : ""
            }`}
            onClick={() => onPageChange(pageNumber as number)}
          >
            <Link
              href={`${BASE_URL}/search${
                query?.id ? `/${query?.id}` : ""
              }${new URLSearchParams(filteredQueryString).toString()}${
                filteredQueryString.length > 0 ? "&" : "?"
              }page=${pageNumber}`}
              prefetch={false}
              passHref
            >
              {pageNumber}
            </Link>
          </li>
        );
      })}
      <li
        className={`${classes["pagination-item"]} ${
          currentPage === lastPage ? classes["disabled"] : ""
        }`}
        onClick={onNext}
      >
        <div className={`${classes["arrow"]} ${classes["right"]}`} />
      </li>
    </ol>
  );
};

export default Pagination;
