import apiBuilder from "./apiBuilder";

export interface ISupportPage_FAQItem {
  answer: string;
  id: number;
  question: string;
}

const unwrap = (res: any) => res?.data;

/** GLOBAL-scope FAQs plus anything scoped to this viewer's own support path —
 * see the backend's seo/faqPublic.routes.ts. A host reading "چطور رزروم را
 * لغو کنم" and a guest reading it want different answers, so this is split
 * by role rather than one shared /support list. Old callers of the removed
 * Odoo support_chats/faqs endpoint read this same shape. */
export async function getSupportFAQs(
  role: "guest" | "host" = "guest"
): Promise<{ faqs: ISupportPage_FAQItem[] }> {
  const res = await apiBuilder
    .setUrl("/api/faqs")
    .setCallMethod("GET")
    .setParams({ path: `/support/${role}` })
    .call();
  return unwrap(res) ?? { faqs: [] };
}
