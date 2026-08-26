import React from "react";
import { usePagination, DOTS } from "./usePagination";
import classes from "styles/pagination.module.css";
import { useRouter } from "next/router";
import Link from "next/link";

interface I_Pagination {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}

/**
 * Search pagination.
 *
 * Every control is a real `<a href>`, including the arrows, so the pages are
 * reachable without JavaScript and discoverable by a crawler. Previously the
 * arrows were `<li onClick>` with no link at all, and the numbered links built
 * their URL by concatenation that dropped the `?` as soon as any filter was
 * present — `/search/shirazguests_count=4&page=2`.
 */
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

  const lastPage = Number(paginationRange?.[paginationRange!?.length - 1] ?? currentPage);

  /** The current URL with `page` swapped. Built with URLSearchParams, not string glue. */
  const hrefForPage = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (key === "page" || key === "id" || value === undefined) return;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    // Page one is the canonical URL of the list: it carries no `page`.
    if (page > 1) params.set("page", String(page));

    const base = `/search${query?.id ? `/${query.id}` : ""}`;
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  // Both states use the same `cell` box, so the glyph sits in the same place
  // whether the arrow is a link or not. Wrapping only the enabled one in an <a>
  // moved the arrow the moment you left the first page.
  const arrow = (page: number, disabled: boolean, dir: "left" | "right", label: string) => {
    const glyph = <span aria-hidden="true" className={`${classes["arrow"]} ${classes[dir]}`} />;
    return (
      <li className={`${classes["pagination-item"]} ${disabled ? classes["disabled"] : ""}`}>
        {disabled ? (
          <span className={classes["cell"]}>{glyph}</span>
        ) : (
          <Link
            href={hrefForPage(page)}
            prefetch={false}
            aria-label={label}
            className={classes["cell"]}
            onClick={(e) => {
              // Client-side navigation when JS is available; the href is what
              // makes it work when it is not.
              e.preventDefault();
              onPageChange(page);
            }}
          >
            {glyph}
          </Link>
        )}
      </li>
    );
  };

  return (
    <ol className={`${classes["pagination-container"]} ${className || ""}`}>
      {arrow(currentPage - 1, currentPage === 1, "left", "صفحه قبل")}

      {paginationRange?.map((pageNumber, idx: number) => {
        if (pageNumber === DOTS) {
          return (
            <li
              key={idx}
              aria-hidden="true"
              className={`${classes["pagination-item"]} ${classes["dots"]}`}
            >
              <span className={classes["cell"]}>&#8230;</span>
            </li>
          );
        }

        const page = Number(pageNumber);
        const isCurrent = page === currentPage;

        return (
          <li
            key={idx}
            className={`${classes["pagination-item"]} ${isCurrent ? classes["selected"] : ""}`}
          >
            <Link
              href={hrefForPage(page)}
              prefetch={false}
              // Tells assistive tech which page of the set is showing. Without
              // it the current page is only a colour.
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`صفحه ${page}`}
              className={classes["cell"]}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {pageNumber}
            </Link>
          </li>
        );
      })}

      {arrow(currentPage + 1, currentPage === lastPage, "right", "صفحه بعد")}
    </ol>
  );
};

export default Pagination;
