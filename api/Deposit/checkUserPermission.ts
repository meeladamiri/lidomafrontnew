import { apiBuilder } from "./_shared";

/**
 * Whether this account may use the panel.
 *
 * Answered for any signed-in user rather than refused, so the page can show
 * "no access" instead of a broken call. Note the envelope: this one endpoint
 * is read with `status` rather than `result` by the component, and that
 * difference is Odoo's, not ours.
 */
const checkUserPermission = async () => {
  const res = await apiBuilder.setUrl("/api/deposit/permission").setCallMethod("GET").call();

  return {
    status: res?.status === "success" ? "success" : "error",
    params: { has_permission: !!res?.data?.has_permission },
  };
};

export { checkUserPermission };
