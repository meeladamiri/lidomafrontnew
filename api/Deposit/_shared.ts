import apiBuilder from "../apiBuilder";

/**
 * The deposit panel's API layer, pointed at the new backend.
 *
 * The page and its components are the originals — around 2,300 lines that
 * work — so this layer keeps speaking their language: Odoo's JSON-RPC
 * envelope, with `result: "success"` and `err_msg`. Translating here means the
 * screen did not have to be rewritten to change what it talks to.
 */

export interface OdooEnvelope<T = unknown> {
  result: "success" | "error";
  params?: T;
  err_msg?: string;
}

/** New backend: `{ status, data }` on success, `{ status, message }` on failure. */
export function toEnvelope<T>(res: any, pick?: (data: any) => T): OdooEnvelope<T> {
  if (res?.status === "success") {
    return { result: "success", params: pick ? pick(res.data) : res.data };
  }

  return {
    result: "error",
    err_msg: res?.message || "انجام نشد",
  };
}

export { apiBuilder };
