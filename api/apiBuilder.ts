import client from ".";
import { Non_authorization_routes_abbr } from "@/constants/Non_authorization_routes";
import { toast } from "react-toastify";

type TCallMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "post" | "get" | "put" | "patch" | "delete";

interface ISendData {
  url: string;
  call_method: string;
  contentType: string;
  accept: string;
  params: object | undefined | null;
  responseType: any;
  data: object | undefined | null;
}

const initial_send_data: ISendData = {
  url: "",
  call_method: "GET",
  contentType: "application/json",
  accept: "application/json",
  params: null,
  responseType: null,
  data: null,
};

function handleUnauthorized() {
  if (typeof window === "undefined") return;

  if (
    window.location.pathname !== "/" &&
    !Non_authorization_routes_abbr.find((el) => window.location.pathname.startsWith(el))
  ) {
    toast.info("جهت مشاهده این صفحه، لطفا وارد سیستم شوید.", {
      // Note: to avoid this toast's duplication, we provide a custom id for it.
      toastId: "user-not-found",
    });
    window.location.assign(
      `/auth/enter_phone?redirectTo=${window?.location?.pathname}${window?.location?.search || ""}`
    );
  }
}

class ApiBuilder {
  send_data: ISendData = { ...initial_send_data };

  onSuccess: any;
  onError: any;

  setBody(body: any) {
    if (!body) {
      this.send_data.data = undefined;
      return this;
    }

    const isMultipart = (this.send_data.call_method || "").toLowerCase() !== "json";

    if (isMultipart) {
      const data: any = typeof window !== "undefined" ? new FormData() : {};

      Object.entries(body).forEach(([key, value]) => {
        if (typeof window !== "undefined") {
          data.append(key, value as any);
        } else {
          data[key] = value;
        }
      });
      this.send_data.data = data;
    } else {
      this.send_data.call_method = "POST";
      this.send_data.data = body;
    }

    return this;
  }

  setParams(params: any) {
    this.send_data.params = params;
    return this;
  }

  setResponseType(value: any) {
    this.send_data.responseType = value;
    return this;
  }

  setCallMethod(method: TCallMethod) {
    this.send_data.call_method = method;
    return this;
  }

  // kept only so existing call-sites (`.setJsonRpcMethod("call")`) don't need touching — REST has no jsonrpc method concept.
  setJsonRpcMethod(_method: string) {
    return this;
  }

  setUrl(url: string) {
    this.send_data.url = url;
    return this;
  }

  setOnSuccess(onSuccess: any) {
    this.onSuccess = onSuccess;
    return this;
  }

  setOnError(onError: any) {
    this.onError = onError;
    return this;
  }

  resetSendData() {
    this.send_data = { ...initial_send_data };
  }

  async call() {
    const shallowCpOfSendData = { ...this.send_data };
    this.resetSendData();

    const method = (shallowCpOfSendData.call_method || "GET").toString().toUpperCase();
    const isFormData =
      typeof FormData !== "undefined" && shallowCpOfSendData.data instanceof FormData;
    const hasExplicitBody = shallowCpOfSendData.data !== undefined && shallowCpOfSendData.data !== null;

    try {
      const response = await client({
        method,
        url: shallowCpOfSendData.url,
        headers: isFormData
          ? { Accept: shallowCpOfSendData.accept }
          : { "Content-Type": shallowCpOfSendData.contentType, Accept: shallowCpOfSendData.accept },
        params: method === "GET" ? shallowCpOfSendData.params ?? undefined : undefined,
        data: hasExplicitBody
          ? shallowCpOfSendData.data
          : method !== "GET"
            ? shallowCpOfSendData.params ?? undefined
            : undefined,
        responseType: shallowCpOfSendData.responseType ?? undefined,
      });

      const data = response?.data;
      if (this.onSuccess) this.onSuccess(data);
      return data;
    } catch (error: any) {
      const data = error?.response?.data;

      if (data?.status === "error" && data?.code === "UNAUTHORIZED") {
        handleUnauthorized();
      }

      if (this.onError) this.onError();
      return data ?? error?.response;
    } finally {
      this.setBody(undefined);
      this.setParams({});
    }
  }
}

const apiBuilder = new ApiBuilder();

export default apiBuilder;
