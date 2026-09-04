import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sanitize } from "isomorphic-dompurify";
import { getSupportFAQs } from "@/api/Support";
import { TinyLoader } from "../General/Loader/TinyLoader";

/**
 * «سوالات متداول» tab.
 *
 * Reads the same Faq model the homepage's FAQ block reads (GLOBAL scope,
 * plus anything scoped to /support specifically) — see the backend's
 * seo/faqPublic.routes.ts. There is no separate "support FAQ" content type;
 * a question written once can appear both on the homepage and here.
 */
export function SupportPageFAQs() {
  const [openId, setOpenId] = useState<number | null>(null);
  const { data, isLoading } = useQuery(["getSupportFAQs"], () => getSupportFAQs());
  const faqs = data?.faqs ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <TinyLoader />
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="flex flex-col items-center py-40 text-center">
        <span className="flex h-64 w-64 items-center justify-center rounded-full bg-gray-F8F8F8">
          <i aria-hidden="true" className="icon-Information text-28 text-gray-CACFD3" />
        </span>
        <p className="mt-16 text-14 leading-24 font-m text-black">فعلاً سوالی ثبت نشده</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-10">
      {faqs.map((faq) => {
        const open = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`overflow-hidden rounded-18 border-1 border-solid transition-colors ${
              open ? "border-primary-main border-opacity-30 bg-primary-light bg-opacity-30" : "border-gray-F0F0F0 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : faq.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-x-12 px-16 py-14 text-right"
            >
              <span className="text-14 leading-24 font-m text-black">{faq.question}</span>
              <span
                className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-full transition-all ${
                  open ? "rotate-180 bg-primary-main text-white" : "bg-gray-F8F8F8 text-gray-6C6A7D"
                }`}
              >
                <i aria-hidden="true" className="icon-FlashDown text-16" />
              </span>
            </button>

            <div
              className={`grid transition-all duration-200 ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className="px-16 pb-16 text-13 leading-24 font-r text-gray-6C6A7D"
                  dangerouslySetInnerHTML={{ __html: sanitize(faq.answer) }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
