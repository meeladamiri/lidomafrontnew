import { AXIOSMETHOD } from "constants/enums/axios_methods";
import client from ".";
import { Non_authorization_routes_abbr } from "@/constants/Non_authorization_routes";
import { toast } from "react-toastify";

type TCallMethod = "GET" | "POST" | "DELETE" | "PUT" | "post";

interface ISendData {
  url: string;
  call_method: string;
  jsonrpc_v: string;
  mode: string;
  json_rpc_method: string;
  contentType: string;
  accept: string;
  params: object | undefined | null;
  responseType: any;
  id: number;
  data: object | undefined | null;
}

const initial_send_data = {
  url: "",
  call_method: "POST", // In jsonrpc protocol, all requests are POST.
  jsonrpc_v: "2.0",
  mode: "cors",
  json_rpc_method: "", // ex: "call"
  contentType: "application/json",
  accept: "application/json",
  params: null,
  responseType: null,
  id: 0,
  data: null,
};

class ApiBuilder {
  send_data: ISendData = initial_send_data;

  SS_SessionId: any;
  unregister: any;
  onSuccess: any;
  onError: any;

  setBody(body: any) {
    if (!body) {
      this.send_data.data = undefined;
      return this;
    }

    if (this.send_data.call_method !== AXIOSMETHOD.JSON) {
      let data: any = typeof window !== "undefined" ? new FormData() : {};

      Object.keys(body).forEach((element, i) => {
        data.append(element, Object.values(body)[i]);
      });
      this.send_data.data = data;
    } else {
      this.send_data.call_method =
        this.send_data.call_method === AXIOSMETHOD.JSON
          ? AXIOSMETHOD.POST
          : this.send_data.call_method;
      this.send_data.data = body;
    }

    return this;
  }

  setParams(params: any) {
    this.send_data.params = params;
    return this;
  }

  // addHeaderItem(name: string, value: string) {
  //   this.send_data[name] = value;
  //   return this;
  // }

  // TODO: ino felan nemidunam darim ya na
  setResponseType(value: any) {
    this.send_data.responseType = value;
    return this;
  }

  setCallMethod(method: TCallMethod) {
    this.send_data.call_method = method;
    return this;
  }

  // jsonrpc method. ex: "call"
  setJsonRpcMethod(method: string) {
    this.send_data.json_rpc_method = method;
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
    this.send_data = initial_send_data;
  }

  async call() {
    const generatedId = new Date().getUTCMilliseconds();

    const shallowCpOfSendData = { ...this.send_data };
    this.resetSendData();

    try {
      const response = await client({
        method: shallowCpOfSendData.call_method,
        url: shallowCpOfSendData.url,
        headers: {
          "Content-Type": shallowCpOfSendData.contentType,
          Accept: shallowCpOfSendData.accept,
          // Cookie: this.SS_SessionId + ";" || getUserToken() + ";",
        },
        data: !!shallowCpOfSendData.data
          ? shallowCpOfSendData.data
          : {
              jsonrpc: shallowCpOfSendData.jsonrpc_v,
              method: shallowCpOfSendData.json_rpc_method,
              params: shallowCpOfSendData.params,
              id: generatedId,
            },
      });

      if (!!shallowCpOfSendData.data) {
        // Request had FormData. response does not need to be parsed.
        return response;
      } else {
        // Parsing API Response
        const data = JSON.parse(response?.data?.result);

        if (!!data && data?.status === "error" && data?.err_msg === "کاربر یافت نشد.") {
          if (typeof window !== "undefined") {
            if (
              window?.location?.pathname !== "/" &&
              !Non_authorization_routes_abbr.find((el) =>
                (window?.location?.pathname).startsWith(el)
              )
            ) {
              toast.info("جهت مشاهده این صفحه، لطفا وارد سیستم شوید.", {
                // Note: to avoid this toast's duplication, we provide a custom id for it.
                toastId: "user-not-found",
              });
              // console.log(window.location);
              window.location.assign(
                `/auth/enter_phone?redirectTo=${window?.location?.pathname}${
                  window?.location?.search || ""
                }`
              );
            }
          }
        }

        return data;
      }
    } catch (error: any) {
      if (this.onError) {
        this.onError();
      }

      return error.response;
    } finally {
      this.setBody(undefined);
      this.setParams({});
    }
  }
}

let apiBuilder = new ApiBuilder();

export default apiBuilder;
