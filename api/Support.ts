import apiBuilder from "./apiBuilder";

export interface ISupportPage_FAQItem {
  answer: string;
  id: number;
  question: string;
}

const unwrap = (res: any) => res?.data;

/** GLOBAL-scope FAQs plus anything scoped to /support specifically — see the
 * backend's seo/faqPublic.routes.ts. Old callers of the removed Odoo
 * support_chats/faqs endpoint read this same shape. */
export async function getSupportFAQs(): Promise<{ faqs: ISupportPage_FAQItem[] }> {
  const res = await apiBuilder
    .setUrl("/api/faqs")
    .setCallMethod("GET")
    .setParams({ path: "/support" })
    .call();
  return unwrap(res) ?? { faqs: [] };
}
